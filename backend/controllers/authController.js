// NOTE: We removed firebase-admin usage because the client already creates
// the Firebase Auth user and sends its UID. This keeps backend simpler and
// avoids duplicate account creation / module not found errors.
const User = require('../models/User.js');
const ArtistProfile = require('../models/ArtistProfile.js');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, name, role, firebaseUID } = req.body;

    if (!email || !name || !role || !firebaseUID) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const mongoUser = new User({ email, name, role, firebaseUID });
    await mongoUser.save();

    if (role === 'artist') {
      const profile = new ArtistProfile({ user: mongoUser._id });
      await profile.save();
      mongoUser.artistProfile = profile._id;
      await mongoUser.save();
    }

    return res.status(201).json({ success: true, user: mongoUser });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const user = await User.findOne({ firebaseUID }).populate('artistProfile');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// NEW: Search users by name
const searchUsers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.length < 2) {
      return res.json({ success: true, users: [] });
    }

    // Find users whose name matches the query (case-insensitive)
    const users = await User.find({
      name: { $regex: name, $options: 'i' }
    })
    .select('name _id role')
    .limit(5);

    return res.json({ success: true, users });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = {
  registerUser,
  getMe,
  searchUsers
};