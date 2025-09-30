// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All admin routes require 'admin' role
router.use(verifyToken, authorizeRoles(['admin']));

// --- User Management ---
router.get('/users', adminController.getAllUsers);
router.delete('/users/:uid', adminController.deleteUser); // uid is Firebase Auth UID

// --- Vendor Management ---
router.get('/vendors', adminController.getAllVendorsAdmin);
router.put('/vendors/:vendorId/status', adminController.updateVendorStatus);
router.delete('/vendors/:vendorId', adminController.deleteVendor);

// --- Review Management ---
router.get('/reviews', adminController.getAllReviewsAdmin);
router.put('/reviews/:reviewId/status', adminController.updateReviewStatus);
router.delete('/reviews/:reviewId', adminController.deleteReview);

module.exports = router;