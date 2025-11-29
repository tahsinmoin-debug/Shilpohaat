// NOTE: We removed firebase-admin usage because the client already creates
// the Firebase Auth user and sends its UID. This keeps backend simpler and
// avoids duplicate account creation / module not found errors.
const User = require('../models/User.js');
const ArtistProfile = require('../models/ArtistProfile.js');

// Register a new user (expects firebaseUID from client already created via Firebase Web SDK)
const registerUser = async (req, res) => {
  try {
    const { email, name, role, firebaseUID } = req.body;

    // Basic validation
    if (!email || !name || !role || !firebaseUID) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Prevent duplicate accounts
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    // Create the user document
    const mongoUser = new User({ email, name, role, firebaseUID });
    await mongoUser.save();

    // If artist, create profile
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

module.exports = {
  registerUser,
  // Get current app user by firebaseUID (temporary simple approach; add ID token verification later)
  getMe: async (req, res) => {
    try {
      const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
      if (!firebaseUID) {
        return res.status(400).json({ message: 'firebaseUID is required' });
      }

      const user = await User.findOne({ firebaseUID }).populate('artistProfile');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        user,
      });
    } catch (err) {
      console.error('getMe error:', err);
      return res.status(500).json({ message: 'Server error.' });
    }
  },
};
