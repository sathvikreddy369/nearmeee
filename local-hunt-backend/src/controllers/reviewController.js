// src/controllers/reviewController.js
const ReviewModel = require('../models/ReviewModel');
const VendorModel = require('../models/VendorModel');
const UserModel = require('../models/UserModel');
const { db } = require('../config/firebaseAdmin');

// Set a reporting threshold constant
const REVIEW_REPORT_THRESHOLD = 3;

exports.submitReview = async (req, res, next) => {
  try {
    const { vendorId, rating, comment } = req.body;
    const userId = req.user.uid;

    if (!vendorId || !rating || !comment) {
      return res.status(400).json({ message: 'Vendor ID, rating, and comment are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const userProfile = await UserModel.getUserProfile(userId);
    const vendor = await VendorModel.getVendorById(vendorId);

    if (!userProfile || !vendor) {
      return res.status(404).json({ message: 'User or Vendor not found.' });
    }

    // Check if user has already reviewed this vendor
    const existingReviewSnapshot = await db.collection('reviews')
      .where('vendorId', '==', vendorId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingReviewSnapshot.empty) {
      return res.status(400).json({ message: 'You have already reviewed this vendor.' });
    }

    const reviewData = {
      vendorId,
      userId,
      rating,
      comment,
      reviewerName: userProfile.name,
      vendorName: vendor.businessName,
    };

    const newReview = await ReviewModel.createReview(reviewData);

    // Recalculate vendor rating
    await VendorModel.recalculateVendorRating(vendorId);

    // Notify vendor about new review
    if (vendor.userId) {
      await UserModel.addNotification(
        vendor.userId,
        'new_review',
        `You received a new ${rating}-star review from ${userProfile.name} for ${vendor.businessName}!`,
        newReview.id
      );
    }

    res.status(201).json({ message: 'Review submitted successfully!', review: newReview });
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.uid;
    const userRole = req.user.role;

    const existingReview = await ReviewModel.getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (existingReview.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your own reviews.' });
    }

    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;

    const updatedReview = await ReviewModel.updateReview(reviewId, updates);

    // Recalculate rating only if the rating value changed
    if (rating !== undefined && rating !== existingReview.rating) {
      await VendorModel.recalculateVendorRating(existingReview.vendorId);
    }

    res.status(200).json({ message: 'Review updated successfully!', review: updatedReview });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role;

    const existingReview = await ReviewModel.getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (existingReview.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own reviews.' });
    }

    await ReviewModel.deleteReview(reviewId);
    // Recalculate rating after deleting a review
    await VendorModel.recalculateVendorRating(existingReview.vendorId);

    res.status(200).json({ message: 'Review deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

exports.addVendorReply = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const { replyText } = req.body;
    const userId = req.user.uid;

    if (!replyText) {
      return res.status(400).json({ message: 'Reply text is required.' });
    }

    const review = await ReviewModel.getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const vendor = await VendorModel.getVendorById(review.vendorId);
    if (!vendor || vendor.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this business.' });
    }

    const updatedReview = await ReviewModel.addReply(reviewId, replyText);
    res.status(200).json({ message: 'Reply added successfully!', review: updatedReview });
  } catch (error) {
    next(error);
  }
};

/**
 * Report a review as spam/inappropriate
 * @route POST /api/reviews/:id/report
 */
exports.reportReview = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const userId = req.user.uid;

    const updatedReview = await ReviewModel.reportReview(reviewId, userId, REVIEW_REPORT_THRESHOLD);
    
    if (updatedReview.flagged) {
      // Send notification to admins about flagged review
      try {
        const adminUsers = await UserModel.getUsersByRole('admin');
        adminUsers.forEach(async (adminUser) => {
          await UserModel.addNotification(
            adminUser.userId,
            'review_flagged',
            `Review for ${updatedReview.vendorName} has been flagged for review. Report count: ${updatedReview.reportCount}`,
            reviewId
          );
        });
      } catch (notifyError) {
        console.warn('Failed to send admin notifications:', notifyError);
      }
    }

    res.status(200).json({ 
      message: 'Review reported successfully. Thank you for your feedback.', 
      review: updatedReview 
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    
    if (error.message.includes('already reported')) {
      return res.status(400).json({ message: error.message });
    }
    
    next(error);
  }
};

// Publicly accessible GET routes
exports.getReviewsForVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const reviews = await ReviewModel.getReviewsByVendorId(vendorId);
    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

exports.getReviewsByUser = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('reviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const snapshot = await db.collection('reviews')
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

// --- NEW ADMIN REVIEW MANAGEMENT ENDPOINTS ---

/**
 * Get flagged reviews for admin dashboard
 * @route GET /api/reviews/admin/flagged
 */
exports.getFlaggedReviews = async (req, res, next) => {
  try {
    const reviews = await ReviewModel.getFlaggedReviews();
    
    // Enhance reviews with vendor and user information
    const enhancedReviews = await Promise.all(
      reviews.map(async (review) => {
        try {
          const vendor = await VendorModel.getVendorById(review.vendorId);
          const user = await UserModel.getUserProfile(review.userId);
          
          return {
            ...review,
            vendorName: vendor?.businessName,
            vendorCategory: vendor?.category,
            reviewerEmail: user?.email,
            reviewerName: user?.name || review.reviewerName
          };
        } catch (error) {
          return review;
        }
      })
    );
    
    res.status(200).json({ 
      count: enhancedReviews.length,
      reviews: enhancedReviews 
    });
  } catch (error) {
    console.error('Error getting flagged reviews:', error);
    next(error);
  }
};

/**
 * Remove a review (admin action)
 * @route POST /api/reviews/admin/:reviewId/remove
 */
exports.removeReviewAdmin = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.uid;

    const existingReview = await ReviewModel.getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const removedReview = await ReviewModel.removeReview(reviewId, adminId, reason);
    
    // Recalculate vendor rating
    await VendorModel.recalculateVendorRating(existingReview.vendorId);

    // Notify the reviewer
    try {
      await UserModel.addNotification(
        existingReview.userId,
        'review_removed',
        `Your review for ${existingReview.vendorName} has been removed: ${reason}`,
        reviewId
      );
    } catch (notifyError) {
      console.warn('Failed to send removal notification:', notifyError);
    }

    res.status(200).json({ 
      message: 'Review removed successfully.', 
      review: removedReview 
    });
  } catch (error) {
    console.error('Error removing review:', error);
    next(error);
  }
};

/**
 * Restore a removed review (admin action)
 * @route POST /api/reviews/admin/:reviewId/restore
 */
exports.restoreReviewAdmin = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const adminId = req.user.uid;

    const existingReview = await ReviewModel.getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const restoredReview = await ReviewModel.restoreReview(reviewId, adminId);
    
    // Recalculate vendor rating
    await VendorModel.recalculateVendorRating(existingReview.vendorId);

    // Notify the reviewer
    try {
      await UserModel.addNotification(
        existingReview.userId,
        'review_restored',
        `Your review for ${existingReview.vendorName} has been restored.`,
        reviewId
      );
    } catch (notifyError) {
      console.warn('Failed to send restoration notification:', notifyError);
    }

    res.status(200).json({ 
      message: 'Review restored successfully.', 
      review: restoredReview 
    });
  } catch (error) {
    console.error('Error restoring review:', error);
    next(error);
  }
};

/**
 * Dismiss reports for a review (admin action)
 * @route POST /api/reviews/admin/:reviewId/dismiss-reports
 */
exports.dismissReports = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const adminId = req.user.uid;

    const existingReview = await ReviewModel.getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const updatedReview = await ReviewModel.dismissReports(reviewId, adminId);

    res.status(200).json({ 
      message: 'Reports dismissed successfully. Review has been restored.', 
      review: updatedReview 
    });
  } catch (error) {
    console.error('Error dismissing reports:', error);
    next(error);
  }
};

/**
 * Get review analytics for admin dashboard
 * @route GET /api/reviews/admin/analytics
 */
exports.getReviewAnalytics = async (req, res, next) => {
  try {
    const reviews = await ReviewModel.getAllReviewsAdmin();
    
    const analytics = {
      total: reviews.length,
      approved: reviews.filter(r => r.status === 'approved').length,
      pending: reviews.filter(r => r.status === 'pending_review').length,
      removed: reviews.filter(r => r.status === 'removed').length,
      flagged: reviews.filter(r => r.flagged).length,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      reports: {
        totalReports: reviews.reduce((sum, review) => sum + (review.reportCount || 0), 0),
        flaggedCount: reviews.filter(r => r.flagged).length,
        topReported: reviews
          .filter(r => r.reportCount > 0)
          .sort((a, b) => b.reportCount - a.reportCount)
          .slice(0, 10)
      }
    };

    // Calculate average rating and distribution for approved reviews only
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      analytics.averageRating = parseFloat((totalRating / approvedReviews.length).toFixed(2));
      
      approvedReviews.forEach(review => {
        analytics.ratingDistribution[review.rating]++;
      });
    }

    res.status(200).json({ analytics });
  } catch (error) {
    console.error('Error getting review analytics:', error);
    next(error);
  }
};