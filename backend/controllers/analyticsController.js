const Order = require('../models/Order');

exports.getArtistAnalytics = async (req, res) => {
  try {
    const artistId = req.query.firebaseUID;

    // 1. Summary Stats: Total Revenue and Total Orders for this Artist
    // Note: We need to calculate the artist's share from the totalAmount proportionally
    const summary = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.artistId": artistId } },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$_id" },
          orderTotal: { $first: "$totalAmount" },
          orderSubtotal: { $first: "$subtotal" },
          artistItemsTotal: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          artistItemsCount: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          // Calculate artist's proportional share of the discounted total
          artistRevenue: {
            $multiply: [
              "$orderTotal",
              { $divide: ["$artistItemsTotal", "$orderSubtotal"] }
            ]
          },
          artistItemsCount: 1
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$artistRevenue" },
          totalSales: { $sum: "$artistItemsCount" }
        }
      }
    ]);

    const summaryData = summary[0] || { totalRevenue: 0, totalSales: 0 };
    
    // Calculate average order value
    const averageOrderValue = summaryData.totalSales > 0 
      ? Math.round(summaryData.totalRevenue / summaryData.totalSales) 
      : 0;

    // Count pending payments (including COD orders) - also use proportional calculation
    const pendingPayments = await Order.aggregate([
      { $match: { paymentStatus: "pending" } },
      { $unwind: "$items" },
      { $match: { "items.artistId": artistId } },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$_id" },
          orderTotal: { $first: "$totalAmount" },
          orderSubtotal: { $first: "$subtotal" },
          artistItemsTotal: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          artistItemsCount: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          artistRevenue: {
            $multiply: [
              "$orderTotal",
              { $divide: ["$artistItemsTotal", "$orderSubtotal"] }
            ]
          },
          artistItemsCount: 1
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: "$artistItemsCount" },
          pendingRevenue: { $sum: "$artistRevenue" }
        }
      }
    ]);

    const pendingData = pendingPayments[0] || { count: 0, pendingRevenue: 0 };

    // 2. Graph Data: Daily Revenue and Sales for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const graphData = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid",
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { $unwind: "$items" },
      { $match: { "items.artistId": artistId } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orderId: "$_id"
          },
          orderTotal: { $first: "$totalAmount" },
          orderSubtotal: { $first: "$subtotal" },
          artistItemsTotal: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          artistItemsCount: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          date: "$_id.date",
          artistRevenue: {
            $multiply: [
              "$orderTotal",
              { $divide: ["$artistItemsTotal", "$orderSubtotal"] }
            ]
          },
          sales: "$artistItemsCount"
        }
      },
      {
        $group: {
          _id: "$date",
          revenue: { $sum: "$artistRevenue" },
          sales: { $sum: "$sales" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 3. Top Performing Artworks - also use proportional calculation
    const topArtworks = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      { $match: { "items.artistId": artistId } },
      {
        $group: {
          _id: {
            artworkId: "$items.artworkId",
            orderId: "$_id"
          },
          title: { $first: "$items.title" },
          orderTotal: { $first: "$totalAmount" },
          orderSubtotal: { $first: "$subtotal" },
          artistItemsTotal: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          artistItemsCount: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          artworkId: "$_id.artworkId",
          title: 1,
          artistRevenue: {
            $multiply: [
              "$orderTotal",
              { $divide: ["$artistItemsTotal", "$orderSubtotal"] }
            ]
          },
          sales: "$artistItemsCount"
        }
      },
      {
        $group: {
          _id: "$artworkId",
          title: { $first: "$title" },
          sales: { $sum: "$sales" },
          revenue: { $sum: "$artistRevenue" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Populate artwork images
    const Artwork = require('../models/Artwork');
    const enrichedTopArtworks = await Promise.all(
      topArtworks.map(async (item) => {
        const artwork = await Artwork.findById(item._id).select('images');
        return {
          artworkId: item._id.toString(),
          title: item.title,
          sales: item.sales,
          revenue: item.revenue,
          image: artwork?.images?.[0] || null
        };
      })
    );

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue: summaryData.totalRevenue,
        totalSales: summaryData.totalSales,
        averageOrderValue: averageOrderValue,
        conversionRate: 0, // Placeholder for future implementation
        pendingPayments: pendingData.count,
        pendingRevenue: pendingData.pendingRevenue
      },
      graphData,
      topArtworks: enrichedTopArtworks,
      profileViews: 0, // Placeholder - would need separate tracking
      totalArtworks: 0 // Placeholder - would need separate query
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};