const mongoose = require('mongoose');

const WorkshopSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['live', 'recorded'],
      required: true,
    },
    category: { type: String, required: true },
    thumbnail: { type: String },
    contentUrl: { type: String, required: true },
    scheduledAt: { type: Date },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workshop', WorkshopSchema);