const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Helper function to convert image file to base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${base64Image}`;
}

// Upload artwork with image
async function uploadArtwork() {
  try {
    // STEP 1: Put your image file path here
    const imagePath = 'path/to/your/image.jpg'; // Change this to your actual image path
    
    // STEP 2: Convert image to base64
    const base64Image = imageToBase64(imagePath);
    
    // STEP 3: Prepare artwork data
    const artworkData = {
      title: 'Beautiful Painting',
      description: 'A stunning landscape painting showcasing vibrant colors',
      price: 15000,
      category: 'Paintings',
      images: [base64Image], // Can add multiple images
      artistId: 'YOUR_ARTIST_ID', // Replace with actual artist ID from database
      dimensions: {
        width: 24,
        height: 36,
        unit: 'inches'
      },
      materials: ['Oil', 'Canvas'],
      inStock: true,
      stockQuantity: 1
    };
    
    // STEP 4: Upload to your API
    const response = await axios.post('http://localhost:5000/api/artworks', artworkData, {
      const response = await axios.post('http://localhost:5000/api/artworks', artworkData, {
      headers: {
        'Content-Type': 'application/json',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    console.log('✅ Artwork uploaded successfully!');
    console.log('Artwork ID:', response.data.artwork._id);
    console.log('Cloudinary Image URLs:', response.data.artwork.images);
    console.log('\nFull response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Upload failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the upload
uploadArtwork();
