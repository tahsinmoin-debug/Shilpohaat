const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  duration: { type: Number }, // in minutes
  order: { type: Number, required: true },
  materials: [{
    name: String,
    url: String,
    type: String // 'pdf', 'image', 'document'
  }]
});

const WorkshopSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      required: true,
      enum: ['Painting', 'Sculpture', 'Crafts', 'Textile', 'Digital Art', 'Photography', 'Other']
    },
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    type: {
      type: String,
      enum: ['recorded', 'live'],
      required: true,
    },
    thumbnail: { 
      type: String,
      required: true 
    },
    
    // For recorded workshops - multiple lessons
    lessons: [LessonSchema],
    
    // For live workshops
    liveSessionUrl: { type: String }, // Zoom/Meet link
    scheduledAt: { type: Date },
    duration: { type: Number }, // in minutes
    
    // Requirements
    requiredMaterials: [{
      item: String,
      description: String,
      optional: { type: Boolean, default: false }
    }],
    
    price: { 
      type: Number, 
      default: 0 
    },
    currency: {
      type: String,
      default: 'BDT'
    },
    
    // Status & Approval
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
      default: 'draft'
    },
    rejectionReason: { type: String },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: { type: Date },
    
    // Stats
    enrollmentCount: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    
    // Settings
    maxStudents: { type: Number }, // for live workshops
    isPublished: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

// Index for search
WorkshopSchema.index({ title: 'text', description: 'text', category: 'text' });

// Virtual for total duration (recorded workshops)
WorkshopSchema.virtual('totalDuration').get(function() {
  if (this.type === 'recorded' && this.lessons) {
    return this.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }
  return this.duration || 0;
});

module.exports = mongoose.model('Workshop', WorkshopSchema);