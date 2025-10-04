// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { publicApiLimiter, userWriteLimiter } = require('../middleware/rateLimitMiddleware');

// --- Public Routes ---
router.get('/', publicApiLimiter, reviewController.getAllReviews);
router.get('/vendor/:vendorId', publicApiLimiter, reviewController.getReviewsForVendor);

// --- User Routes (Authenticated) ---
router.post('/', verifyToken, userWriteLimiter, reviewController.submitReview);
router.post('/:id/report', verifyToken, userWriteLimiter, reviewController.reportReview);
router.get('/me', verifyToken, reviewController.getReviewsByUser);
router.put('/:id', verifyToken, userWriteLimiter, reviewController.updateReview);
router.delete('/:id', verifyToken, userWriteLimiter, reviewController.deleteReview);
router.put('/:id/reply', verifyToken, userWriteLimiter, reviewController.addVendorReply);

// --- Admin Routes ---
router.get('/admin/flagged', verifyToken, authorizeRoles(['admin']), reviewController.getFlaggedReviews);
router.get('/admin/analytics', verifyToken, authorizeRoles(['admin']), reviewController.getReviewAnalytics);
router.post('/admin/:reviewId/remove', verifyToken, authorizeRoles(['admin']), reviewController.removeReviewAdmin);
router.post('/admin/:reviewId/restore', verifyToken, authorizeRoles(['admin']), reviewController.restoreReviewAdmin);
router.post('/admin/:reviewId/dismiss-reports', verifyToken, authorizeRoles(['admin']), reviewController.dismissReports);

module.exports = router;