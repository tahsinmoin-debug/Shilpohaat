const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostBySlug,
  getFeaturedPosts,
  getLatestPosts,
} = require('../controllers/blogController.js');



// POST: Create new blog (Add this route)
router.post('/blogs', async (req, res) => {
  try {
    const { title, content, category, author, featuredImage, tags, isPublished } = req.body;
    
    const newBlog = new Blog({
      title,
      content,
      category,
      author,
      featuredImage,
      tags,
      isPublished
    });
    
    await newBlog.save();
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: newBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
});




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