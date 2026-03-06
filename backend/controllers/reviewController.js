const Review = require('../models/Review');
const ArtworkReview = require('../models/ArtworkReview');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');
const Workshop = require('../models/Workshop');
const User = require('../models/User');

// Create review (only enrolled users)
exports.createReview = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { rating, comment, firebaseUID } = req.body;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if enrolled and paid
    const enrollment = await Enrollment.findOne({
      user: user._id,
      workshop: workshopId,
      paymentStatus: 'paid'
    });
    
    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        message: 'You must be enrolled in this workshop to leave a review' 
      });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: user._id,
      workshop: workshopId
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this workshop' 
      });
    }
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Review comment must be at least 10 characters' 
      });
    }
    
    // Create review
    const review = new Review({
      workshop: workshopId,
      user: user._id,
      enrollment: enrollment._id,
      rating,
      comment: comment.trim()
    });
    
    await review.save();
    
    // Update workshop rating
    await updateWorkshopRating(workshopId);
    
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .lean();
    
    res.status(201).json({ 
      success: true, 
      message: 'Review submitted successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get workshop reviews
exports.getWorkshopReviews = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { sort = '-createdAt', limit = 20, page = 1 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find({ 
      workshop: workshopId,
      isApproved: true
    })
      .populate('user', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Review.countDocuments({ 
      workshop: workshopId,
      isApproved: true
    });
    
    res.json({ 
      success: true, 
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update review (user can edit their own review)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, firebaseUID } = req.body;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rating must be between 1 and 5' 
        });
      }
      review.rating = rating;
    }
    
    if (comment) {
      if (comment.trim().length < 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Review comment must be at least 10 characters' 
        });
      }
      review.comment = comment.trim();
    }
    
    await review.save();
    
    // Update workshop rating
    await updateWorkshopRating(review.workshop);
    
    res.json({ 
      success: true, 
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Only review owner or admin can delete
    if (review.user.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const workshopId = review.workshop;
    
    await Review.findByIdAndDelete(reviewId);
    
    // Update workshop rating
    await updateWorkshopRating(workshopId);
    
    res.json({ 
      success: true, 
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Instructor response to review
exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response, firebaseUID } = req.body;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    const review = await Review.findById(reviewId).populate('workshop');
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check if user is the instructor
    if (review.workshop.instructor.toString() !== user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the instructor can respond to reviews' 
      });
    }
    
    if (!response || response.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Response must be at least 10 characters' 
      });
    }
    
    review.instructorResponse = {
      text: response.trim(),
      respondedAt: new Date()
    };
    
    await review.save();
    
    res.json({ 
      success: true, 
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Flag/unflag review
exports.toggleReviewFlag = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isFlagged, flagReason, firebaseUID } = req.body;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    review.isFlagged = isFlagged;
    review.flagReason = isFlagged ? flagReason : undefined;
    
    if (isFlagged) {
      review.isApproved = false;
    }
    
    await review.save();
    
    res.json({ 
      success: true, 
      message: isFlagged ? 'Review flagged' : 'Review unflagged',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get flagged reviews
exports.getFlaggedReviews = async (req, res) => {
  try {
    const { firebaseUID } = req.query;
    
    if (!firebaseUID) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findOne({ firebaseUID });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const reviews = await Review.find({ isFlagged: true })
      .populate('user', 'name email')
      .populate('workshop', 'title')
      .sort('-createdAt')
      .lean();
    
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get artwork reviews
exports.getArtworkReviews = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const artworkExists = await Artwork.exists({ _id: artworkId });
    if (!artworkExists) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    const reviews = await ArtworkReview.find({ artwork: artworkId })
      .sort({ createdAt: -1 })
      .lean();

    const reviewerIds = [...new Set(reviews.map((review) => review.reviewerId).filter(Boolean))];
    let verifiedSet = new Set();
    if (reviewerIds.length > 0) {
      const buyers = await User.find({ firebaseUID: { $in: reviewerIds } }).select('_id firebaseUID').lean();
      const buyerByFirebaseUID = new Map(buyers.map((buyer) => [buyer.firebaseUID, String(buyer._id)]));
      const buyerIds = buyers.map((buyer) => buyer._id);

      if (buyerIds.length > 0) {
        const paidOrders = await Order.find({
          userId: { $in: buyerIds },
          paymentStatus: 'paid',
          'items.artworkId': artworkId,
        })
          .select('userId')
          .lean();

        const verifiedUserIds = new Set(paidOrders.map((order) => String(order.userId)));
        verifiedSet = new Set(
          reviewerIds.filter((firebaseUID) => {
            const userId = buyerByFirebaseUID.get(firebaseUID);
            return userId ? verifiedUserIds.has(userId) : false;
          })
        );
      }
    }

    const enriched = reviews.map((review) => ({
      ...review,
      verifiedBuyer: verifiedSet.has(review.reviewerId),
    }));

    return res.json({ success: true, reviews: enriched });
  } catch (error) {
    console.error('Get artwork reviews error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create artwork review
exports.createArtworkReview = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { rating, comment, reviewerId, reviewerName } = req.body;

    const artworkExists = await Artwork.exists({ _id: artworkId });
    if (!artworkExists) {
      return res.status(404).json({ success: false, message: 'Artwork not found' });
    }

    if (!reviewerId || !reviewerName) {
      return res.status(400).json({ success: false, message: 'Reviewer identity is required.' });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const trimmedComment = String(comment || '').trim();
    if (trimmedComment.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 10 characters.',
      });
    }

    const existingReview = await ArtworkReview.findOne({ artwork: artworkId, reviewerId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this artwork.',
      });
    }

    const review = await ArtworkReview.create({
      artwork: artworkId,
      reviewerId: String(reviewerId).trim(),
      reviewerName: String(reviewerName).trim(),
      rating: parsedRating,
      comment: trimmedComment,
    });

    return res.status(201).json({ success: true, review });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this artwork.',
      });
    }

    console.error('Create artwork review error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Helper function to update workshop rating
async function updateWorkshopRating(workshopId) {
  try {
    const reviews = await Review.find({ 
      workshop: workshopId,
      isApproved: true
    });
    
    if (reviews.length === 0) {
      await Workshop.findByIdAndUpdate(workshopId, {
        averageRating: 0,
        totalReviews: 0
      });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await Workshop.findByIdAndUpdate(workshopId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error updating workshop rating:', error);
  }
}

module.exports = exports;
