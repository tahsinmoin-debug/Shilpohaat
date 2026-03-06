const express = require('express');
const { getArtworkReviews, createArtworkReview } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true }); // Merge params for routing

// Route for reviews: /:artworkId/reviews
router.route('/:artworkId/reviews')
    .get(getArtworkReviews)   
    .post(createArtworkReview);      

module.exports = router;
