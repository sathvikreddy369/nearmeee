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
router.put('/vendors/:vendorId/verification-status', adminController.updateVendorVerificationStatus);
router.post('/vendors/:vendorId/verify-gstin', adminController.verifyGstinForVendor);
router.get('/vendors/verification/:status', adminController.getVendorsByVerificationStatus);
router.put('/vendors/:vendorId/approve-role', adminController.approveVendorRole);
router.delete('/vendors/:vendorId', adminController.deleteVendor);
router.post('/vendors/:vendorId/confirm-gstin-verification', adminController.confirmGstinVerification);
// --- Review Management ---
router.get('/reviews', adminController.getAllReviewsAdmin);
router.get('/reviews/flagged', adminController.getFlaggedReviews);
router.get('/reviews/analytics', adminController.getReviewAnalytics);
router.put('/reviews/:reviewId/status', adminController.updateReviewStatus);
router.post('/reviews/:reviewId/remove', adminController.removeReviewAdmin);
router.post('/reviews/:reviewId/restore', adminController.restoreReviewAdmin);
router.post('/reviews/:reviewId/dismiss-reports', adminController.dismissReports);
router.delete('/reviews/:reviewId', adminController.deleteReview);

module.exports = router;