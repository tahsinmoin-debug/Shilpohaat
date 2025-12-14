const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema(
  {
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'Abstract', 'Landscape', 'Portrait', 'Modern Art', 'Traditional Art', 
        'Nature & Wildlife', 'Cityscape', 'Floral Art', 'Minimalist', 'Pop Art',
        'Digital Art', 'Acrylic', 'Oil', 'Watercolor', 'Mixed Media'
      ],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
      unit: { type: String, default: 'cm' },
    },
    materials: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved'],
      default: 'available',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Artwork', ArtworkSchema);
