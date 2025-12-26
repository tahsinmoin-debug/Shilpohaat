const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    artwork: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artwork', // Reference to Artwork
        required: true,
    },
    reviewerId: {
        type: String, // Firebase UID
        required: true,
    },
    reviewerName: {
        type: String,
        required: true,
        trim: true,
        default: 'Anonymous User',
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
        maxlength: 500,
    },
    isRemoved: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

ReviewSchema.index({ artwork: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);