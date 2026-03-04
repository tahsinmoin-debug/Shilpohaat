const Workshop = require('../models/Workshop');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
 
// ============= PUBLIC ENDPOINTS =============
 
exports.getAllWorkshops = async (req, res) => {
  try {
    const { category, skillLevel, type, search, sort = '-createdAt' } = req.query;
    const query = { status: 'approved', isPublished: true };
    if (category) query.category = category;
    if (skillLevel) query.skillLevel = skillLevel;
    if (type) query.type = type;
    if (search) query.$text = { $search: search };
    const workshops = await Workshop.find(query)
      .populate('instructor', 'name email')
      .sort(sort).lean();
    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;
    const workshop = await Workshop.findOne({ _id: id, status: 'approved', isPublished: true })
      .populate('instructor', 'name email artistProfile')
      .populate('approvedBy', 'name').lean();
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    const reviews = await Review.find({ workshop: id, isApproved: true })
      .populate('user', 'name').sort('-createdAt').limit(10).lean();
    res.json({ success: true, workshop, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ============= INSTRUCTOR ENDPOINTS =============
 
exports.createWorkshop = async (req, res) => {
  try {
    const { firebaseUID, ...workshopData } = req.body;
    const user = await User.findOne({ firebaseUID });
    if (!user || user.role !== 'artist') {
      return res.status(403).json({ success: false, message: 'Only artists can create workshops' });
    }
    const workshop = new Workshop({ ...workshopData, instructor: user._id, status: 'draft' });
    await workshop.save();
    res.status(201).json({ success: true, workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.getInstructorWorkshops = async (req, res) => {
  try {
    const { firebaseUID } = req.query;
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const workshops = await Workshop.find({ instructor: user._id }).sort('-createdAt');
    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    if (!firebaseUID) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ firebaseUID });
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    if (workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (workshop.status === 'rejected') {
      req.body.status = 'draft';
      req.body.rejectionReason = undefined;
    }
    Object.assign(workshop, req.body);
    await workshop.save();
    res.json({ success: true, workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    if (!firebaseUID) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ firebaseUID });
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    if (workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!workshop.title || !workshop.description || !workshop.thumbnail) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }
    if (workshop.type === 'recorded' && (!workshop.lessons || workshop.lessons.length === 0)) {
      return res.status(400).json({ success: false, message: 'Add at least one lesson before submitting' });
    }
    if (workshop.type === 'live' && !workshop.scheduledAt) {
      return res.status(400).json({ success: false, message: 'Set a scheduled date for live workshop' });
    }
    workshop.status = 'pending';
    await workshop.save();
    res.json({ success: true, message: 'Workshop submitted for approval', workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    if (!firebaseUID) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ firebaseUID });
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    if (workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (workshop.status === 'approved' || workshop.status === 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot delete approved or pending workshops' });
    }
    await Workshop.findByIdAndDelete(id);
    res.json({ success: true, message: 'Workshop deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.addLessonToWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, duration, order, firebaseUID } = req.body;
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    if (workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const newLesson = {
      title, description, videoUrl,
      duration: duration || 0,
      order: order || (workshop.lessons.length + 1)
    };
    workshop.lessons.push(newLesson);
    await workshop.save();
    res.status(201).json({ success: true, message: 'Lesson added', lesson: newLesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.getWorkshopEnrollments = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    if (!firebaseUID) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const workshop = await Workshop.findById(id);
    if (!workshop || workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const enrollments = await Enrollment.find({ workshop: id, paymentStatus: 'paid' })
      .populate('user', 'name email');
    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// ============= ADMIN ENDPOINTS =============
 
exports.getWorkshopsForModeration = async (req, res) => {
  try {
    const { firebaseUID, status } = req.query;
    if (!firebaseUID) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ firebaseUID });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const query = status ? { status } : {};
    const workshops = await Workshop.find(query)
      .populate('instructor', 'name email')
      .populate('approvedBy', 'name')
      .sort('-createdAt').lean();
    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.approveWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    if (!firebaseUID) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ firebaseUID });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    workshop.status = 'approved';
    workshop.approvedBy = user._id;
    workshop.approvedAt = new Date();
    workshop.isPublished = true;
    workshop.rejectionReason = undefined;
    await workshop.save();
    res.json({ success: true, message: 'Workshop approved', workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.rejectWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    const { reason } = req.body;
    if (!firebaseUID) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ firebaseUID });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason required' });
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    workshop.status = 'rejected';
    workshop.rejectionReason = reason;
    workshop.isPublished = false;
    await workshop.save();
    res.json({ success: true, message: 'Workshop rejected', workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
exports.archiveWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    if (!firebaseUID) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const user = await User.findOne({ firebaseUID });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });
    workshop.status = 'archived';
    workshop.isPublished = false;
    await workshop.save();
    res.json({ success: true, message: 'Workshop archived', workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
module.exports = exports;
