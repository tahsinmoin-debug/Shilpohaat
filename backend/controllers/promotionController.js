const Promotion = require('../models/Promotion');

// Create a new discount or sale
exports.createPromotion = async (req, res) => {
    try {
        const promo = new Promotion({
            ...req.body,
            artistId: req.user.uid // Assuming UID from Auth middleware
        });
        await promo.save();
        res.status(201).json({ success: true, promo });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Validate a coupon code at checkout
exports.validateCoupon = async (req, res) => {
    const { code, cartTotal } = req.body;
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

        res.json({ success: true, discountValue: promo.value, type: promo.type });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};