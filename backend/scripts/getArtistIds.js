// Quick script to get artist IDs from database
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function getArtistIds() {
  await connectDB();

  const User = require('../models/User');
  const ArtistProfile = require('../models/ArtistProfile');

  console.log('📋 Finding artists in database...\n');

  // Find all artists
  const artists = await User.find({ role: 'artist' }).populate('artistProfile');

  if (artists.length === 0) {
    console.log('❌ No artists found in database!');
    console.log('💡 Create an artist profile first at: http://localhost:3000/create-profile\n');
  } else {
    console.log(`Found ${artists.length} artist(s):\n`);
    
    artists.forEach((artist, index) => {
      console.log(`${index + 1}. Artist: ${artist.name || 'Unknown'}`);
      console.log(`   Email: ${artist.email}`);
      console.log(`   User ID: ${artist._id}`);
      
      if (artist.artistProfile) {
        console.log(`   ✅ Artist Profile ID: ${artist.artistProfile._id}`);
        console.log(`   Name: ${artist.artistProfile.name || 'Not set'}`);
        console.log(`   Bio: ${artist.artistProfile.bio?.substring(0, 50) || 'Not set'}...`);
      } else {
        console.log(`   ❌ No artist profile linked yet`);
      }
      console.log('');
    });

    console.log('📌 Use the "Artist Profile ID" in your artwork upload!\n');
  }

  // Also show all artist profiles
  const allProfiles = await ArtistProfile.find();
  
  if (allProfiles.length > 0) {
    console.log(`\n📂 All Artist Profiles (${allProfiles.length}):\n`);
    allProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. Profile ID: ${profile._id}`);
      console.log(`   Name: ${profile.name || 'Not set'}`);
      console.log(`   User: ${profile.user || 'Not linked'}`);
      console.log('');
    });
  }

  process.exit(0);
}

getArtistIds().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
