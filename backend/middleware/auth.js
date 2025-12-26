const User = require('../models/User');

// Simple auth: extract firebaseUID from header or query and load user
const requireAuth = async (req, res, next) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(401).json({ message: 'firebaseUID is required' });
    }
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Account is suspended' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    // requireAuth should have set req.user
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdminByRole = req.user.role === 'admin';
    const isAdminByEmail = adminEmail && req.user.email && req.user.email.toLowerCase() === adminEmail.toLowerCase();
    if (!isAdminByRole && !isAdminByEmail) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { requireAuth, requireAdmin };