// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configure storage for Multer
// Files will be stored in a 'uploads' directory temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create the 'uploads' directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false); // Reject file
  }
};

// Initialize Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

module.exports = upload;