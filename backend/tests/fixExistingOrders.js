const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const User = require('../models/User');

async function fixExistingOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get all orders without artistId
    const ordersWithoutArtistId = await Order.find({
      'items.artistId': { $exists: false }
    });

    console.log(`\nFound ${ordersWithoutArtistId.length} orders without artistId`);

    let updatedCount = 0;

    for (const order of ordersWithoutArtistId) {
      let orderModified = false;

      // Update each item with artistId
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        
        // Fetch artwork to get artist
        const artwork = await Artwork.findById(item.artworkId).populate('artist', 'firebaseUID');
        
        if (artwork && artwork.artist && artwork.artist.firebaseUID) {
          order.items[i].artistId = artwork.artist.firebaseUID;
          orderModified = true;
          console.log(`  ✓ Added artistId ${artwork.artist.firebaseUID} to order ${order._id}`);
        } else {
          console.log(`  ⚠ Could not find artist for artwork ${item.artworkId} in order ${order._id}`);
        }
      }

      if (orderModified) {
        await order.save();
        updatedCount++;
      }
    }

    console.log(`\n✓ Updated ${updatedCount} orders with artistId`);

    // Now update payment status for COD orders to "paid" for testing
    console.log('\n=== UPDATING COD ORDERS TO PAID ===');
    const codOrders = await Order.find({
      paymentMethod: 'cod',
      paymentStatus: 'pending'
    });

    console.log(`Found ${codOrders.length} COD orders with pending status`);

    for (const order of codOrders) {
      order.paymentStatus = 'paid';
      await order.save();
      console.log(`  ✓ Updated order ${order._id} to paid status`);
    }

    console.log(`\n✓ Updated ${codOrders.length} COD orders to paid status`);

    // Verify the fix
    console.log('\n=== VERIFICATION ===');
    const ordersWithArtistId = await Order.aggregate([
      { $unwind: "$items" },
      { 
        $match: { 
          "items.artistId": { $exists: true, $ne: null },
          paymentStatus: "paid"
        } 
      }
    ]);

    console.log(`✓ Found ${ordersWithArtistId.length} paid order items with artistId`);

    if (ordersWithArtistId.length > 0) {
      console.log('\nSample order item:');
      console.log('  Artist ID:', ordersWithArtistId[0].items.artistId);
      console.log('  Payment Status:', ordersWithArtistId[0].paymentStatus);
      console.log('  Price:', ordersWithArtistId[0].items.price);
      console.log('  Quantity:', ordersWithArtistId[0].items.quantity);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

fixExistingOrders();
