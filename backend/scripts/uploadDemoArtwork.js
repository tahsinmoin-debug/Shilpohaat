const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ========================================
// 🎨 EDIT THESE VALUES:
// ========================================

// 1. PUT YOUR IMAGE FILE PATH HERE (Windows path example)
const IMAGE_PATH = 'C:/Users/YourName/Desktop/painting.jpg';
// Or use: 'F:/Shilpohaat/my-artwork.jpg'

// 2. CHOOSE AN ARTIST ID FROM THE LIST ABOVE
const ARTIST_ID = '6919ddb7f84d61379612c5bb'; // Change this!

// 3. YOUR ARTWORK DETAILS
const ARTWORK_DETAILS = {
  title: 'Beautiful Sunset Painting',
  description: 'A vibrant painting capturing the beauty of sunset over the hills',
  price: 5000, // Price in BDT
  category: 'Paintings', // Options: Paintings, Sculptures, Textiles, Jewelry, Photography, Digital Art, Mixed Media, Other
  materials: ['Oil', 'Canvas'],
  dimensions: {
    width: 24,
    height: 36,
    unit: 'inches'
  },
  inStock: true,
  stockQuantity: 1,
  tags: ['sunset', 'landscape', 'nature']
};

// ========================================
// 🚀 SCRIPT (Don't edit below)
// ========================================

function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Detect mime type from extension
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error('❌ Error reading image file:', error.message);
    console.log('\n💡 Tips:');
    console.log('   - Check if the file path is correct');
    console.log('   - Use forward slashes (/) or double backslashes (\\\\)');
    console.log('   - Example: "C:/Users/Name/Desktop/image.jpg"');
    process.exit(1);
  }
}

async function uploadArtwork() {
  console.log('🎨 Shilpohaat - Upload Artwork to Cloudinary\n');
  console.log('━'.repeat(50));
  
  // Step 1: Check if image exists
  console.log('\n📂 Step 1: Reading image file...');
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`❌ Image file not found: ${IMAGE_PATH}`);
    console.log('\n💡 Please update IMAGE_PATH in this script with your actual image location.\n');
    process.exit(1);
  }
  
  const fileSize = fs.statSync(IMAGE_PATH).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  console.log(`✅ Found image: ${path.basename(IMAGE_PATH)} (${fileSizeMB} MB)`);
  
  // Step 2: Convert to base64
  console.log('\n🔄 Step 2: Converting image to base64...');
  const base64Image = imageToBase64(IMAGE_PATH);
  console.log(`✅ Converted successfully (${(base64Image.length / 1024).toFixed(0)} KB base64)`);
  
  // Step 3: Prepare artwork data
  console.log('\n📝 Step 3: Preparing artwork data...');
  const artworkData = {
    ...ARTWORK_DETAILS,
    artistId: ARTIST_ID,
    images: [base64Image]
  };
  console.log(`✅ Title: "${artworkData.title}"`);
  console.log(`✅ Price: ${artworkData.price} BDT`);
  console.log(`✅ Artist ID: ${ARTIST_ID}`);
  
  // Step 4: Upload to API
  console.log('\n🚀 Step 4: Uploading to Cloudinary via API...');
  console.log('   (This may take a few seconds for large images)');
  
  try {
    const response = await axios.post('http://localhost:5000/api/artworks', artworkData, {
      const response = await axios.post('http://localhost:5000/api/artworks', artworkData, {
      headers: {
        'Content-Type': 'application/json',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000 // 60 second timeout
    });
    
    console.log('\n━'.repeat(50));
    console.log('🎉 SUCCESS! Artwork uploaded to Cloudinary!\n');
    console.log('📋 Artwork Details:');
    console.log(`   ID: ${response.data.artwork._id}`);
    console.log(`   Title: ${response.data.artwork.title}`);
    console.log(`   Price: ${response.data.artwork.price} BDT`);
    console.log(`   Category: ${response.data.artwork.category}`);
    console.log(`   In Stock: ${response.data.artwork.inStock}`);
    console.log('\n🖼️  Cloudinary Image URL:');
    console.log(`   ${response.data.artwork.images[0]}`);
    console.log('\n🌐 View on website:');
    console.log(`   http://localhost:3000/artworks/${response.data.artwork._id}`);
    console.log('━'.repeat(50));
    
  } catch (error) {
    console.log('\n━'.repeat(50));
    console.error('❌ Upload failed!\n');
    
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Error Message:', error.response.data.message || error.response.data);
      
      if (error.response.status === 404) {
        console.log('\n💡 Artist not found! Make sure the ARTIST_ID is correct.');
        console.log('   Run: node scripts/getArtistIds.js');
      } else if (error.response.status === 500) {
        console.log('\n💡 Server error. Check if:');
        console.log('   - Backend server is running (node index.js)');
        console.log('   - MongoDB is connected');
        console.log('   - Cloudinary credentials are correct in .env');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to backend server!');
      console.log('\n💡 Start the backend server first:');
      console.log('   cd f:\\Shilpohaat\\backend');
      console.log('   node index.js');
    } else {
      console.error('Error:', error.message);
    }
    console.log('━'.repeat(50));
    process.exit(1);
  }
}

// Run the upload
uploadArtwork();
