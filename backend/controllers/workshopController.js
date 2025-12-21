const Workshop = require('../models/Workshop.js');
const User = require('../models/User.js');

const createWorkshop = async (req, res) => {
  try {
    const firebaseUID = req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user || user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can host workshops' });
    }

    const workshop = new Workshop({
      ...req.body,
      instructor: user._id
    });

    await workshop.save();
    return res.status(201).json({ success: true, workshop });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find()
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: workshops.length, workshops });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createWorkshop, getAllWorkshops };