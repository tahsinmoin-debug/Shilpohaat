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
      enum: ['buyer', 'artist'],
      default: 'buyer',
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

module.exports = mongoose.model('User', UserSchema);
