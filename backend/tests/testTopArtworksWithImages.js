const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const Artwork = require('../models/Artwork');

async function testTopArtworksWithImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const artistId = 'GSk7J8xFb7ZritwQp0u5FKxJ7jo2';
    
    console.log('\n=== TESTING TOP ARTWORKS WITH IMAGES ===');

    // Get top artworks
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
      { $limit: 5 }
    ]);

    console.log('\nTop artworks from aggregation:', topArtworks.length);

    // Enrich with images
    const enrichedTopArtworks = await Promise.all(
      topArtworks.map(async (item) => {
        console.log(`\nFetching artwork: ${item._id}`);
        const artwork = await Artwork.findById(item._id).select('images');
        console.log('  Artwork found:', !!artwork);
        console.log('  Images array:', artwork?.images);
        console.log('  First image:', artwork?.images?.[0]);
        
        return {
          artworkId: item._id.toString(),
          title: item.title,
          sales: item.sales,
          revenue: item.revenue,
          image: artwork?.images?.[0] || null
        };
      })
    );

    console.log('\n=== ENRICHED TOP ARTWORKS ===');
    console.log(JSON.stringify(enrichedTopArtworks, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

testTopArtworksWithImages();
