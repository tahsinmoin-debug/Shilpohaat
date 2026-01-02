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
router.get('/:id', getArtistById);

// Messaging Hub specific route
router.get('/hub-artists', getHubArtists); 

// Protected route
router.patch('/profile', updateArtistProfile);

module.exports = router;