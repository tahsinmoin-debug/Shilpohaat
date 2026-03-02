const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

// Create promotion
router.post('/', promotionController.createPromotion);

// Get artist promotions
router.get('/artist/:artistId', promotionController.getArtistPromotions);

// Delete promotion
router.delete('/:id', promotionController.deletePromotion);

// Validate coupon
router.post('/validate', promotionController.validateCoupon);

// Apply coupon (increment usage)
router.post('/apply', promotionController.applyCoupon);

module.exports = router;