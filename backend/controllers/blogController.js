const BlogPost = require('../models/BlogPost.js');
const { uploadToCloudinary } = require('../utils/cloudinary.js');

// Create a new blog post
const createPost = async (req, res) => {
  try {
    // 1. Get data from the frontend
    const { title, slug, excerpt, content, coverImage, category, authorName, tags } = req.body;

    // 2. Validate required fields (basic check)
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // 3. Upload cover image to Cloudinary if provided as base64
    let coverImageUrl = coverImage;
    if (coverImage && coverImage.startsWith('data:image')) {
      try {
        const uploadResult = await uploadToCloudinary(coverImage, 'shilpohaat/blog');
        coverImageUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Cover image upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload cover image', 
          error: uploadError.message 
        });
      }
    }

    // 4. Create the new post object
    const newPost = new BlogPost({
      title,
      slug, // NOTE: In a real app, you might want to auto-generate this from the title
      excerpt,
      content,
      coverImage: coverImageUrl,
      category,
      author: {
        name: authorName || 'Admin', // Default name if none provided
        avatar: ''
      },
      tags: tags || [],
      status: 'published' // Default to published for now
    });

    // 5. Save to the Cloud Database
    const savedPost = await newPost.save();

    return res.status(201).json({
      success: true,
      post: savedPost,
      message: 'Blog post created successfully!'
    });

  } catch (error) {
    console.error('Create post error:', error);
    // Check for duplicate slug error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A post with this slug already exists.' });
    }
    return res.status(500).json({ message: 'Server error while creating post.' });
  }
};


// Get all blog posts (with dynamic sorting)
const getAllPosts = async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1, sort = 'short' } = req.query;

    let query = { status: 'published' };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    
    const readTimeOrder = sort === 'long' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await BlogPost.find(query)
      .sort({ readTime: readTimeOrder, publishedAt: -1 })
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
  createPost,
  getAllPosts,
  getPostBySlug,
  getFeaturedPosts,
  getLatestPosts,
};