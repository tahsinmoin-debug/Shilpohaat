require('dotenv').config();
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Category images with your provided paths
const categoryImages = {
  'abstract': 'C:\\Users\\Admin\\Downloads\\understanding-abstract-art.jpg',
  'landscape': 'C:\\Users\\Admin\\Downloads\\1200px-August_Wilhelm_Leu_-_Sonniger_Tag_an_einem_norwegischen_Fjord_28186229-1024x730.jpg',
  'portrait': 'C:\\Users\\Admin\\Downloads\\image56.png',
  'modern-art': 'C:\\Users\\Admin\\Downloads\\81TPKTvFbQL._AC_UF894,1000_QL80_.jpg',
  'traditional-art': 'C:\\Users\\Admin\\Downloads\\Melody in life.jpg',
  'nature-wildlife': 'C:\\Users\\Admin\\Downloads\\1999130-Kuhnert-Elephants.jpg',
  'cityscape': 'C:\\Users\\Admin\\Downloads\\feeling-groovy_PK-FG24-original-art-painting-paul-kenton-product-780x780.jpg',
  'floral-art': 'C:\\Users\\Admin\\Downloads\\71xsHbmfjFL._AC_UF894,1000_QL80_.jpg',
  'minimalist': 'C:\\Users\\Admin\\Downloads\\71cTNCEFrxL.jpg',
  'pop-art': 'C:\\Users\\Admin\\Downloads\\photo-1619632973808-4acf8041df42.jpg',
  'digital-art': 'C:\\Users\\Admin\\Downloads\\character-9038820_640.jpg',
  'acrylic': 'C:\\Users\\Admin\\Downloads\\photo-1607893378714-007fd47c8719.jpg',
  'oil': 'C:\\Users\\Admin\\Downloads\\81vfUoMCcOL._AC_SL1000_.jpg',
  'watercolor': 'C:\\Users\\Admin\\Downloads\\illustration-graphic-of-lake-house-on-watercolor-painting-style-good-for-print-on-postcard-poster-or-background-free-vector.jpg',
  'mixed-media': 'C:\\Users\\Admin\\Downloads\\1_HmgaG40pcgQpN75xGfxvag.png'
};

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
    console.error(`❌ Error reading ${imagePath}:`, error.message);
    return null;
  }
}

async function uploadCategoryImages() {
  console.log('🎨 Uploading Category Images to Cloudinary\n');
  console.log('━'.repeat(60));
  
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const [category, imagePath] of Object.entries(categoryImages)) {
    console.log(`\n📂 Processing: ${category}`);
    console.log(`   File: ${path.basename(imagePath)}`);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`   ❌ File not found!`);
      failCount++;
      continue;
    }

    // Convert to base64
    const base64Image = imageToBase64(imagePath);
    if (!base64Image) {
      failCount++;
      continue;
    }

    // Upload to Cloudinary
    try {
      const result = await uploadToCloudinary(
        base64Image, 
        'shilpohaat/categories',
        category // Use category name as public ID
      );
      
      console.log(`   ✅ Uploaded successfully!`);
      console.log(`   🔗 URL: ${result.url}`);
      
      results.push({
        category,
        url: result.url,
        publicId: result.publicId
      });
      
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ Upload failed:`, error.message);
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(60));
  console.log('🎉 Upload Summary\n');
  console.log(`✅ Successful: ${successCount}/15`);
  console.log(`❌ Failed: ${failCount}/15`);
  
  if (results.length > 0) {
    console.log('\n📋 Cloudinary URLs:\n');
    results.forEach(({ category, url }) => {
      console.log(`${category}: ${url}`);
    });
    
    console.log('\n💡 Copy these URLs to update your categories page!');
  }
  
  console.log('━'.repeat(60));
}

// Run the upload
uploadCategoryImages().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
