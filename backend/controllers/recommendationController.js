const OpenAI = require("openai");
const Artwork = require("../models/Artwork");
const User = require("../models/User"); // Required for populate to work

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get AI-powered artwork recommendations
 * POST /api/recommendations
 * Body: { category, budget_min, budget_max, materials, limit = 5 }
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { category, budget_min, budget_max, materials, limit = 5 } = req.body;
    const limitNum = Math.min(Math.max(Number(limit) || 5, 3), 20); // keep between 3 and 20

    console.log('[RECOMMENDATIONS] Filters applied:', { category, budget_min, budget_max, materials });

    // Step 1: Build MongoDB query filters
    const filters = { moderationStatus: 'approved', status: 'available' }; // Only recommend approved, available artworks

    if (category && category !== "All") {
      filters.category = category;
    }

    if (budget_min || budget_max) {
      filters.price = {};
      if (budget_min) filters.price.$gte = Number(budget_min);
      if (budget_max) filters.price.$lte = Number(budget_max);
    }

    // Optional: filter by materials if provided
    if (materials) {
      filters.materials = { $in: [new RegExp(materials, 'i')] };
    }

    // Step 2: Fetch filtered artworks from MongoDB
    const filteredArtworks = await Artwork.find(filters)
      .populate("artist", "name bio specializations")
      .limit(50) // get a larger candidate pool for better recall
      .lean();

    console.log('[RECOMMENDATIONS] Found', filteredArtworks.length, 'artworks matching filters');

    if (filteredArtworks.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        aiExplanation: "No artworks match your preferences.",
        fallback: true,
      });
    }

    // Step 3: Prepare data for OpenAI
    const artworkList = filteredArtworks.map((art) => ({
      id: art._id.toString(),
      title: art.title,
      price: art.price,
      category: art.category,
      artist: art.artist?.name || "Unknown",
      description: art.description || "",
      hasAR: art.arModelUrl ? true : false,
    }));

    // Step 4: Call OpenAI API to rank artworks
    const aiPrompt = `You are an expert art curator for ShilpoHaat, a Bengali art marketplace.
    
A user with the following preferences is looking for artwork recommendations:
- Budget Range: ৳${budget_min || "Any"} - ৳${budget_max || "Any"}
- Category: ${category || "Any"}
- Materials Preference: ${materials || "Any"}

Here are ${artworkList.length} filtered artworks that match the budget and category:
${JSON.stringify(artworkList, null, 2)}

Your task:
1. Rank the TOP ${limitNum} MOST SUITABLE artworks for this user
2. Consider: artistic quality, price value, artist reputation, material match, and uniqueness
3. Return ONLY a valid JSON array (no extra text)
4. Each item must have: { "artworkId": "id_string", "reason": "short reason (max 50 chars)" }

IMPORTANT: Return ONLY the JSON array, nothing else. Start with [ and end with ]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for faster/cheaper responses
      messages: [
        {
          role: "user",
          content: aiPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content.trim();

    // Step 5: Parse AI response
    let rankedIds = [];
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      rankedIds = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      // Fallback: return filtered results in price ascending order
      return res.status(200).json({
        success: true,
        recommendations: filteredArtworks
          .sort((a, b) => a.price - b.price)
          .slice(0, limit),
        aiExplanation:
          "AI ranking unavailable. Showing best matches by price.",
        fallback: true,
      });
    }

    // Step 6: Map ranked IDs back to full artwork objects
    const recommendations = rankedIds
      .slice(0, limitNum)
      .map((item) => {
        const artwork = filteredArtworks.find(
          (a) => a._id.toString() === item.artworkId
        );
        return artwork
          ? {
              ...artwork,
              aiReason: item.reason,
            }
          : null;
      })
      .filter((item) => item !== null);

    // If AI returned fewer than requested, top up with remaining filtered items
    if (recommendations.length < limitNum) {
      const already = new Set(recommendations.map((r) => r._id.toString()));
      const fillers = filteredArtworks
        .filter((a) => !already.has(a._id.toString()))
        .sort((a, b) => a.price - b.price)
        .slice(0, limitNum - recommendations.length)
        .map((a) => ({ ...a, aiReason: a.aiReason || 'Good match for your budget and style' }));
      recommendations.push(...fillers);
    }

    // Step 7: Return ranked recommendations with AI explanation
    res.status(200).json({
      success: true,
      recommendations: recommendations.slice(0, limitNum),
      aiExplanation: `Based on your preferences for ${category || "any category"} art within your budget, I've curated these pieces. Each combines artistic merit, value, and uniqueness.`,
      fallback: false,
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);

    // Fallback: return basic filtered results
    try {
      const filters = { moderationStatus: 'approved', status: 'available' };
      if (req.body.category && req.body.category !== "All") {
        filters.category = req.body.category;
      }
      if (req.body.budget_min || req.body.budget_max) {
        filters.price = {};
        if (req.body.budget_min) filters.price.$gte = Number(req.body.budget_min);
        if (req.body.budget_max) filters.price.$lte = Number(req.body.budget_max);
      }

      const fallbackResults = await Artwork.find(filters)
        .populate("artist", "name bio specializations")
        .limit(limitNum)
        .lean();

      res.status(200).json({
        success: true,
        recommendations: fallbackResults,
        aiExplanation: "Showing curated results (AI unavailable).",
        fallback: true,
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: "Failed to get recommendations",
        error: fallbackError.message,
      });
    }
  }
};

/**
 * Get quick recommendations based on simple query
 * Used by the chatbot for quick suggestions
 */
exports.getQuickRecommendations = async (req, res) => {
  try {
    const { query } = req.body; // e.g., "I want modern art under 5000 taka"

    // Step 1: Use OpenAI to extract preferences from natural language
    const extractionPrompt = `Extract artwork preferences from this query: "${query}"
Return a JSON object with: { category: "string or null", max_budget: number or null, materials: "string or null" }
Return ONLY the JSON, no extra text.`;

    const extractionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const extractedText = extractionResponse.choices[0].message.content.trim();
    let preferences = {};

    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) preferences = JSON.parse(jsonMatch[0]);
    } catch {
      preferences = {};
    }

    // Step 2: Get recommendations using the extracted preferences
    req.body = {
      category: preferences.category,
      budget_min: 0,
      budget_max: preferences.max_budget,
      materials: preferences.materials,
      limit: 10, // allow richer result set for chatbot
    };

    // Reuse main recommendation logic
    await exports.getRecommendations(req, res);
  } catch (error) {
    console.error("Quick recommendation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process your query",
      error: error.message,
    });
  }
};
