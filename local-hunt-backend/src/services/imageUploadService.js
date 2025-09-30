// src/services/imageUploadService.js
const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary config

class ImageUploadService {
  /**
   * Uploads a single image file to Cloudinary.
   * @param {string} filePath - The local path to the file to upload (from Multer).
   * @param {string} folder - The folder name in Cloudinary to upload to (e.g., 'localhunt/vendors/logos').
   * @returns {Promise<string>} The secure URL of the uploaded image.
   */
  static async uploadImage(filePath, folder) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder, // Specify folder in Cloudinary
        resource_type: 'image', // Ensure it's treated as an image
        quality: 'auto', // Optimize quality
        fetch_format: 'auto', // Optimize format
      });
      return result.secure_url; // Return the secure URL
    } catch (error) {
      console.error('Cloudinary upload error:', error.message, error.http_code);
      throw new Error('Image upload failed: ' + error.message);
    }
  }

  /**
   * Uploads multiple image files to Cloudinary.
   * @param {Array<string>} filePaths - An array of local paths to files.
   * @param {string} folder - The folder name in Cloudinary.
   * @returns {Promise<Array<string>>} An array of secure URLs for the uploaded images.
   */
  static async uploadMultipleImages(filePaths, folder) {
    const uploadPromises = filePaths.map(filePath =>
      ImageUploadService.uploadImage(filePath, folder)
    );
    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Cloudinary multiple upload error:', error);
      throw new Error('Multiple image upload failed.');
    }
  }

  // You can add more methods here, e.g., for deleting images
}

module.exports = ImageUploadService;