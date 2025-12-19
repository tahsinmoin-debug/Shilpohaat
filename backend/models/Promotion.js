const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    // Changed to String to prevent "Cast to ObjectId failed" with Firebase UIDs
    artistId: { type: String, required: true }, 
    code: { type: String, unique: true, required: true },
    description: { type: String, required: true, default: "Artist Promotion" },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);