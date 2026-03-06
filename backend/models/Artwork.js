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
    inspiration: {
      type: String,
      default: '',
    },
    creationYear: {
      type: Number,
      min: 1000,
      max: 9999,
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
    arModelUrl: {
      type: String,
      default: null,
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
    framingStatus: {
      type: String,
      enum: ['framed', 'unframed', 'not-applicable'],
      default: 'unframed',
    },
    shippingInfo: {
      scope: {
        type: String,
        enum: ['domestic', 'international', 'pickup-only'],
        default: 'domestic',
      },
      dispatchDays: {
        type: Number,
        min: 1,
        max: 90,
        default: 7,
      },
      notes: {
        type: String,
        default: '',
      },
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
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'removed'],
      default: 'pending',
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

// Query hot paths for listing/filtering/recommendation/admin
ArtworkSchema.index({ status: 1, moderationStatus: 1, createdAt: -1 });
ArtworkSchema.index({ category: 1, price: 1, createdAt: -1 });
ArtworkSchema.index({ artist: 1, createdAt: -1 });
ArtworkSchema.index({ featured: 1, createdAt: -1 });

module.exports = mongoose.model('Artwork', ArtworkSchema);
