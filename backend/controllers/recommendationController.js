const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const Artwork = require("../models/Artwork");
const User = require("../models/User"); // Required for populate to work
const ArtistProfile = require("../models/ArtistProfile"); // Required for nested populate

// Initialize Google Gemini client
// Note: Ensure GEMINI_API_KEY is in your .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const AI_CATEGORY_MAP = {
  abstract: "Abstract",
  landscape: "Landscape",
  portrait: "Portrait",
  "modern art": "Modern Art",
  modern: "Modern Art",
  "traditional art": "Traditional Art",
  traditional: "Traditional Art",
  "nature & wildlife": "Nature & Wildlife",
  nature: "Nature & Wildlife",
  wildlife: "Nature & Wildlife",
  cityscape: "Cityscape",
  floral: "Floral Art",
  "floral art": "Floral Art",
  minimalist: "Minimalist",
  "pop art": "Pop Art",
  pop: "Pop Art",
  "digital art": "Digital Art",
  digital: "Digital Art",
  acrylic: "Acrylic",
  oil: "Oil",
  watercolor: "Watercolor",
  "mixed media": "Mixed Media",
};

const getLimitNum = (limit) => Math.min(Math.max(Number(limit) || 5, 3), 20);

const buildRecommendationFilters = ({ category, budget_min, budget_max, materials } = {}) => {
  const filters = {
    status: "available",
    // Match storefront behavior (approved + pending + legacy docs without moderationStatus)
    $or: [
      { moderationStatus: "approved" },
      { moderationStatus: "pending" },
      { moderationStatus: { $exists: false } },
      { moderationStatus: null },
    ],
  };

  const normalizedCategory = normalizeCategory(category);

  if (normalizedCategory && normalizedCategory !== "All") {
    filters.category = normalizedCategory;
  }

  if (budget_min || budget_max) {
    filters.price = {};
    if (budget_min) filters.price.$gte = Number(budget_min);
    if (budget_max) filters.price.$lte = Number(budget_max);
  }

  if (materials) {
    filters.materials = { $in: [new RegExp(materials, 'i')] };
  }

  return filters;
};

const normalizeCategory = (value) => {
  if (!value || typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned) return null;

  const lowered = cleaned.toLowerCase();
  if (AI_CATEGORY_MAP[lowered]) return AI_CATEGORY_MAP[lowered];

  // Fallback: match known category ignoring case
  const knownCategories = Object.values(AI_CATEGORY_MAP);
  const exact = knownCategories.find((cat) => cat.toLowerCase() === lowered);
  return exact || cleaned;
};

const extractBudgetFromText = (query = "") => {
  const lowered = String(query).toLowerCase();

  const underMatch = lowered.match(/(?:under|below|max|within)\s*(\d[\d,]*)/i);
  if (underMatch?.[1]) {
    return Number(underMatch[1].replace(/,/g, ""));
  }

  const uptoMatch = lowered.match(/(?:up to|upto|less than)\s*(\d[\d,]*)/i);
  if (uptoMatch?.[1]) {
    return Number(uptoMatch[1].replace(/,/g, ""));
  }

  const plainNumber = lowered.match(/\b(\d{3,})\b/);
  if (plainNumber?.[1]) {
    return Number(plainNumber[1]);
  }

  return null;
};

const inferPreferencesWithoutAI = (query = "") => {
  const lowered = String(query).toLowerCase();

  const matchedCategoryKey = Object.keys(AI_CATEGORY_MAP)
    .sort((a, b) => b.length - a.length)
    .find((key) => lowered.includes(key));

  const materials =
    (lowered.includes("watercolor") && "Watercolor") ||
    (lowered.includes("oil") && "Oil") ||
    (lowered.includes("acrylic") && "Acrylic") ||
    (lowered.includes("mixed media") && "Mixed Media") ||
    null;

  return {
    category: matchedCategoryKey ? AI_CATEGORY_MAP[matchedCategoryKey] : null,
    max_budget: extractBudgetFromText(query),
    materials,
  };
};

const safeJsonObjectFromText = (text) => {
  if (!text || typeof text !== "string") return null;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
};

const safeJsonArrayFromText = (text) => {
  if (!text || typeof text !== "string") return [];
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
};

const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is unavailable. Use Node.js 18+ to call Gemini REST API.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${body}`);
  }

  const data = await response.json();
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n")
      .trim() || ""
  );
};

const rankArtworksWithAI = async ({ aiPrompt, filteredArtworks, limitNum }) => {
  let aiResponse = "";

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: aiPrompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });
      aiResponse = completion.choices?.[0]?.message?.content?.trim() || "";
    } catch (err) {
      console.error("[RECOMMENDATIONS] OpenAI ranking failed:", err.message);
    }
  }

  if (!aiResponse && process.env.GEMINI_API_KEY) {
    try {
      aiResponse = await callGemini(aiPrompt);
    } catch (err) {
      console.error("[RECOMMENDATIONS] Gemini ranking failed:", err.message);
    }
  }

  const rankedIds = safeJsonArrayFromText(aiResponse);

  if (!rankedIds.length) {
    return filteredArtworks
      .sort((a, b) => a.price - b.price)
      .slice(0, limitNum)
      .map((a) => ({ ...a, aiReason: "Great match for your request and budget" }));
  }

  const recommendations = rankedIds
    .slice(0, limitNum)
    .map((item) => {
      const artwork = filteredArtworks.find((a) => a._id.toString() === item.artworkId);
      return artwork
        ? {
            ...artwork,
            aiReason: item.reason || "Great fit for your preferences",
          }
        : null;
    })
    .filter(Boolean);

  if (recommendations.length < limitNum) {
    const already = new Set(recommendations.map((r) => r._id.toString()));
    const fillers = filteredArtworks
      .filter((a) => !already.has(a._id.toString()))
      .sort((a, b) => a.price - b.price)
      .slice(0, limitNum - recommendations.length)
      .map((a) => ({ ...a, aiReason: "Good match for your budget and style" }));
    recommendations.push(...fillers);
  }

  return recommendations.slice(0, limitNum);
};

const fetchFallbackRecommendations = async (body, limitNum) => {
  const filters = buildRecommendationFilters(body);
  return Artwork.find(filters)
    .populate('artist', 'name bio specializations')
    .sort({ price: 1 })
    .limit(limitNum)
    .lean();
};

/**
 * Get AI-powered artwork recommendations
 * POST /api/recommendations
 * Body: { category, budget_min, budget_max, materials, limit = 5 }
 */
exports.getRecommendations = async (req, res) => {
  const limitNum = getLimitNum(req.body?.limit);

  try {
    const { category, budget_min, budget_max, materials } = req.body;

    console.log('[RECOMMENDATIONS] Filters applied:', { category, budget_min, budget_max, materials });

    // Step 1: Build MongoDB query filters
    const filters = buildRecommendationFilters({ category, budget_min, budget_max, materials });

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
    const recommendations = await rankArtworksWithAI({ aiPrompt, filteredArtworks, limitNum });

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
      fallback: !(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);

    // Fallback: return basic filtered results
    try {
      const fallbackResults = await fetchFallbackRecommendations(req.body, limitNum);

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

    if (!query || !String(query).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    // Step 1: Use AI (OpenAI first, Gemini fallback) to extract preferences
    const extractionPrompt = `Extract artwork preferences from this query: "${query}"
Return a JSON object with: { category: "string or null", max_budget: number or null, materials: "string or null" }
Return ONLY the JSON, no extra text.`;
    let extractedText = "";

    if (openai) {
      try {
        const extractionResponse = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [{ role: "user", content: extractionPrompt }],
          temperature: 0.3,
          max_tokens: 200,
        });
        extractedText = extractionResponse.choices?.[0]?.message?.content?.trim() || "";
      } catch (err) {
        console.error("[RECOMMENDATIONS] OpenAI extraction failed:", err.message);
      }
    }

    if (!extractedText && process.env.GEMINI_API_KEY) {
      try {
        extractedText = await callGemini(extractionPrompt);
      } catch (err) {
        console.error("[RECOMMENDATIONS] Gemini extraction failed:", err.message);
      }
    }

    let preferences = safeJsonObjectFromText(extractedText);
    if (!preferences) {
      preferences = inferPreferencesWithoutAI(query);
    }

    // Step 2: Get recommendations using the extracted preferences
    req.body = {
      category: normalizeCategory(preferences.category),
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
