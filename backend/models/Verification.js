const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Firebase UID
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    nidStatus: { 
        type: String, 
        enum: ['unsubmitted', 'pending', 'approved', 'rejected'], 
        default: 'unsubmitted' 
    },
    nidNumber: { type: String },
    nidDocumentUrl: { type: String }, // Link to the uploaded NID image
    verifiedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);