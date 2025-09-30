// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Submit a new review (protected)
router.post('/', verifyToken, reviewController.submitReview);

// Get all reviews for a specific vendor (publicly accessible)
router.get('/vendor/:vendorId', reviewController.getReviewsForVendor);

// Get all reviews by the authenticated user (protected)
router.get('/me', verifyToken, reviewController.getReviewsByUser);

// Update an existing review (protected, owner or admin only)
router.put('/:id', verifyToken, reviewController.updateReview);

// Delete an existing review (protected, owner or admin only)
router.delete('/:id', verifyToken, reviewController.deleteReview);

// New: Get all reviews (publicly accessible, for homepage featured reviews)
router.get('/', reviewController.getAllReviews); // <--- ADD THIS LINE

// New: Add a reply to a review (protected, vendor owner only)
router.put('/:id/reply', verifyToken, reviewController.addVendorReply);

module.exports = router;