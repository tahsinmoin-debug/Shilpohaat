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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ArtistProfile', ArtistProfileSchema);
