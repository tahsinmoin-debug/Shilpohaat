require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ArtistProfile = require('../models/ArtistProfile');
const Artwork = require('../models/Artwork');

async function seedFeaturedArtists() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shilpohaat';
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    // Get all artist profiles
    const profiles = await ArtistProfile.find({});
    
    if (profiles.length === 0) {
      console.log('⚠ No artist profiles found. Run seedArtists.js first!');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Update each profile with random but realistic data
    for (const profile of profiles) {
      // Randomly feature some artists (30% chance)
      profile.isFeatured = Math.random() < 0.3;
      
      // Random rating between 3.5 and 5.0
      profile.rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
      
      // Random number of reviews between 5 and 50
      profile.totalReviews = Math.floor(Math.random() * 45) + 5;
      
      // Random profile views between 50 and 500
      profile.profileViews = Math.floor(Math.random() * 450) + 50;
      
      // Random total artworks between 5 and 30
      profile.totalArtworks = Math.floor(Math.random() * 25) + 5;
      
      // Random total sales between 0 and 20
      profile.totalSales = Math.floor(Math.random() * 20);

      await profile.save();
      
      const user = await User.findById(profile.user);
      console.log(`✓ Updated ${user?.name || 'Unknown'}: Featured=${profile.isFeatured}, Rating=${profile.rating}, Views=${profile.profileViews}`);
    }

    console.log('\n✅ Successfully updated all artist profiles with featured data!');
    console.log(`📊 Total artists updated: ${profiles.length}`);
    console.log(`⭐ Featured artists: ${profiles.filter(p => p.isFeatured).length}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedFeaturedArtists();