const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');
const enrollmentController = require('../controllers/enrollmentController');
const reviewController = require('../controllers/reviewController');

// ============= PUBLIC ROUTES =============

// Get all approved workshops
router.get('/', workshopController.getAllWorkshops);

// Get single workshop details
router.get('/:id', workshopController.getWorkshopById);

// Get workshop reviews
router.get('/:workshopId/reviews', reviewController.getWorkshopReviews);

// ============= INSTRUCTOR ROUTES =============

// Create new workshop (artist only)
router.post('/create', workshopController.createWorkshop);

// Get instructor's own workshops
router.get('/instructor/my-workshops', workshopController.getInstructorWorkshops);

// Update workshop
router.put('/:id', workshopController.updateWorkshop);

// Submit for approval
router.post('/:id/submit', workshopController.submitForApproval);

// Delete workshop
router.delete('/:id', workshopController.deleteWorkshop);

// Get workshop enrollments (for instructor)
router.get('/:id/enrollments', workshopController.getWorkshopEnrollments);

// Respond to review (instructor only)
router.post('/reviews/:reviewId/respond', reviewController.respondToReview);

// ============= STUDENT ROUTES =============

// Enroll in workshop
router.post('/enroll', enrollmentController.enrollInWorkshop);

// Confirm enrollment after payment
router.post('/enroll/confirm', enrollmentController.confirmEnrollment);

// Check enrollment status
router.get('/:workshopId/check-enrollment', enrollmentController.checkEnrollment);

// Get user's enrollments
router.get('/user/enrollments', enrollmentController.getUserEnrollments);

// Get learning content (enrolled users only)
router.get('/:workshopId/learn', enrollmentController.getLearningContent);

// Update lesson progress
router.post('/enrollments/:enrollmentId/progress', enrollmentController.updateLessonProgress);

// Create review
router.post('/:workshopId/reviews', reviewController.createReview);

// Update review
router.put('/reviews/:reviewId', reviewController.updateReview);

// Delete review
router.delete('/reviews/:reviewId', reviewController.deleteReview);

// ============= ADMIN ROUTES =============

// Get workshops for moderation
router.get('/admin/moderation', workshopController.getWorkshopsForModeration);

// Approve workshop
router.post('/:id/approve', workshopController.approveWorkshop);

// Reject workshop
router.post('/:id/reject', workshopController.rejectWorkshop);

// Archive workshop
router.post('/:id/archive', workshopController.archiveWorkshop);

// Get flagged reviews
router.get('/admin/flagged-reviews', reviewController.getFlaggedReviews);

// Flag/unflag review
router.post('/reviews/:reviewId/flag', reviewController.toggleReviewFlag);

module.exports = router;