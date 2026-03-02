const ArtistProfile = require('../models/ArtistProfile.js');
const User = require('../models/User.js');
const Artwork = require('../models/Artwork.js');
const { uploadToCloudinary, uploadMultipleToCloudinary, replaceImages } = require('../utils/cloudinary.js');

// Update artist profile (PATCH /api/artist/profile)
const updateArtistProfile = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    // Find the user
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can update profile' });
    }

    // Find or create artist profile
    let profile = await ArtistProfile.findOne({ user: user._id });
    if (!profile) {
      profile = new ArtistProfile({ user: user._id });
    }

    const {
      bio, specializations, contactPhone, profilePicture,
      portfolioImages, artistStory, skills, website,
      instagram, availability,
    } = req.body;

    if (bio !== undefined) profile.bio = bio;
    if (specializations !== undefined) profile.specializations = specializations;
    if (contactPhone !== undefined) profile.contactPhone = contactPhone;
    
    if (profilePicture !== undefined) {
      if (profilePicture.startsWith('data:') || profilePicture.startsWith('iVBOR')) {
        const result = await uploadToCloudinary(profilePicture, 'shilpohaat/artists/profiles');
        profile.profilePicture = result.url;
      } else {
        profile.profilePicture = profilePicture;
      }
    }
    
    if (portfolioImages !== undefined && Array.isArray(portfolioImages)) {
      const newImages = portfolioImages.filter(img => img.startsWith('data:') || img.startsWith('iVBOR'));
      const existingUrls = portfolioImages.filter(img => img.startsWith('http'));
      
      if (newImages.length > 0) {
        const uploadedUrls = await uploadMultipleToCloudinary(newImages, 'shilpohaat/artists/portfolio');
        profile.portfolioImages = [...existingUrls, ...uploadedUrls];
      } else {
        profile.portfolioImages = existingUrls;
      }
    }
    
    if (artistStory !== undefined) profile.artistStory = artistStory;
    if (skills !== undefined) profile.skills = skills;
    if (website !== undefined) profile.website = website;
    if (instagram !== undefined) profile.instagram = instagram;
    if (availability !== undefined) profile.availability = availability;

    profile.isProfileComplete = !!(profile.bio && profile.specializations.length > 0 && profile.artistStory);

    await profile.save();

    if (!user.artistProfile) {
      user.artistProfile = profile._id;
      await user.save();
    }

    return res.json({ success: true, profile });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Get all artist profiles (public)
const getAllArtists = async (req, res) => {
  try {
    const { letter, search } = req.query;
    let userQuery = { role: 'artist' };
    const users = await User.find(userQuery);
    const userIds = users.map(u => u._id);

    let profileQuery = {
      user: { $in: userIds },
      isProfileComplete: true,
    };

    const profiles = await ArtistProfile.find(profileQuery)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    let filteredProfiles = profiles;
    if (letter) {
      filteredProfiles = profiles.filter(p => p.bio.toLowerCase().startsWith(letter.toLowerCase()));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProfiles = filteredProfiles.filter(p =>
        p.bio.toLowerCase().includes(searchLower) ||
        p.specializations.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    return res.json({ success: true, count: filteredProfiles.length, artists: filteredProfiles });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// NEW: Get featured artists
const getFeaturedArtists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const users = await User.find({ role: 'artist' });
    const userIds = users.map(u => u._id);

    let profiles = await ArtistProfile.find({ user: { $in: userIds }, isProfileComplete: true })
      .populate('user', 'name email')
      .limit(limit);

    const scoredProfiles = profiles.map(profile => {
      let score = 0;
      if (profile.isFeatured) score += 1000;
      if (profile.rating) score += profile.rating * 100;
      if (profile.profileViews) score += Math.min(profile.profileViews, 1000) * 0.3;
      if (profile.totalArtworks) score += Math.min(profile.totalArtworks, 50) * 4;
      return { ...profile.toObject(), score };
    });

    scoredProfiles.sort((a, b) => b.score - a.score);
    const featuredArtists = scoredProfiles.slice(0, limit);
    return res.json({ success: true, count: featuredArtists.length, artists: featuredArtists });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get single artist profile
const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    let profile = await ArtistProfile.findById(id).populate('user', 'name email role artistProfile');
    if (!profile) {
      profile = await ArtistProfile.findOne({ user: id }).populate('user', 'name email role artistProfile');
    }
    if (!profile || !profile.isProfileComplete) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    const artworks = await Artwork.find({ artist: profile.user._id }).sort({ createdAt: -1 }).limit(20);
    return res.json({ success: true, artist: profile, artworks });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * UPDATED: getHubArtists - Universal Messaging
 * Returns ALL users (artists, buyers, everyone) for universal messaging.
 * Anyone can message anyone.
 */
const getHubArtists = async (req, res) => {
    try {
        // Get ALL users regardless of role
        const users = await User.find({})
            .select('firebaseUID name email role')
            .lean();

        const userList = users.map(user => ({
            id: user.firebaseUID,
            name: user.name || user.email?.split('@')[0] || 'User',
            role: user.role || 'buyer'
        }));

        // Return array directly
        res.json(userList); 
    } catch (error) {
        console.error('Hub Users Error:', error);
        res.status(500).json({ message: 'Failed to retrieve user list.' });
    }
};

module.exports = {
  updateArtistProfile,
  getAllArtists,
  getFeaturedArtists,
  getArtistById,
  getHubArtists,
};