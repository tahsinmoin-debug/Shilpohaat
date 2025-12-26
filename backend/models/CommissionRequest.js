const mongoose = require('mongoose');

const CommissionRequestSchema = new mongoose.Schema(
  {
    buyer: {
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
    style: {
      type: String,
      enum: [
        'Abstract',
        'Landscape',
        'Portrait',
        'Modern Art',
        'Traditional Art',
        'Nature & Wildlife',
        'Cityscape',
        'Floral Art',
        'Minimalist',
        'Pop Art',
        'Digital Art',
        'Acrylic',
        'Oil',
        'Watercolor',
        'Mixed Media',
      ],
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: 'cm' },
    },
    referenceImages: {
      type: [String], // URLs from Cloudinary
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
CommissionRequestSchema.index({ buyer: 1, status: 1 });
CommissionRequestSchema.index({ acceptedBy: 1, status: 1 });
CommissionRequestSchema.index({ status: 1 });

module.exports = mongoose.model('CommissionRequest', CommissionRequestSchema);
