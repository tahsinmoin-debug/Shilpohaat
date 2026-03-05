const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');

async function testTopArtworks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Test with the artist ID we know has sales
    const artistId = 'GSk7J8xFb7ZritwQp0u5FKxJ7jo2';
    
    console.log('\n=== TESTING TOP ARTWORKS QUERY ===');
    console.log('Artist ID:', artistId);

    const topArtworks = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.artistId": artistId, paymentStatus: "paid" } },
      {
        $group: {
          _id: "$items.artworkId",
          title: { $first: "$items.title" },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          artworkId: "$_id",
          title: 1,
          sales: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    console.log('\n=== TOP ARTWORKS RESULT ===');
    console.log('Count:', topArtworks.length);
    console.log('Data:', JSON.stringify(topArtworks, null, 2));

    if (topArtworks.length === 0) {
      console.log('\n❌ No top artworks found');
      
      // Debug: Check what data exists
      console.log('\n=== DEBUG: Checking raw order data ===');
      const rawOrders = await Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.artistId": artistId, paymentStatus: "paid" } },
        { $limit: 5 }
      ]);
      
      console.log('Raw orders count:', rawOrders.length);
      if (rawOrders.length > 0) {
        console.log('Sample order item:');
        console.log('  Artwork ID:', rawOrders[0].items.artworkId);
        console.log('  Title:', rawOrders[0].items.title);
        console.log('  Price:', rawOrders[0].items.price);
        console.log('  Quantity:', rawOrders[0].items.quantity);
        console.log('  Artist ID:', rawOrders[0].items.artistId);
        console.log('  Payment Status:', rawOrders[0].paymentStatus);
      }
    } else {
      console.log('\n✓ Top artworks found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

testTopArtworks();
