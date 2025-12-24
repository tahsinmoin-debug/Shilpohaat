const mongoose = require('mongoose');

const LessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  watchedDuration: {
    type: Number,
    default: 0
  }, // in seconds
  lastWatchedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
});

const EnrollmentSchema = new mongoose.Schema({
  workshop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workshop', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Payment info
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  transactionId: String,
  amountPaid: {
    type: Number,
    default: 0
  },
  
  // Progress tracking
  progress: [LessonProgressSchema],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }, // percentage
  
  // Completion
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  
  // Certificate
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  
  // Access control
  hasAccess: {
    type: Boolean,
    default: false
  },
  accessGrantedAt: {
    type: Date
  },
  
  enrolledAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // For live workshops
  attendedLiveSession: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ workshop: 1, user: 1 }, { unique: true });

// Method to calculate overall progress
EnrollmentSchema.methods.calculateProgress = function() {
  if (!this.progress || this.progress.length === 0) {
    return 0;
  }
  
  const completedLessons = this.progress.filter(p => p.completed).length;
  const totalLessons = this.progress.length;
  
  return Math.round((completedLessons / totalLessons) * 100);
};

// Pre-save hook to update progress
EnrollmentSchema.pre('save', function(next) {
  this.overallProgress = this.calculateProgress();
  
  // Check if completed
  if (this.overallProgress === 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);