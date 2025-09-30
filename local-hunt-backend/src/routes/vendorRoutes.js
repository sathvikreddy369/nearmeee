// src/routes/vendorRoutes.js
console.log('--- DEBUG: vendorRoutes.js LOADED ---'); // <--- ADD THIS LINE
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const vendorImageUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 },
]);

router.post(
  '/register',
  verifyToken,
  authorizeRoles(['user']),
  vendorImageUpload,
  vendorController.registerVendor
);

router.get('/', vendorController.getAllVendors);


// --- Vendor Owner Specific Routes ---
// Get authenticated vendor's own profile
// router.get('/me', verifyToken, authorizeRoles(['vendor', 'admin']), vendorController.getVendorProfileForOwner);
router.get('/me', verifyToken, authorizeRoles(['vendor', 'admin']), (req, res, next) => { // <--- FIX: Added (req, res, next)
    console.log('--- DEBUG: /api/vendors/me route HIT ---');
    vendorController.getVendorProfileForOwner(req, res, next);
});
// Update authenticated vendor's own profile
router.put(
  '/me',
  verifyToken,
  authorizeRoles(['vendor']), // Only the vendor themselves can update their profile
  vendorImageUpload, // Use multer for potential image updates
  vendorController.updateVendorProfile
);

// --- Analytics Routes (can be called by frontend on view/impression) ---
router.post('/:id/increment-view', vendorController.incrementProfileView);
router.post('/:id/increment-impression', vendorController.incrementSearchImpression);


router.get('/:id', vendorController.getVendorById);

module.exports = router;