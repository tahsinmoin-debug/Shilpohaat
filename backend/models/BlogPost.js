const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Interview', 'Heritage', 'Art Process', 'News', 'Featured'],
      required: true,
    },
    author: {
      name: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
        default: '',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // in minutes
      default: 5,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

// Method to increment views
BlogPostSchema.methods.incrementViews = async function() {
  this.views = (this.views || 0) + 1;
  await this.save();
};

module.exports = mongoose.model('BlogPost', BlogPostSchema);