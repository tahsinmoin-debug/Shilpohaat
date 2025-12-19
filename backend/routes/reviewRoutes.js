const express = require('express');
const { getArtworkReviews, createReview } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true }); // Merge params for routing

// Route for reviews: /:artworkId/reviews
router.route('/:artworkId/reviews')
    .get(getArtworkReviews)   
    .post(createReview);      

module.exports = router;