const mongoose = require('mongoose');
 
const ReviewSchema = new mongoose.Schema({
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true,
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
  isApproved: {
    type: Boolean,
    default: true,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flagReason: String,
  instructorResponse: {
    text: String,
    respondedAt: Date,
  },
}, { timestamps: true });

ReviewSchema.index({ workshop: 1, user: 1 }, { unique: true });
 
module.exports = mongoose.model('Review', ReviewSchema);
