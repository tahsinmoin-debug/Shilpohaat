const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const User = require('../models/User');

async function testOrderAnalytics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get the most recent order
    const recentOrder = await Order.findOne().sort({ createdAt: -1 });
    
    if (!recentOrder) {
      console.log('❌ No orders found in database');
      return;
    }

    console.log('\n=== MOST RECENT ORDER ===');
    console.log('Order ID:', recentOrder._id);
    console.log('Created At:', recentOrder.createdAt);
    console.log('Payment Status:', recentOrder.paymentStatus);
    console.log('Payment Method:', recentOrder.paymentMethod);
    console.log('Total Amount:', recentOrder.totalAmount);
    
    console.log('\n=== ORDER ITEMS ===');
    recentOrder.items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log('  Artwork ID:', item.artworkId);
      console.log('  Artist ID:', item.artistId || '❌ MISSING');
      console.log('  Title:', item.title);
      console.log('  Price:', item.price);
      console.log('  Quantity:', item.quantity);
    });

    // Check if there are any paid orders with artistId
    const paidOrdersWithArtist = await Order.aggregate([
      { $unwind: "$items" },
      { 
        $match: { 
          paymentStatus: "paid",
          "items.artistId": { $exists: true, $ne: null }
        } 
      },
      { $limit: 5 }
    ]);

    console.log('\n=== PAID ORDERS WITH ARTIST ID ===');
    console.log('Count:', paidOrdersWithArtist.length);
    
    if (paidOrdersWithArtist.length > 0) {
      paidOrdersWithArtist.forEach((order, index) => {
        console.log(`\nPaid Order ${index + 1}:`);
        console.log('  Artist ID:', order.items.artistId);
        console.log('  Payment Status:', order.paymentStatus);
        console.log('  Price:', order.items.price);
        console.log('  Quantity:', order.items.quantity);
      });
    } else {
      console.log('❌ No paid orders with artistId found');
      console.log('\nPossible issues:');
      console.log('1. Payment status is not "paid" (might be "pending")');
      console.log('2. Artist ID was not saved when order was created');
      console.log('3. Need to update payment status to "paid" for testing');
    }

    // Check all orders regardless of payment status
    const allOrdersWithArtist = await Order.aggregate([
      { $unwind: "$items" },
      { 
        $match: { 
          "items.artistId": { $exists: true, $ne: null }
        } 
      },
      { $limit: 5 }
    ]);

    console.log('\n=== ALL ORDERS WITH ARTIST ID (any payment status) ===');
    console.log('Count:', allOrdersWithArtist.length);
    
    if (allOrdersWithArtist.length > 0) {
      allOrdersWithArtist.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log('  Artist ID:', order.items.artistId);
        console.log('  Payment Status:', order.paymentStatus);
        console.log('  Price:', order.items.price);
      });
    }

    // Get artist info to test analytics query
    if (recentOrder.items[0]?.artistId) {
      const artistId = recentOrder.items[0].artistId;
      console.log('\n=== TESTING ANALYTICS QUERY ===');
      console.log('Testing with Artist ID:', artistId);
      
      const analyticsResult = await Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.artistId": artistId, paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            totalSales: { $sum: "$items.quantity" }
          }
        }
      ]);

      console.log('Analytics Result:', analyticsResult);
      
      if (analyticsResult.length === 0) {
        console.log('❌ No analytics data found');
        console.log('This means either:');
        console.log('  1. No orders with this artistId have paymentStatus="paid"');
        console.log('  2. Need to update payment status to "paid"');
      } else {
        console.log('✓ Analytics data found!');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

testOrderAnalytics();
