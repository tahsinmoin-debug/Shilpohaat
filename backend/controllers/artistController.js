const ArtistProfile = require('../models/ArtistProfile.js');
const User = require('../models/User.js');
const Artwork = require('../models/Artwork.js');

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

    // Update fields from request body
    const {
      bio,
      specializations,
      contactPhone,
      profilePicture,
      portfolioImages,
      artistStory,
      skills,
      website,
      instagram,
      availability,
    } = req.body;

    if (bio !== undefined) profile.bio = bio;
    if (specializations !== undefined) profile.specializations = specializations;
    if (contactPhone !== undefined) profile.contactPhone = contactPhone;
    if (profilePicture !== undefined) profile.profilePicture = profilePicture;
    if (portfolioImages !== undefined) profile.portfolioImages = portfolioImages;
    if (artistStory !== undefined) profile.artistStory = artistStory;
    if (skills !== undefined) profile.skills = skills;
    if (website !== undefined) profile.website = website;
    if (instagram !== undefined) profile.instagram = instagram;
    if (availability !== undefined) profile.availability = availability;

    // Mark as complete if key fields are filled
    profile.isProfileComplete = !!(
      profile.bio &&
      profile.specializations.length > 0 &&
      profile.artistStory
    );

    await profile.save();

    // Update user's artistProfile reference if not set
    if (!user.artistProfile) {
      user.artistProfile = profile._id;
      await user.save();
    }

    return res.json({ success: true, profile });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get all artist profiles (public)
const getAllArtists = async (req, res) => {
  try {
    const { letter, search } = req.query;

    // Build query
    let userQuery = { role: 'artist' };
    
    // Find users first
    const users = await User.find(userQuery);
    const userIds = users.map(u => u._id);

    // Find complete profiles
    let profileQuery = {
      user: { $in: userIds },
      isProfileComplete: true,
    };

    const profiles = await ArtistProfile.find(profileQuery)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Filter by letter if provided
    let filteredProfiles = profiles;
    if (letter) {
      filteredProfiles = profiles.filter(p => 
        p.bio.toLowerCase().startsWith(letter.toLowerCase())
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProfiles = filteredProfiles.filter(p =>
        p.bio.toLowerCase().includes(searchLower) ||
        p.specializations.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    return res.json({
      success: true,
      count: filteredProfiles.length,
      artists: filteredProfiles,
    });
  } catch (error) {
    console.error('Get artists error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// NEW: Get featured artists (for homepage)
const getFeaturedArtists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    // Find users who are artists
    const users = await User.find({ role: 'artist' });
    const userIds = users.map(u => u._id);

    // Find complete profiles
    let profiles = await ArtistProfile.find({
      user: { $in: userIds },
      isProfileComplete: true,
    })
      .populate('user', 'name email')
      .limit(limit);

    // Calculate score for each artist based on:
    // 1. Admin selection (isFeatured flag - highest priority)
    // 2. Rating (average rating)
    // 3. Popularity (profile views, total artworks)
    const scoredProfiles = profiles.map(profile => {
      let score = 0;
      
      // Admin featured gets highest score (1000 points)
      if (profile.isFeatured) {
        score += 1000;
      }
      
      // Rating (0-5 scale, worth up to 500 points)
      if (profile.rating) {
        score += profile.rating * 100;
      }
      
      // Profile views (worth up to 300 points, capped at 1000 views)
      if (profile.profileViews) {
        score += Math.min(profile.profileViews, 1000) * 0.3;
      }
      
      // Total artworks (worth up to 200 points, capped at 50 artworks)
      if (profile.totalArtworks) {
        score += Math.min(profile.totalArtworks, 50) * 4;
      }
      
      return {
        ...profile.toObject(),
        score
      };
    });

    // Sort by score (highest first)
    scoredProfiles.sort((a, b) => b.score - a.score);

    // Take top featured artists
    const featuredArtists = scoredProfiles.slice(0, limit);

    return res.json({
      success: true,
      count: featuredArtists.length,
      artists: featuredArtists,
    });
  } catch (error) {
    console.error('Get featured artists error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  updateArtistProfile,
  getAllArtists,
  getFeaturedArtists,
};







