const express = require("express");
const router = express.Router();
const {
  getRecommendations,
  getQuickRecommendations,
} = require("../controllers/recommendationController");

/**
 * POST /api/recommendations
 * Get AI-ranked artwork recommendations based on user preferences
 * Body: { category, budget_min, budget_max, materials, limit }
 */
router.post("/", getRecommendations);

/**
 * POST /api/recommendations/quick
 * Get quick recommendations from natural language query
 * Body: { query: "I want modern art under 5000 taka" }
 */
router.post("/quick", getQuickRecommendations);

module.exports = router;
