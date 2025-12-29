const Workshop = require('../models/Workshop');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ============= PUBLIC ENDPOINTS =============

// Get all approved workshops (public)
exports.getAllWorkshops = async (req, res) => {
  try {
    const { category, skillLevel, type, search, sort = '-createdAt' } = req.query;
    
    const query = { 
      status: 'approved',
      isPublished: true 
    };
    
    if (category) query.category = category;
    if (skillLevel) query.skillLevel = skillLevel;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }
    
    const workshops = await Workshop.find(query)
      .populate('instructor', 'name email')
      .sort(sort)
      .lean();
    
    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single workshop details (public)
exports.getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workshop = await Workshop.findOne({
      _id: id,
      status: 'approved',
      isPublished: true
    })
      .populate('instructor', 'name email artistProfile')
      .populate('approvedBy', 'name')
      .lean();
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    // Get reviews
    const reviews = await Review.find({ 
      workshop: id, 
      isApproved: true 
    })
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(10)
      .lean();
    
    res.json({ success: true, workshop, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= INSTRUCTOR ENDPOINTS =============

// Create new workshop (Artist only)
// 1. Create the workshop (Initial post)
exports.createWorkshop = async (req, res) => {
  try {
    const { firebaseUID, title, description, price, category, type, thumbnail, skillLevel } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user || user.role !== 'artist') {
      return res.status(403).json({ success: false, message: 'Only artists can create workshops' });
    }

    const workshop = new Workshop({
      instructor: user._id,
      title,
      description,
      price,
      category,
      type,
      thumbnail,
      skillLevel,
      status: 'pending' // Admin must approve
    });

    await workshop.save();
    res.status(201).json({ success: true, workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get workshops created by the logged-in artist
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

// Update workshop (Instructor only)
exports.updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    const workshop = await Workshop.findById(id);
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    // Check ownership
    if (workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this workshop' });
    }
    
    // If workshop was rejected and being updated, reset to draft
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

// Submit workshop for approval
exports.submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    const workshop = await Workshop.findById(id);
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    if (workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Validate required fields
    if (!workshop.title || !workshop.description || !workshop.thumbnail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields (title, description, thumbnail)' 
      });
    }
    
    if (workshop.type === 'recorded' && (!workshop.lessons || workshop.lessons.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recorded workshops must have at least one lesson' 
      });
    }
    
    if (workshop.type === 'live' && !workshop.scheduledAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Live workshops must have a scheduled date/time' 
      });
    }
    
    workshop.status = 'pending';
    await workshop.save();
    
    res.json({ success: true, message: 'Workshop submitted for approval', workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete workshop (Instructor only - only if not approved)
exports.deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    const workshop = await Workshop.findById(id);
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    if (workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Can only delete if draft or rejected
    if (workshop.status === 'approved' || workshop.status === 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete approved or pending workshops. Archive it instead.' 
      });
    }
    
    await Workshop.findByIdAndDelete(id);
    
    res.json({ success: true, message: 'Workshop deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get workshop enrollments (Instructor only)
// Get workshop enrollments (for instructor to see who enrolled)
// Get list of students enrolled in a specific workshop (Artist Only)
exports.getWorkshopEnrollments = async (req, res) => {
  try {
    const { id } = req.params; // Workshop ID
    const { firebaseUID } = req.query;

    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Find the workshop and verify this artist owns it
    const workshop = await Workshop.findById(id);
    if (!workshop || workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not the instructor.' });
    }

    // Find all successful enrollments
    const enrollments = await Enrollment.find({ 
      workshop: id, 
      paymentStatus: 'paid' 
    }).populate('user', 'name email');

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ============= ADMIN ENDPOINTS =============

// Get all workshops for admin moderation
exports.getWorkshopsForModeration = async (req, res) => {
  try {
    const { firebaseUID } = req.query;
    const { status } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const query = status ? { status } : {};
    
    const workshops = await Workshop.find(query)
      .populate('instructor', 'name email')
      .populate('approvedBy', 'name')
      .sort('-createdAt')
      .lean();
    
    res.json({ success: true, workshops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve workshop (Admin only)
exports.approveWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const workshop = await Workshop.findById(id);
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
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

// Reject workshop (Admin only)
exports.rejectWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    const { reason } = req.body;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    
    const workshop = await Workshop.findById(id);
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    workshop.status = 'rejected';
    workshop.rejectionReason = reason;
    workshop.isPublished = false;
    
    await workshop.save();
    
    res.json({ success: true, message: 'Workshop rejected', workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Archive workshop (Admin only)
exports.archiveWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const workshop = await Workshop.findById(id);
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    workshop.status = 'archived';
    workshop.isPublished = false;
    
    await workshop.save();
    
    res.json({ success: true, message: 'Workshop archived', workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Add a tutorial lesson to a workshop
exports.addLessonToWorkshop = async (req, res) => {
  try {
    const { id } = req.params; // Workshop ID
    const { title, description, videoUrl, duration, order, firebaseUID } = req.body;

    // 1. Find the user making the request
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Find the workshop
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });

    // 3. Security Check: Only the instructor who created it can add lessons
    if (workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this workshop' });
    }

    // 4. Create the lesson object
    const newLesson = {
      title,
      description,
      videoUrl,
      duration: duration || 0,
      order: order || (workshop.lessons.length + 1)
    };

    // 5. Push to lessons array and save
    workshop.lessons.push(newLesson);
    await workshop.save();

    res.status(201).json({ 
      success: true, 
      message: 'Tutorial video added successfully', 
      lesson: newLesson 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get workshops created by the logged-in artist
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

// Create new workshop
exports.createWorkshop = async (req, res) => {
  try {
    const { firebaseUID, ...workshopData } = req.body;
    const user = await User.findOne({ firebaseUID });

    if (!user || user.role !== 'artist') {
      return res.status(403).json({ success: false, message: 'Only artists can create workshops' });
    }

    const workshop = new Workshop({
      ...workshopData,
      instructor: user._id,
      status: 'pending' // Requires admin approval
    });

    await workshop.save();
    res.status(201).json({ success: true, workshop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add tutorial lesson to workshop
exports.addLessonToWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, order, firebaseUID } = req.body;

    const user = await User.findOne({ firebaseUID });
    const workshop = await Workshop.findById(id);

    if (!workshop || workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    workshop.lessons.push({ title, description, videoUrl, order });
    await workshop.save();

    res.json({ success: true, message: 'Lesson added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = exports;