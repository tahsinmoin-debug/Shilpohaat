const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

// All admin routes require authentication and admin privileges
router.use(requireAuth, requireAdmin);

// Overview
router.get('/overview', ctrl.getOverview);

// Artworks
router.get('/artworks/pending', ctrl.getPendingArtworks);
router.patch('/artworks/:id/approve', ctrl.approveArtwork);
router.patch('/artworks/:id/reject', ctrl.rejectArtwork);
router.patch('/artworks/:id/feature', ctrl.featureArtwork);
router.delete('/artworks/:id', ctrl.removeArtwork);

// Users
router.get('/users', ctrl.getUsers);
router.patch('/users/:id/suspend', ctrl.suspendUser);

// Artists
router.get('/artists', ctrl.getArtists);
router.patch('/artists/:id/feature', ctrl.featureArtist);
router.patch('/artists/:id/suspend', ctrl.suspendArtist);

// Reviews
router.get('/reviews', ctrl.getReviews);
router.patch('/reviews/:id/hide', ctrl.hideReview);
router.delete('/reviews/:id', ctrl.deleteReview);

// Reports
router.get('/reports', ctrl.getReports);
router.patch('/reports/:id/status', ctrl.updateReportStatus);

// Analytics
router.get('/analytics/artists-sales', ctrl.getArtistSales);

// Blogs
router.delete('/blog/:id', ctrl.removeBlogPost);

module.exports = router;
