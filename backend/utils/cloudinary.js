const cloudinary = require('../config/cloudinary');

/**
 * Upload image to Cloudinary from base64 string
 * @param {string} base64String - Base64 encoded image string (with or without data URI prefix)
 * @param {string} folder - Cloudinary folder name (e.g., 'artworks', 'artists', 'blog')
 * @param {string} publicId - Optional custom public ID for the image
 * @returns {Promise<Object>} - Cloudinary upload response with secure_url
 */
const uploadToCloudinary = async (base64String, folder = 'shilpohaat', publicId = null) => {
  try {
    // Ensure the base64 string has the data URI prefix
    let imageData = base64String;
    if (!base64String.startsWith('data:')) {
      // If no prefix, assume it's a JPEG
      imageData = `data:image/jpeg;base64,${base64String}`;
    }

    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }, // Auto quality and format
        { width: 2000, crop: 'limit' }, // Limit max width to 2000px
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(imageData, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} base64Array - Array of base64 encoded images
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<string>>} - Array of Cloudinary URLs
 */
const uploadMultipleToCloudinary = async (base64Array, folder = 'shilpohaat') => {
  try {
    const uploadPromises = base64Array.map((base64) => 
      uploadToCloudinary(base64, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    return results.map(result => result.url);
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error(`Failed to upload multiple images: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

/**
 * Extract Cloudinary public ID from URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
const extractPublicId = (url) => {
  try {
    // Example URL: https://res.cloudinary.com/dt0mwoirn/image/upload/v1234567890/artworks/abc123.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get everything after /upload/v{version}/
    const pathParts = parts.slice(uploadIndex + 2);
    const publicIdWithExt = pathParts.join('/');
    
    // Remove file extension
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Replace old images with new ones in Cloudinary
 * @param {Array<string>} oldUrls - Array of old Cloudinary URLs to delete
 * @param {Array<string>} newBase64Array - Array of new base64 images to upload
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<string>>} - Array of new Cloudinary URLs
 */
const replaceImages = async (oldUrls = [], newBase64Array = [], folder = 'shilpohaat') => {
  try {
    // Delete old images
    if (oldUrls && oldUrls.length > 0) {
      const deletePromises = oldUrls
        .map(url => extractPublicId(url))
        .filter(publicId => publicId !== null)
        .map(publicId => deleteFromCloudinary(publicId));
      
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} old images`);
    }

    // Upload new images
    if (newBase64Array && newBase64Array.length > 0) {
      const newUrls = await uploadMultipleToCloudinary(newBase64Array, folder);
      return newUrls;
    }

    return [];
  } catch (error) {
    console.error('Error replacing images:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  replaceImages,
};
