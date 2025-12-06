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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ArtistProfile', ArtistProfileSchema);
