const Enrollment = require('../models/Enrollment');
const Workshop = require('../models/Workshop');
const User = require('../models/User');
const ArtistProfile = require('../models/ArtistProfile');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Find user by firebaseUID, or auto-create them if missing
// This is the permanent fix for "User not found" errors
// ─────────────────────────────────────────────────────────────────────────────
async function findOrCreateUser(firebaseUID, { email, name } = {}) {
  // 1. Try to find by firebaseUID
  let user = await User.findOne({ firebaseUID });
  if (user) return user;

  // 2. Not found — auto-create with whatever info we have
  console.log(`[AUTO-CREATE] No MongoDB user for firebaseUID: ${firebaseUID} — creating now`);
  const safeEmail = email || `${firebaseUID}@shilpohaat.user`;
  const safeName  = name  || safeEmail.split('@')[0];

  // Check if email already taken by a different firebaseUID (edge case)
  const byEmail = await User.findOne({ email: safeEmail });
  if (byEmail) {
    // Just update their firebaseUID and return
    byEmail.firebaseUID = firebaseUID;
    await byEmail.save();
    return byEmail;
  }

  user = await User.create({
    firebaseUID,
    email: safeEmail,
    name: safeName,
    role: 'user',
  });

  console.log(`[AUTO-CREATE] Created user: ${user.email} (${user._id})`);
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enroll in workshop
// ─────────────────────────────────────────────────────────────────────────────
exports.enrollInWorkshop = async (req, res) => {
  try {
    const { workshopId, firebaseUID, email, name } = req.body;

    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Not logged in. Please log in first.' });
    }
    if (!workshopId) {
      return res.status(400).json({ success: false, message: 'Workshop ID is required.' });
    }

    // Find or auto-create user — no more "User not found" errors
    const user = await findOrCreateUser(firebaseUID, { email, name });

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found.' });
    }
    if (workshop.status !== 'approved' || !workshop.isPublished) {
      return res.status(400).json({ success: false, message: 'This workshop is not available for enrollment yet.' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user: user._id, workshop: workshopId });
    if (existingEnrollment) {
      if (existingEnrollment.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, message: 'You are already enrolled in this workshop.' });
      }
      // Stale pending — delete and retry
      await Enrollment.findByIdAndDelete(existingEnrollment._id);
    }

    // Create enrollment record
    const enrollment = new Enrollment({
      workshop: workshopId,
      user: user._id,
      paymentStatus: workshop.price === 0 ? 'paid' : 'pending',
      amountPaid: workshop.price,
      hasAccess: workshop.price === 0,
      accessGrantedAt: workshop.price === 0 ? new Date() : undefined,
    });

    if (workshop.type === 'recorded' && workshop.lessons?.length > 0) {
      enrollment.progress = workshop.lessons.map(lesson => ({
        lessonId: lesson._id,
        completed: false,
        watchedDuration: 0,
      }));
    }

    await enrollment.save();

    // FREE workshop → instant access
    if (workshop.price === 0) {
      workshop.enrollmentCount = (workshop.enrollmentCount || 0) + 1;
      await workshop.save();
      return res.json({
        success: true,
        message: 'Enrolled successfully!',
        enrollment,
        redirect: `/workshops/${workshopId}/learn`,
      });
    }

    // PAID workshop → Stripe checkout
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_your')) {
      return res.status(500).json({
        success: false,
        message: 'Payment is not configured yet. Please contact the administrator.',
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: (workshop.currency || 'BDT').toLowerCase(),
          product_data: {
            name: workshop.title,
            description: workshop.description?.substring(0, 200),
            images: workshop.thumbnail ? [workshop.thumbnail] : [],
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
        workshopId,
        userId: user._id.toString(),
      },
    });

    res.json({ success: true, url: session.url, enrollmentId: enrollment._id });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Confirm enrollment after Stripe payment
// ─────────────────────────────────────────────────────────────────────────────
exports.confirmEnrollment = async (req, res) => {
  try {
    const { enrollmentId, sessionId } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({ success: false, message: 'Enrollment ID required.' });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    }

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ success: false, message: 'Payment not completed.' });
      }
      enrollment.transactionId = session.payment_intent;
    }

    enrollment.paymentStatus = 'paid';
    enrollment.hasAccess = true;
    enrollment.accessGrantedAt = new Date();
    await enrollment.save();

    await Workshop.findByIdAndUpdate(enrollment.workshop, { $inc: { enrollmentCount: 1 } });

    res.json({ success: true, message: 'Enrollment confirmed!', enrollment });
  } catch (error) {
    console.error('Confirm enrollment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get user's enrollments
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserEnrollments = async (req, res) => {
  try {
    const { firebaseUID } = req.query;
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.json({ success: true, enrollments: [] }); // not an error, just no enrollments
    }

    const enrollments = await Enrollment.find({ user: user._id, paymentStatus: 'paid' })
      .populate('workshop')
      .sort('-enrolledAt')
      .lean();

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Check enrollment status
// ─────────────────────────────────────────────────────────────────────────────
exports.checkEnrollment = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { firebaseUID } = req.query;

    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      // Not in DB = definitely not enrolled, not an error
      return res.json({ success: true, isEnrolled: false, enrollment: null });
    }

    const enrollment = await Enrollment.findOne({
      user: user._id,
      workshop: workshopId,
      paymentStatus: 'paid',
    });

    res.json({ success: true, isEnrolled: !!enrollment, enrollment: enrollment || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update lesson progress
// ─────────────────────────────────────────────────────────────────────────────
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
    if (!user || enrollment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const lessonProgress = enrollment.progress.find(p => p.lessonId.toString() === lessonId);
    if (!lessonProgress) {
      return res.status(404).json({ success: false, message: 'Lesson not found in progress' });
    }

    if (watchedDuration !== undefined) lessonProgress.watchedDuration = watchedDuration;
    if (completed && !lessonProgress.completed) {
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
    }
    lessonProgress.lastWatchedAt = new Date();

    await enrollment.save();
    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get learning content (enrolled users only)
// ─────────────────────────────────────────────────────────────────────────────
exports.getLearningContent = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { firebaseUID } = req.query;

    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(403).json({ success: false, message: 'Please enroll to access this content.' });
    }

    const enrollment = await Enrollment.findOne({
      user: user._id,
      workshop: workshopId,
      paymentStatus: 'paid',
      hasAccess: true,
    });

    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'You must enroll in this workshop to access content.' });
    }

    const workshop = await Workshop.findById(workshopId)
      .populate('instructor', 'name email')
      .select('title lessons instructor')
      .lean();

    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found.' });
    }

    res.json({ success: true, workshop, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
