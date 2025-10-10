// src/config/cloudinaryConfig.js
const cloudinary = require('cloudinary');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); 

// Configure the v2 object with your Cloudinary credentials
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export the configured v2 object for use in other parts of your application
module.exports = cloudinary.v2;