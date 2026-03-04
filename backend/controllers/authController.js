const User = require('../models/User.js');
const ArtistProfile = require('../models/ArtistProfile.js');

// Register a new user — or return existing one if already registered
const registerUser = async (req, res) => {
  try {
    const { email, name, role, firebaseUID } = req.body;

    if (!email || !name || !role || !firebaseUID) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Check by firebaseUID first (most reliable)
    let existingUser = await User.findOne({ firebaseUID }).populate('artistProfile');
    if (existingUser) {
      // Already registered — just return their data
      return res.status(200).json({ success: true, user: existingUser, alreadyExists: true });
    }

    // Check by email (different Firebase UID but same email — update the UID)
    existingUser = await User.findOne({ email }).populate('artistProfile');
    if (existingUser) {
      // Update their firebaseUID to the current one and return
      existingUser.firebaseUID = firebaseUID;
      await existingUser.save();
      return res.status(200).json({ success: true, user: existingUser, alreadyExists: true });
    }

    // Brand new user — create them
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
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get current user by firebaseUID
const getMe = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ success: false, message: 'firebaseUID is required' });
    }

    const user = await User.findOne({ firebaseUID }).populate('artistProfile');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Search users by name
const searchUsers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      name: { $regex: name, $options: 'i' }
    })
      .select('name _id role')
      .limit(5);

    return res.json({ success: true, users });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: 'Search failed' });
  }
};

module.exports = { registerUser, getMe, searchUsers };
