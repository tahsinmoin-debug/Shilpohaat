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

// Get single artist profile (public)
const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try finding by profile _id first
    let profile = await ArtistProfile.findById(id).populate('user', 'name email role artistProfile');

    // If not found, maybe id is the user id
    if (!profile) {
      profile = await ArtistProfile.findOne({ user: id }).populate('user', 'name email role artistProfile');
    }

    if (!profile || !profile.isProfileComplete) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Fetch artworks for this artist
    const artworks = await Artwork.find({ artist: profile.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({ success: true, artist: profile, artworks });
  } catch (error) {
    console.error('Get artist error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  updateArtistProfile,
  getAllArtists,
  getArtistById,
};
