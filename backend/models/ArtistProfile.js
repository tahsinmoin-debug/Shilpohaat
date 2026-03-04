const mongoose = require('mongoose');

const ArtistProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    specializations: {
      type: [String],
      default: [],
    },
    contactPhone: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    portfolioImages: {
      type: [String],
      default: [],
    },
    // Extended fields
    artistStory: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      default: '',
    },
    instagram: {
      type: String,
      default: '',
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
   
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    profileViews: {
      type: Number,
      default: 0,
    },
    totalArtworks: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
   
  },
  {
    timestamps: true,
  }
);

// Query hot paths for public artist pages/admin
ArtistProfileSchema.index({ user: 1 }, { unique: true });
ArtistProfileSchema.index({ isProfileComplete: 1, createdAt: -1 });
ArtistProfileSchema.index({ isFeatured: 1, rating: -1, profileViews: -1, totalArtworks: -1 });

module.exports = mongoose.model('ArtistProfile', ArtistProfileSchema);
