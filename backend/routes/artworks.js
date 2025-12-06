const express = require('express');
const router = express.Router();
const {
  createArtwork,
  getAllArtworks,
  getArtwork,
  getArtworksByArtist,
} = require('../controllers/artworkController.js');

// GET /api/artworks - Get all artworks
router.get('/', getAllArtworks);

// GET /api/artworks/:id - Get single artwork
router.get('/:id', getArtwork);

// GET /api/artworks/artist/:artistId - Get artworks by artist
router.get('/artist/:artistId', getArtworksByArtist);

// POST /api/artworks - Create new artwork
router.post('/', createArtwork);

module.exports = router;
