const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostBySlug,
  getFeaturedPosts,
  getLatestPosts,
} = require('../controllers/blogController.js');

// GET /api/blog (all posts with pagination)
router.get('/', getAllPosts);

// GET /api/blog/featured (featured posts)
router.get('/featured', getFeaturedPosts);

// GET /api/blog/latest (latest posts)
router.get('/latest', getLatestPosts);

// GET /api/blog/:slug (single post by slug)
router.get('/:slug', getPostBySlug);

router.post('/', createPost);

module.exports = router;