// src/routes/vendorRoutes.js (No changes needed)
console.log('--- DEBUG: vendorRoutes.js LOADED ---'); 
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { vendorRegisterLimiter, publicApiLimiter, userProfileLimiter } = require('../middleware/rateLimitMiddleware'); 

const vendorImageUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 },
]);

// NEW: Endpoint for frontend to check GSTIN and fetch details
router.post(
    '/check-gstin', 
    verifyToken, 
    authorizeRoles(['user']), 
    vendorController.checkGstinForRegistration
);

router.post(
  '/register',
  vendorRegisterLimiter, 
  verifyToken,
  authorizeRoles(['user']),
  vendorImageUpload,
  vendorController.registerVendor
);

router.get('/', publicApiLimiter, vendorController.getAllVendors); 

// --- Vendor Owner Specific Routes ---
router.get('/me', verifyToken, authorizeRoles(['vendor', 'admin']), (req, res, next) => {
    console.log('--- DEBUG: /api/vendors/me route HIT ---');
    vendorController.getVendorProfileForOwner(req, res, next);
});
// Update authenticated vendor's own profile
router.put(
  '/me',
  userProfileLimiter, 
  verifyToken,
  authorizeRoles(['vendor']), 
  vendorImageUpload, 
  vendorController.updateVendorProfile
);

// --- Analytics Routes ---
router.post('/:id/increment-view', publicApiLimiter, vendorController.incrementProfileView);
router.post('/:id/increment-impression', publicApiLimiter, vendorController.incrementSearchImpression);


router.get('/:id', publicApiLimiter, vendorController.getVendorById); 

module.exports = router;