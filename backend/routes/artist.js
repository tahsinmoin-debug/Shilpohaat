const express = require('express');
const router = express.Router();
const { updateArtistProfile, getAllArtists, getArtistById } = require('../controllers/artistController.js');

// GET /api/artist/all (public)
router.get('/all', getAllArtists);

// PATCH /api/artist/profile?firebaseUID=...
router.patch('/profile', updateArtistProfile);

// GET /api/artist/:id (public)
router.get('/:id', getArtistById);

module.exports = router;
