// backend/controllers/reviewController.js

const Review = require('../models/Review');
const mongoose = require('mongoose');

// Ensure Artwork model is loaded
try {
    mongoose.model('Artwork'); 
} catch (e) {
    require('../models/Artwork'); 
}

exports.getArtworkReviews = async (req, res) => {
    try {
        // Use req.params.artworkId to match the route definition
        const reviews = await Review.find({ artwork: req.params.artworkId })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching reviews.' });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { artworkId } = req.params;
        const { rating, comment, reviewerId, reviewerName } = req.body;

        // 1. Validation
        if (!mongoose.Types.ObjectId.isValid(artworkId)) {
            return res.status(400).json({ success: false, message: 'Invalid artwork ID format.' });
        }
        if (!rating || !comment || !reviewerId) {
            return res.status(400).json({ success: false, message: 'Missing required fields (rating, comment, or ID).' });
        }

        // 2. Check for duplicate review (One user, one review per artwork)
        const existingReview = await Review.findOne({ 
            artwork: new mongoose.Types.ObjectId(artworkId), 
            reviewerId 
        });
        
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already submitted a review for this artwork.' });
        }

        // 3. Create Review
        const newReview = await Review.create({ 
            artwork: new mongoose.Types.ObjectId(artworkId), 
            reviewerId, 
            reviewerName: reviewerName || 'Anonymous User', 
            rating, 
            comment 
        });

        res.status(201).json({ 
            success: true, 
            message: 'Review submitted successfully.', 
            review: newReview 
        });

    } catch (error) {
        console.error("FATAL Error submitting review:", error);
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: message.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error during review submission.' });
    }
};