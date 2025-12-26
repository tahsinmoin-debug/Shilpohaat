const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Artwork = require('../models/Artwork');

dotenv.config();

async function checkArtworks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check total artworks
    const totalArtworks = await Artwork.countDocuments();
    console.log(`Total artworks in database: ${totalArtworks}`);

    // Check approved artworks
    const approvedArtworks = await Artwork.countDocuments({
      moderationStatus: 'approved',
    });
    console.log(`Approved artworks: ${approvedArtworks}`);

    // Check available artworks
    const availableArtworks = await Artwork.countDocuments({
      status: 'available',
    });
    console.log(`Available artworks: ${availableArtworks}`);

    // Check approved AND available
    const readyArtworks = await Artwork.countDocuments({
      moderationStatus: 'approved',
      status: 'available',
    });
    console.log(`Approved + Available artworks: ${readyArtworks}`);

    // Show sample of what exists
    console.log('\n--- Sample Artworks ---');
    const samples = await Artwork.find({})
      .populate('artist', 'name')
      .limit(5)
      .lean();

    samples.forEach((art) => {
      console.log(`
Title: ${art.title}
Category: ${art.category}
Price: ${art.price}
Status: ${art.status}
Moderation: ${art.moderationStatus}
Artist: ${art.artist?.name || 'Unknown'}
      `);
    });

    // Check for different moderationStatus values
    const statusGroups = await Artwork.aggregate([
      {
        $group: {
          _id: '$moderationStatus',
          count: { $sum: 1 },
        },
      },
    ]);
    console.log('\n--- Moderation Status Distribution ---');
    statusGroups.forEach((group) => {
      console.log(`${group._id}: ${group.count} artworks`);
    });

    // Check for different status values
    const availabilityGroups = await Artwork.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    console.log('\n--- Availability Status Distribution ---');
    availabilityGroups.forEach((group) => {
      console.log(`${group._id}: ${group.count} artworks`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Database check complete');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkArtworks();
