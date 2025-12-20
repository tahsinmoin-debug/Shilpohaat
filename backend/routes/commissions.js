const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commissionController');

// Create new commission request (Buyer)
router.post('/', ctrl.createCommissionRequest);

// Get pending commissions for sellers
router.get('/pending', ctrl.getPendingCommissions);

// Get buyer's own commissions
router.get('/my-requests', ctrl.getBuyerCommissions);

// Get artist's accepted commissions
router.get('/my-commissions', ctrl.getArtistCommissions);

// Get single commission request
router.get('/:id', ctrl.getCommissionRequest);

// Accept commission (Artist)
router.patch('/:id/accept', ctrl.acceptCommission);

// Reject commission (Artist)
router.patch('/:id/reject', ctrl.rejectCommission);

// Update commission status
router.patch('/:id/status', ctrl.updateCommissionStatus);

// Cancel commission (Buyer)
router.delete('/:id', ctrl.cancelCommission);

module.exports = router;
