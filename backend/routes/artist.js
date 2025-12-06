const express = require('express');
const router = express.Router();
const { updateArtistProfile, getAllArtists } = require('../controllers/artistController.js');

// GET /api/artist/all (public)
router.get('/all', getAllArtists);

// PATCH /api/artist/profile?firebaseUID=...
router.patch('/profile', updateArtistProfile);

module.exports = router;
