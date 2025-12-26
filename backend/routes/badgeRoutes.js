const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const Order = require('../models/Order');

// API to trigger a check for new badges (Can be called after a successful order)
router.post('/check-milestones/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // 1. Calculate Total Revenue to check for Sales Badges
        const orders = await Order.aggregate([
            { $unwind: "$items" },
            { $match: { "items.artistId": userId, paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }
        ]);

        const totalRevenue = orders[0]?.total || 0;
        let newBadges = [];

        // 2. Logic for Sales Milestones
        if (totalRevenue >= 10000) {
            newBadges.push({ name: "Silver Seller", icon: "🥈", category: "Sales" });
        }
        if (totalRevenue >= 50000) {
            newBadges.push({ name: "Gold Seller", icon: "🥇", category: "Sales" });
        }

        // 3. Save only if they don't already have the badge
        for (let b of newBadges) {
            try {
                await Badge.create({
                    userId,
                    badgeName: b.name,
                    badgeIcon: b.icon,
                    badgeCategory: b.category
                });
            } catch (err) {
                // Ignore error if badge already exists due to unique index
            }
        }

        const allBadges = await Badge.find({ userId });
        res.json({ success: true, badges: allBadges });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all badges for an artist
router.get('/:userId', async (req, res) => {
    const badges = await Badge.find({ userId: req.params.userId });
    res.json(badges);
});

module.exports = router;