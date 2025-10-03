// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { publicApiLimiter, userWriteLimiter } = require('../middleware/rateLimitMiddleware'); // <-- NEW

// Submit a new review (protected write)
router.post('/', verifyToken, userWriteLimiter, reviewController.submitReview); // <-- MODERATE WRITE LIMIT

// Report a review (protected write)
router.post('/:id/report', verifyToken, userWriteLimiter, reviewController.reportReview); // <-- MODERATE WRITE LIMIT

// Get all reviews for a specific vendor (public read)
router.get('/vendor/:vendorId', publicApiLimiter, reviewController.getReviewsForVendor); // <-- STANDARD READ LIMIT

// Get all reviews by the authenticated user (protected read)
router.get('/me', verifyToken, reviewController.getReviewsByUser);

// Update an existing review (protected write)
router.put('/:id', verifyToken, userWriteLimiter, reviewController.updateReview); // <-- MODERATE WRITE LIMIT

// Delete an existing review (protected write)
router.delete('/:id', verifyToken, userWriteLimiter, reviewController.deleteReview); // <-- MODERATE WRITE LIMIT

// Get all reviews (public read)
router.get('/', publicApiLimiter, reviewController.getAllReviews); // <-- STANDARD READ LIMIT

// Add a reply to a review (protected write)
router.put('/:id/reply', verifyToken, userWriteLimiter, reviewController.addVendorReply); // <-- MODERATE WRITE LIMIT

module.exports = router;