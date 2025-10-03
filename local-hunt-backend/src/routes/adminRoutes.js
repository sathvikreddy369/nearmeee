// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All admin routes require 'admin' role
router.use(verifyToken, authorizeRoles(['admin']));

// --- Dashboard ---
router.get('/dashboard/stats', adminController.getDashboardStats);

// --- User Management ---
router.get('/users', adminController.getAllUsers);
router.put('/users/:uid/role', adminController.updateUserRole);
router.delete('/users/:uid', adminController.deleteUser);

// --- Vendor Management ---
router.get('/vendors', adminController.getAllVendorsAdmin);
router.put('/vendors/:vendorId/status', adminController.updateVendorStatus);
router.put('/vendors/:vendorId/approve-role', adminController.approveVendorRole);
router.delete('/vendors/:vendorId', adminController.deleteVendor);

// --- Review Management ---
router.get('/reviews', adminController.getAllReviewsAdmin);
router.get('/reviews/analytics', adminController.getReviewAnalytics);
router.put('/reviews/:reviewId/status', adminController.updateReviewStatus);
router.delete('/reviews/:reviewId', adminController.deleteReview);

module.exports = router;