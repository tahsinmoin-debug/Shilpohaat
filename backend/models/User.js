const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    role: {
      type: String,
      enum: ['buyer', 'artist', 'admin'],
      default: 'buyer',
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    artistProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtistProfile',
    },
  },
  {
    timestamps: true,
  }
);

// Query hot paths for auth/admin/artist lookups
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ isSuspended: 1 });

module.exports = mongoose.model('User', UserSchema);
