const BlogPost = require('../models/BlogPost.js');

// Get all blog posts (with filters)
const getAllPosts = async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1 } = req.query;

    // Build query
    let query = { status: 'published' };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await BlogPost.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BlogPost.countDocuments(query);

    return res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get single blog post by slug
const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ slug, status: 'published' });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    await post.incrementViews();

    return res.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get featured posts (for homepage)
const getFeaturedPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const posts = await BlogPost.find({ 
      status: 'published',
      featured: true 
    })
      .sort({ publishedAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Get featured posts error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get latest posts
const getLatestPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const posts = await BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Get latest posts error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllPosts,
  getPostBySlug,
  getFeaturedPosts,
  getLatestPosts,
};