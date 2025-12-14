const express = require('express');
const router = express.Router();
const { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.js');

// Upload single image
// POST /api/upload/image
router.post('/image', async (req, res) => {
  try {
    const { image, folder = 'shilpohaat/general' } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const result = await uploadToCloudinary(image, folder);
    
    return res.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message 
    });
  }
});

// Upload multiple images
// POST /api/upload/images
router.post('/images', async (req, res) => {
  try {
    const { images, folder = 'shilpohaat/general' } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Images array is required' });
    }

    const urls = await uploadMultipleToCloudinary(images, folder);
    
    return res.json({
      success: true,
      urls,
      count: urls.length,
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    return res.status(500).json({ 
      message: 'Failed to upload images', 
      error: error.message 
    });
  }
});

// Delete image
// DELETE /api/upload/image
router.delete('/image', async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const result = await deleteFromCloudinary(publicId);
    
    return res.json({
      success: result.success,
      message: result.success ? 'Image deleted successfully' : 'Failed to delete image',
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    return res.status(500).json({ 
      message: 'Failed to delete image', 
      error: error.message 
    });
  }
});

module.exports = router;
