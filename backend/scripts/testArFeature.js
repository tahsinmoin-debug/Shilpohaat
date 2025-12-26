// Test script for AR feature
// Run with: node backend/scripts/testArFeature.js

require('dotenv').config();
const mongoose = require('mongoose');
const Artwork = require('../models/Artwork');

const testArFeature = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if arModelUrl field exists
    const schema = Artwork.schema.obj;
    if (schema.arModelUrl) {
      console.log('✅ arModelUrl field exists in Artwork schema');
      console.log('   Type:', schema.arModelUrl.type);
      console.log('   Default:', schema.arModelUrl.default);
    } else {
      console.log('❌ arModelUrl field NOT found in schema');
    }

    // Check existing artworks
    const artworks = await Artwork.find({}).limit(5);
    console.log(`\n📊 Found ${artworks.length} artworks in database`);

    // Check for AR-enabled artworks
    const arArtworks = await Artwork.find({ arModelUrl: { $ne: null, $ne: '' } });
    console.log(`✨ ${arArtworks.length} artworks have AR models`);

    if (arArtworks.length > 0) {
      console.log('\n🎨 AR-Enabled Artworks:');
      arArtworks.forEach((artwork, idx) => {
        console.log(`  ${idx + 1}. ${artwork.title}`);
        console.log(`     AR Model: ${artwork.arModelUrl}`);
        console.log(`     Dimensions: ${artwork.dimensions?.width}x${artwork.dimensions?.height} ${artwork.dimensions?.unit}`);
      });
    }

    // Test sample AR model URL (Cloudinary format)
    const sampleUrl = 'https://res.cloudinary.com/demo/raw/upload/v1234567890/shilpohaat/models/test.glb';
    console.log('\n🔗 Sample AR Model URL format:');
    console.log(`   ${sampleUrl}`);

    console.log('\n✅ AR Feature Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Upload artwork with GLB file via /artist/artworks/new');
    console.log('   2. Visit artwork detail page');
    console.log('   3. Click "View on Wall (AR)" button');
    console.log('   4. Test on mobile device (Android Chrome or iOS Safari)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

testArFeature();
