const Workshop = require('../models/Workshop');
const User = require('../models/User');

const createWorkshop = async (req, res) => {
  try {
    const firebaseUID = req.headers['x-firebase-uid'];
    const user = await User.findOne({ firebaseUID });

    if (!user || user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can host workshops' });
    }

    const workshop = new Workshop({
      ...req.body,
      instructor: user._id
    });

    await workshop.save();
    res.status(201).json({ success: true, workshop });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find()
      .populate('instructor', 'name email')
      .sort({ scheduledAt: 1 });
    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createWorkshop, getAllWorkshops };