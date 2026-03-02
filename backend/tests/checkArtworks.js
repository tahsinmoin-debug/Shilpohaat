require('dotenv').config();
const mongoose = require('mongoose');
const Artwork = require('../models/Artwork');

async function checkArtworks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    const total = await Artwork.countDocuments({});
    console.log(`\nTotal artworks in database: ${total}`);
    
    const byStatus = await Artwork.aggregate([
      { $group: { _id: '$moderationStatus', count: { $sum: 1 } } }
    ]);
    console.log('\nArtworks by moderation status:');
    byStatus.forEach(s => console.log(`  ${s._id || 'undefined'}: ${s.count}`));
    
    const sample = await Artwork.find({}).limit(3).select('title moderationStatus status');
    console.log('\nSample artworks:');
    sample.forEach(a => console.log(`  - ${a.title} (moderationStatus: ${a.moderationStatus || 'undefined'}, status: ${a.status})`));
    
    // Check what would be returned by the public API
    const publicQuery = {
      $or: [
        { moderationStatus: 'approved' },
        { moderationStatus: { $exists: false } },
      ]
    };
    const publicCount = await Artwork.countDocuments(publicQuery);
    console.log(`\nArtworks visible to public (approved or no moderationStatus): ${publicCount}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkArtworks();
