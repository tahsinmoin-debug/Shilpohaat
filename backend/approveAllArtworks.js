require('dotenv').config();
const mongoose = require('mongoose');
const Artwork = require('./models/Artwork');

async function approveAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    const result = await Artwork.updateMany(
      { moderationStatus: 'pending' },
      { $set: { moderationStatus: 'approved' } }
    );
    
    console.log(`\n✓ Approved ${result.modifiedCount} artworks`);
    
    const approved = await Artwork.find({ moderationStatus: 'approved' }).select('title');
    console.log('\nApproved artworks:');
    approved.forEach(a => console.log(`  - ${a.title}`));
    
    mongoose.disconnect();
    console.log('\n✓ Done! Your artworks are now visible.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

approveAll();
