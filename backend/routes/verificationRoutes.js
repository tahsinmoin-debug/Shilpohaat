const express = require('express');
const router = express.Router();
const Verification = require('../models/Verification');
const Badge = require('../models/Badge');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Submit NID for Artist Verification
router.post('/submit-nid', async (req, res) => {
    try {
        const { userId, nidNumber, nidDocumentUrl } = req.body;
        
        let record = await Verification.findOne({ userId });
        if (!record) {
            record = new Verification({ userId });
        }

        record.nidNumber = nidNumber;
        record.nidDocumentUrl = nidDocumentUrl;
        record.nidStatus = 'pending';
        
        await record.save();
        res.status(200).json({ success: true, message: "NID submitted for review" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Verification Status
router.get('/status/:userId', async (req, res) => {
    try {
        const status = await Verification.findOne({ userId: req.params.userId });
        res.status(200).json(status || { nidStatus: 'unsubmitted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: List NID verification requests
router.get('/admin/requests', requireAuth, requireAdmin, async (req, res) => {
    try {
        const status = req.query.status;
        const query = status ? { nidStatus: status } : {};

        const verifications = await Verification.find(query).sort({ updatedAt: -1 }).lean();
        const userIds = verifications.map((record) => record.userId);
        const users = await User.find({ firebaseUID: { $in: userIds } })
            .select('firebaseUID name email role')
            .lean();

        const usersByFirebaseUID = new Map(users.map((user) => [user.firebaseUID, user]));

        const enriched = verifications.map((record) => {
            const user = usersByFirebaseUID.get(record.userId);
            return {
                ...record,
                user: user
                    ? {
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    }
                    : null,
            };
        });

        res.status(200).json({ success: true, requests: enriched });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Approve NID verification request
router.patch('/admin/requests/:id/approve', requireAuth, requireAdmin, async (req, res) => {
    try {
        const verification = await Verification.findById(req.params.id);
        if (!verification) {
            return res.status(404).json({ success: false, message: 'Verification request not found' });
        }

        verification.nidStatus = 'approved';
        verification.verifiedAt = new Date();
        await verification.save();

        await Badge.findOneAndUpdate(
            { userId: verification.userId, badgeName: 'Verified Artist' },
            {
                $setOnInsert: {
                    userId: verification.userId,
                    badgeName: 'Verified Artist',
                    badgeIcon: '✅',
                    badgeCategory: 'Verification',
                },
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: 'Verification approved' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Reject NID verification request
router.patch('/admin/requests/:id/reject', requireAuth, requireAdmin, async (req, res) => {
    try {
        const verification = await Verification.findById(req.params.id);
        if (!verification) {
            return res.status(404).json({ success: false, message: 'Verification request not found' });
        }

        verification.nidStatus = 'rejected';
        verification.verifiedAt = null;
        await verification.save();

        await Badge.deleteOne({
            userId: verification.userId,
            badgeName: 'Verified Artist',
            badgeCategory: 'Verification',
        });

        res.status(200).json({ success: true, message: 'Verification rejected' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;