const express = require('express');
const router = express.Router();
const { 
  updateArtistProfile, 
  getAllArtists,
  getFeaturedArtists,
  getArtistById
} = require('../controllers/artistController.js');

// GET /api/artist/all (public - all artists)
router.get('/all', getAllArtists);

// GET /api/artist/featured (public - featured artists for homepage)
router.get('/featured', getFeaturedArtists);

// PATCH /api/artist/profile?firebaseUID=... (update artist profile)
router.patch('/profile', updateArtistProfile);

// GET /api/artist/:id (public)
router.get('/:id', getArtistById);

module.exports = router;
