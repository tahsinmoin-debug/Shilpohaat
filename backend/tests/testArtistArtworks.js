require('dotenv').config();
const mongoose = require('mongoose');
const Artwork = require('../models/Artwork');
const User = require('../models/User');

async function testArtistArtworks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an artist user
    const artist = await User.findOne({ role: 'artist' });
    if (!artist) {
      console.log('No artist found in database');
      return;
    }

    console.log('\n=== Artist Info ===');
    console.log('Artist MongoDB ID:', artist._id);
    console.log('Artist Firebase UID:', artist.firebaseUID);
    console.log('Artist Name:', artist.name);
    console.log('Artist Email:', artist.email);

    // Find artworks by this artist
    const artworks = await Artwork.find({ artist: artist._id });
    
    console.log('\n=== Artworks for this artist ===');
    console.log('Total artworks:', artworks.length);
    
    if (artworks.length > 0) {
      artworks.forEach((artwork, index) => {
        console.log(`\nArtwork ${index + 1}:`);
        console.log('  ID:', artwork._id);
        console.log('  Title:', artwork.title);
        console.log('  Artist ID:', artwork.artist);
        console.log('  Price:', artwork.price);
        console.log('  Images:', artwork.images.length);
      });
    } else {
      console.log('No artworks found for this artist');
    }

    // Test the API endpoint format
    console.log('\n=== API Endpoint Test ===');
    console.log(`Should call: /api/artworks/artist/${artist._id}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testArtistArtworks();
