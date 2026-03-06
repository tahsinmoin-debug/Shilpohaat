const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload message image
router.post('/message-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'shilpohaat/messages',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload generic image (used by verification and other modules)
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'shilpohaat/uploads',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      return res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed, using local fallback:', cloudinaryError.message);

      const uploadsDir = path.resolve(__dirname, '../uploads/nid');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeExt = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
      const filename = `nid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      const localUrl = `${req.protocol}://${req.get('host')}/uploads/nid/${filename}`;
      return res.json({
        success: true,
        url: localUrl,
        storage: 'local',
      });
    }
  } catch (error) {
    console.error('Generic image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

module.exports = router;
