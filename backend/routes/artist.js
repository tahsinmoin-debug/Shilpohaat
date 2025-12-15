const express = require('express');
const router = express.Router();
const { 
  updateArtistProfile, 
  getAllArtists,
  getFeaturedArtists,
  getArtistById
} = require('../controllers/artistController.js');



// POST: Create new artist (Add this route)
router.post('/artists', async (req, res) => {
  try {
    const { name, bio, profileImage, rating, popularity, isFeatured, specialization, location } = req.body;
    
    const newArtist = new Artist({
      name,
      bio,
      profileImage,
      rating,
      popularity,
      isFeatured,
      specialization,
      location
    });
    
    await newArtist.save();
    
    res.status(201).json({
      success: true,
      message: 'Artist created successfully',
      data: newArtist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating artist',
      error: error.message
    });
  }
});



// GET /api/artist/all (public - all artists)
router.get('/all', getAllArtists);

// GET /api/artist/featured (public - featured artists for homepage)
router.get('/featured', getFeaturedArtists);

// PATCH /api/artist/profile?firebaseUID=... (update artist profile)
router.patch('/profile', updateArtistProfile);

module.exports = router;
