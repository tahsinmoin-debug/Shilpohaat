const ArtistProfile = require('../models/ArtistProfile.js');
const User = require('../models/User.js');
const Artwork = require('../models/Artwork.js');
const { uploadToCloudinary, uploadMultipleToCloudinary, replaceImages } = require('../utils/cloudinary.js');

const escapeRegex = (text = '') => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    const profileQuery = { isProfileComplete: true };

    if (letter) {
      profileQuery.bio = { $regex: `^${escapeRegex(letter)}`, $options: 'i' };
    }

    if (search) {
      const safe = escapeRegex(search);
      profileQuery.$or = [
        { bio: { $regex: safe, $options: 'i' } },
        { specializations: { $elemMatch: { $regex: safe, $options: 'i' } } },
      ];
    }

    const profiles = await ArtistProfile.find(profileQuery)
      .select('bio specializations profilePicture portfolioImages availability isFeatured rating totalReviews profileViews totalArtworks user createdAt')
      .populate({
        path: 'user',
        select: 'name email role',
        match: { role: 'artist' },
      })
      .sort({ createdAt: -1 })
      .lean();

    const artists = profiles.filter((p) => p.user);

    return res.json({ success: true, count: artists.length, artists });
  } catch (error) {
    console.error('Get artists error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// NEW: Get featured artists
const getFeaturedArtists = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 24);

    const profiles = await ArtistProfile.find({ isProfileComplete: true })
      .select('bio specializations profilePicture portfolioImages availability isFeatured rating totalReviews profileViews totalArtworks user')
      .populate({
        path: 'user',
        select: 'name email role',
        match: { role: 'artist' },
      })
      .sort({ isFeatured: -1, rating: -1, profileViews: -1, totalArtworks: -1, createdAt: -1 })
      .limit(limit * 2)
      .lean();

    const featuredArtists = profiles.filter((p) => p.user).slice(0, limit);
    return res.json({ success: true, count: featuredArtists.length, artists: featuredArtists });
  } catch (error) {
    console.error('Get featured artists error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get single artist profile
const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    let profile = await ArtistProfile.findById(id)
      .populate('user', 'name email role artistProfile')
      .lean();
    if (!profile) {
      profile = await ArtistProfile.findOne({ user: id })
        .populate('user', 'name email role artistProfile')
        .lean();
    }
    if (!profile || !profile.isProfileComplete) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    const artworks = await Artwork.find({ artist: profile.user._id })
      .select('title description category price images status featured createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return res.json({ success: true, artist: profile, artworks });
  } catch (error) {
    console.error('Get artist by id error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * FIXED: getHubArtists
 * Removed the { success, artists } wrapper. 
 * Returning the array directly so frontend .filter works instantly.
 */
const getHubArtists = async (req, res) => {
    try {
        // Get ALL users regardless of role
        const users = await User.find({})
            .select('firebaseUID name email role')
            .lean();

        const artistList = users.map(artist => ({
            id: artist.firebaseUID,
            name: artist.name || artist.email?.split('@')[0] || 'Artist'
        }));

        // Return array directly
        res.json(artistList); 
    } catch (error) {
        console.error('Hub Artists Error:', error);
        res.status(500).json({ message: 'Failed to retrieve artist list.' });
    }
};

module.exports = {
  updateArtistProfile,
  getAllArtists,
  getFeaturedArtists,
  getArtistById,
  getHubArtists,
};
