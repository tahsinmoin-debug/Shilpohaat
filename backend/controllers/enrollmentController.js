const Enrollment = require('../models/Enrollment');
const Workshop = require('../models/Workshop');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Enroll in workshop (with payment if required)
exports.enrollInWorkshop = async (req, res) => {
  try {
    const { workshopId, firebaseUID } = req.body;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    const workshop = await Workshop.findById(workshopId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    if (workshop.status !== 'approved' || !workshop.isPublished) {
      return res.status(400).json({ success: false, message: 'Workshop is not available' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ 
      user: user._id, 
      workshop: workshopId 
    });
    
    if (existingEnrollment) {
      if (existingEnrollment.paymentStatus === 'paid') {
        return res.status(400).json({ 
          success: false, 
          message: 'Already enrolled in this workshop' 
        });
      }
      
      // If pending payment, allow retry
      if (existingEnrollment.paymentStatus === 'pending') {
        await Enrollment.findByIdAndDelete(existingEnrollment._id);
      }
    }
    
    // Create enrollment
    const enrollment = new Enrollment({
      workshop: workshopId,
      user: user._id,
      paymentStatus: workshop.price === 0 ? 'paid' : 'pending',
      amountPaid: workshop.price,
      hasAccess: workshop.price === 0,
      accessGrantedAt: workshop.price === 0 ? new Date() : undefined
    });
    
    // Initialize progress for recorded workshops
    if (workshop.type === 'recorded' && workshop.lessons) {
      enrollment.progress = workshop.lessons.map(lesson => ({
        lessonId: lesson._id,
        completed: false,
        watchedDuration: 0
      }));
    }
    
    await enrollment.save();
    
    // Free workshop - instant access
    if (workshop.price === 0) {
      workshop.enrollmentCount += 1;
      await workshop.save();
      
      return res.json({ 
        success: true, 
        message: 'Enrolled successfully',
        enrollment,
        redirect: `/workshops/${workshopId}/learn`
      });
    }
    
    // Paid workshop - create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: workshop.currency.toLowerCase(),
          product_data: { 
            name: workshop.title,
            description: workshop.description,
            images: workshop.thumbnail ? [workshop.thumbnail] : []
          },
          unit_amount: Math.round(workshop.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/workshops/${workshopId}/enrollment-success?session_id={CHECKOUT_SESSION_ID}&enrollmentId=${enrollment._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/workshops/${workshopId}`,
      metadata: { 
        enrollmentId: enrollment._id.toString(),
        workshopId: workshopId,
        userId: user._id.toString()
      },
    });
    
    res.json({ success: true, url: session.url, enrollmentId: enrollment._id });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm enrollment after payment
exports.confirmEnrollment = async (req, res) => {
  try {
    const { enrollmentId, sessionId } = req.body;
    
    if (!enrollmentId) {
      return res.status(400).json({ success: false, message: 'Enrollment ID required' });
    }
    
    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    // If sessionId provided, verify with Stripe
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment not completed' 
        });
      }
      
      enrollment.transactionId = session.payment_intent;
    }
    
    // Grant access
    enrollment.paymentStatus = 'paid';
    enrollment.hasAccess = true;
    enrollment.accessGrantedAt = new Date();
    await enrollment.save();
    
    // Update workshop enrollment count
    await Workshop.findByIdAndUpdate(enrollment.workshop, {
      $inc: { enrollmentCount: 1 }
    });
    
    res.json({ 
      success: true, 
      message: 'Enrollment confirmed',
      enrollment
    });
  } catch (error) {
    console.error('Confirm enrollment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's enrollments
exports.getUserEnrollments = async (req, res) => {
  try {
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const enrollments = await Enrollment.find({ 
      user: user._id,
      paymentStatus: 'paid'
    })
      .populate('workshop')
      .sort('-enrolledAt')
      .lean();
    
    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check enrollment status
exports.checkEnrollment = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const enrollment = await Enrollment.findOne({
      user: user._id,
      workshop: workshopId,
      paymentStatus: 'paid'
    });
    
    res.json({ 
      success: true, 
      isEnrolled: !!enrollment,
      enrollment: enrollment || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { lessonId, watchedDuration, completed } = req.body;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    if (enrollment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Find lesson progress
    const lessonProgress = enrollment.progress.find(
      p => p.lessonId.toString() === lessonId
    );
    
    if (!lessonProgress) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    // Update progress
    if (watchedDuration !== undefined) {
      lessonProgress.watchedDuration = watchedDuration;
    }
    
    if (completed !== undefined && completed && !lessonProgress.completed) {
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
    }
    
    lessonProgress.lastWatchedAt = new Date();
    
    await enrollment.save();
    
    res.json({ 
      success: true, 
      enrollment,
      overallProgress: enrollment.overallProgress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get learning content (only for enrolled users)
exports.getLearningContent = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check enrollment
    const enrollment = await Enrollment.findOne({
      user: user._id,
      workshop: workshopId,
      paymentStatus: 'paid',
      hasAccess: true
    });
    
    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        message: 'You must enroll in this workshop to access content' 
      });
    }
    
    const workshop = await Workshop.findById(workshopId)
      .populate('instructor', 'name email artistProfile')
      .lean();
    
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }
    
    res.json({ 
      success: true, 
      workshop,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;