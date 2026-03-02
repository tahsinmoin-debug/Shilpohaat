const express = require('express');
const router = express.Router();
const { 
  updateArtistProfile, 
  getAllArtists,
  getFeaturedArtists,
  getArtistById,
  getHubArtists 
} = require('../controllers/artistController.js');

// Public routes
router.get('/all', getAllArtists);
router.get('/featured', getFeaturedArtists);

// Messaging Hub specific route (MUST be before /:id to avoid conflict)
router.get('/hub-artists', getHubArtists);

// Dynamic ID route (MUST be last among GET routes)
router.get('/:id', getArtistById); 

// Protected route
router.patch('/profile', updateArtistProfile);

module.exports = router;