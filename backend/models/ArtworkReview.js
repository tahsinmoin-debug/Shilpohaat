const mongoose = require('mongoose');

const ArtworkReviewSchema = new mongoose.Schema(
  {
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true,
    },
    reviewerId: {
      type: String,
      required: true,
      trim: true,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

ArtworkReviewSchema.index({ artwork: 1, reviewerId: 1 }, { unique: true });
ArtworkReviewSchema.index({ artwork: 1, createdAt: -1 });

module.exports = mongoose.model('ArtworkReview', ArtworkReviewSchema);
