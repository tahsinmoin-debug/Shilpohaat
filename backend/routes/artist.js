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
router.get('/hub-artists', getHubArtists);  // MUST be before /:id
router.get('/:id', getArtistById);
 
// Protected route
router.patch('/profile', updateArtistProfile);
 
module.exports = router;
