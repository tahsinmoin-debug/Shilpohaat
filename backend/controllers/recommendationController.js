const { GoogleGenerativeAI } = require("@google/generative-ai");
const Artwork = require("../models/Artwork");
const User = require("../models/User"); // Required for populate to work
const ArtistProfile = require("../models/ArtistProfile"); // Required for nested populate

// Initialize Google Gemini client
// Note: Ensure GEMINI_API_KEY is in your .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Get AI-powered artwork recommendations
 * POST /api/recommendations
 * Body: { category, budget_min, budget_max, materials, limit = 5 }
 */
exports.getRecommendations = async (req, res) => {
  const { category, budget_min, budget_max, materials, limit = 5 } = req.body;
  const limitNum = Math.min(Math.max(Number(limit) || 5, 3), 20); // keep between 3 and 20

  try {

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
      .populate({
        path: "artist",
        select: "name artistProfile",
        populate: {
          path: "artistProfile",
          select: "bio specializations artistStory",
        },
      })
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

    // Step 3: Prepare data for AI
    const artworkList = filteredArtworks.map((art) => {
      const profile = art.artist?.artistProfile;
      return {
        id: art._id.toString(),
        title: art.title,
        price: art.price,
        category: art.category,
        materials: art.materials, // Added materials
        artist: art.artist?.name || "Unknown",
        artist_bio: profile?.bio || "A talented local artist.",
        artist_specialization: profile?.specializations?.join(", ") || "General",
        description: art.description || "",
      };
    });

    // Step 4: Call Gemini API to rank artworks
    const aiPrompt = `You are a passionate Bengali Art Curator for ShilpoHaat.
    
User Preferences:
- Budget: ৳${budget_min || "Any"} - ৳${budget_max || "Any"}
- Category: ${category || "Any"}
- Materials: ${materials || "Any"}

Candidate Artworks:
${JSON.stringify(artworkList, null, 2)}

Task:
1. Select the TOP ${limitNum} artworks that best match the user's taste and budget.
2. For each, write a "curator's note" (reason). Be storytelling and evocative.
3. Return ONLY a valid JSON array.
   - Format: [ { "artworkId": "id", "reason": "Story-driven note (max 150 chars)" } ]
4. Do not include Markdown formatting (like \`\`\`json). Just the raw JSON.`;

    let rankedIds = [];
    let aiReasonGlobal = "Curated just for you.";

    try {
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const aiResponse = response.text().trim();

      // Remove any markdown code block syntax if present
      const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      rankedIds = JSON.parse(cleanJson);
      aiReasonGlobal = `Based on your preferences for ${category || "any category"} art within your budget, I've curated these pieces. Each combines artistic merit, value, and uniqueness.`;
    } catch (aiError) {
      console.error("AI Generation/Parsing failed:", aiError);
      // We will fall back to price sorting below
    }

    if (rankedIds.length === 0) {
      // Fallback: return filtered results in price ascending order
      return res.status(200).json({
        success: true,
        recommendations: filteredArtworks
          .sort((a, b) => a.price - b.price)
          .slice(0, limit),
        aiExplanation: "AI ranking unavailable. Showing best matches by price.",
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
      aiExplanation: aiReasonGlobal,
      fallback: false,
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
      error: error.message,
    });
  }
};

/**
 * Get quick recommendations based on simple query
 * Used by the chatbot for quick suggestions
 */
exports.getQuickRecommendations = async (req, res) => {
  try {
    const { query } = req.body; // e.g., "I want modern art under 5000 taka"

    // Step 1: Use Gemini to extract preferences from natural language
    const extractionPrompt = `Extract artwork preferences from this query: "${query}"
Return a JSON object with: { category: "string or null", max_budget: number or null, materials: "string or null" }
Return ONLY the raw JSON, no markdown.`;

    let preferences = {};

    try {
      const result = await model.generateContent(extractionPrompt);
      const extractedText = result.response.text().trim();
      const cleanJson = extractedText.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) preferences = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("AI Extraction failed:", e);
      // continue with empty preferences
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
