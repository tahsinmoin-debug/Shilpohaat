const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Moderation
  isApproved: {
    type: Boolean,
    default: true // Auto-approve, but admin can change
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  
  // Instructor response
  instructorResponse: {
    text: String,
    respondedAt: Date
  },
  
  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean
  }]
}, {
  timestamps: true
});

// Compound index - one review per user per workshop
ReviewSchema.index({ workshop: 1, user: 1 }, { unique: true });

// Index for queries
ReviewSchema.index({ workshop: 1, isApproved: 1, rating: -1 });

module.exports = mongoose.model('Review', ReviewSchema);