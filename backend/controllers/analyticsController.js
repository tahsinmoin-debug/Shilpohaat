const Order = require('../models/Order');

exports.getArtistAnalytics = async (req, res) => {
  try {
    const artistId = req.query.firebaseUID;

    // 1. Summary Stats: Total Revenue and Total Orders for this Artist
    const summary = await Order.aggregate([
      { $unwind: "$items" },
      // Note: This matches based on the item within the order
      { $match: { "items.artistId": artistId, paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          totalSales: { $sum: "$items.quantity" }
        }
      }
    ]);

    // 2. Graph Data: Daily Revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const graphData = await Order.aggregate([
      { $unwind: "$items" },
      { 
        $match: { 
          "items.artistId": artistId, 
          paymentStatus: "paid",
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
      success: true,
      summary: summary[0] || { totalRevenue: 0, totalSales: 0 },
      graphData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};