const mongoose = require('mongoose');

const WorkshopSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true, // You can use the same categories as Artworks
  },
  thumbnail: { type: String }, // Cloudinary URL
  contentUrl: { type: String, required: true }, // Video URL or Live Meeting Link
  scheduledAt: { type: Date }, // Required only for 'live'
  duration: { type: String }, // e.g., "60 mins"
  price: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Workshop', WorkshopSchema);