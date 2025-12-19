const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Firebase UID
    badgeName: { type: String, required: true }, // e.g., "Top Seller"
    badgeIcon: { type: String, required: true }, // Emoji or Image URL
    badgeCategory: { 
        type: String, 
        enum: ['Sales', 'Activity', 'Community', 'Verification'], 
        required: true 
    },
    earnedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure an artist doesn't get the same badge twice
badgeSchema.index({ userId: 1, badgeName: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);