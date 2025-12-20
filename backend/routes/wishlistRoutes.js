const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

// Toggle Artwork in Wishlist
router.post('/toggle', async (req, res) => {
    const { userId, artworkId } = req.body;
    try {
        let wishlist = await Wishlist.findOne({ userId });
        
        if (!wishlist) {
            wishlist = new Wishlist({ userId, artworks: [artworkId] });
            await wishlist.save();
            return res.json({ message: "Added to wishlist", isAdded: true });
        }

        const index = wishlist.artworks.indexOf(artworkId);
        if (index > -1) {
            wishlist.artworks.splice(index, 1);
            await wishlist.save();
            return res.json({ message: "Removed from wishlist", isAdded: false });
        } else {
            wishlist.artworks.push(artworkId);
            await wishlist.save();
            return res.json({ message: "Added to wishlist", isAdded: true });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Wishlist Artworks
router.get('/:userId', async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.params.userId })
            .populate('artworks');
        res.json(wishlist ? wishlist.artworks : []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;