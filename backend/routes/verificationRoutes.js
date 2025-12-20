const express = require('express');
const router = express.Router();
const Verification = require('../models/Verification');

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

module.exports = router;