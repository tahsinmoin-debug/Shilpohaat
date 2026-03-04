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
router.get('/artist/:artistId', getArtworksByArtist);

// GET /api/artworks/:id - Get single artwork
router.get('/:id', getArtwork);

// POST /api/artworks - Create new artwork
router.post('/', createArtwork);

module.exports = router;
