const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: { 
        type: String, // Firebase UID
        required: true 
    },
    artworks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artwork'
    }],
    artists: [{
        type: String // Array of Artist Firebase UIDs
    }]
}, { timestamps: true });

// Ensure one wishlist per user
wishlistSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);