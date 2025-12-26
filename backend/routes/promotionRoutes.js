const express = require('express');
const router = express.Router(); // This fixes the "router is not defined" error
const Promotion = require('../models/Promotion');

router.post('/create', async (req, res) => {
    try {
        const { artistId, code, type, value, minPurchase, startDate, endDate, description } = req.body;
        
        const promo = new Promotion({
            artistId: artistId,
            code: code,
            description: description || "Artist Promotion", // Fixes "Path description is required"
            type: type,
            value: value,
            minPurchase: minPurchase || 0,
            startDate: startDate,
            endDate: endDate
        });

        await promo.save();
        res.status(201).json({ success: true, promo });
    } catch (error) {
        console.error("Promo Creation Error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/validate', async (req, res) => {
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
});

module.exports = router;