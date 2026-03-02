const Promotion = require('../models/Promotion');
const Artwork = require('../models/Artwork');

// Create a new discount or sale
exports.createPromotion = async (req, res) => {
    try {
        console.log('Creating promotion with data:', req.body);
        const promo = new Promotion(req.body);
        await promo.save();
        console.log('Promotion created successfully:', promo);
        res.status(201).json({ success: true, promo });
    } catch (error) {
        console.error('Promotion creation error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all promotions for an artist
exports.getArtistPromotions = async (req, res) => {
    try {
        const { artistId } = req.params;
        const promotions = await Promotion.find({ artistId })
            .populate('applicableArtworks', 'title images')
            .sort({ createdAt: -1 });
        res.json({ success: true, promotions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a promotion
exports.deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        await Promotion.findByIdAndDelete(id);
        res.json({ success: true, message: 'Promotion deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate a coupon code at checkout
exports.validateCoupon = async (req, res) => {
    const { code, cartTotal, artworkIds } = req.body;
    try {
        const promo = await Promotion.findOne({ code, isActive: true });
        
        if (!promo) return res.status(404).json({ message: "Invalid coupon code" });
        
        const now = new Date();
        if (now < promo.startDate || now > promo.endDate) {
            return res.status(400).json({ message: "Coupon has expired" });
        }
        
        if (cartTotal < promo.minPurchase) {
            return res.status(400).json({ message: `Minimum purchase of ৳${promo.minPurchase} required` });
        }

        // Check usage limit
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            return res.status(400).json({ message: "Coupon usage limit reached" });
        }

        // Check if coupon applies to cart items
        if (promo.applicableArtworks.length > 0) {
            const hasApplicableArtwork = artworkIds.some(id => 
                promo.applicableArtworks.some(artId => artId.toString() === id.toString())
            );
            if (!hasApplicableArtwork) {
                return res.status(400).json({ message: "Coupon not applicable to items in cart" });
            }
        }

        res.json({ 
            success: true, 
            discountValue: promo.value, 
            type: promo.type,
            promotionId: promo._id
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Apply coupon (increment usage count)
exports.applyCoupon = async (req, res) => {
    try {
        const { promotionId } = req.body;
        await Promotion.findByIdAndUpdate(promotionId, { $inc: { usedCount: 1 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};