// src/models/ReviewModel.js
const { db, admin } = require('../config/firebaseAdmin');

class ReviewModel {
  /**
   * Creates a new review document in Firestore.
   * @param {object} reviewData - The review data including vendorId, userId, rating, comment, names.
   * @returns {Promise<object>} The created review document with its ID.
   */
  static async createReview(reviewData) {
    const newReviewData = {
      ...reviewData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'approved', // Default to approved
      flagged: false,
      reportCount: 0,
      reportedBy: [], // Track who reported to prevent duplicate reports
      vendorReply: null,
      adminAction: null, // Track admin actions
    };

    try {
      const docRef = await db.collection('reviews').add(newReviewData);
      return { id: docRef.id, ...newReviewData };
    } catch (error) {
      console.error('Error creating review in Firestore:', error);
      throw new Error('Failed to submit review.');
    }
  }

  /**
   * Retrieves a single review by its ID.
   * @param {string} reviewId - The ID of the review.
   * @returns {Promise<object|null>} The review document or null.
   */
  static async getReviewById(reviewId) {
    try {
      const doc = await db.collection('reviews').doc(reviewId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting review by ID:', error);
      throw new Error('Failed to retrieve review.');
    }
  }

  /**
   * Retrieves all reviews for a specific vendor.
   * @param {string} vendorId - The ID of the vendor.
   * @returns {Promise<Array<object>>} List of reviews for the vendor.
   */
  static async getReviewsByVendorId(vendorId) {
    try {
      const snapshot = await db.collection('reviews')
        .where('vendorId', '==', vendorId)
        .where('status', '==', 'approved') // Only show approved reviews publicly
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting reviews by vendor ID:', error);
      throw new Error('Failed to retrieve vendor reviews.');
    }
  }

  /**
   * Updates an existing review.
   * @param {string} reviewId - The ID of the review to update.
   * @param {object} updates - The fields to update.
   * @returns {Promise<object>} The updated review document.
   */
  static async updateReview(reviewId, updates) {
    try {
      const reviewRef = db.collection('reviews').doc(reviewId);
      await reviewRef.update({ ...updates, updatedAt: new Date() });
      const updatedDoc = await reviewRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Failed to update review.');
    }
  }

  /**
   * Deletes a review.
   * @param {string} reviewId - The ID of the review to delete.
   * @returns {Promise<boolean>} True if deleted successfully.
   */
  static async deleteReview(reviewId) {
    try {
      await db.collection('reviews').doc(reviewId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Failed to delete review.');
    }
  }

  /**
   * Adds a reply from a vendor to a review.
   * @param {string} reviewId - The ID of the review to reply to.
   * @param {string} replyText - The text of the vendor's reply.
   * @returns {Promise<object>} The updated review document.
   */
  static async addReply(reviewId, replyText) {
    try {
      const reviewRef = db.collection('reviews').doc(reviewId);
      const replyData = {
        text: replyText,
        createdAt: new Date(),
      };
      await reviewRef.update({ vendorReply: replyData, updatedAt: new Date() });
      const updatedDoc = await reviewRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error adding vendor reply:', error);
      throw new Error('Failed to add vendor reply.');
    }
  }

  /**
   * Increments the report count for a review and flags it if a threshold is met.
   * Prevents users from reporting the same review multiple times.
   * @param {string} reviewId - The ID of the review.
   * @param {string} userId - The ID of the user reporting.
   * @param {number} REPORT_THRESHOLD - The number of reports needed to flag the review.
   * @returns {Promise<object>} The updated review document.
   */
  static async reportReview(reviewId, userId, REPORT_THRESHOLD) {
    const reviewRef = db.collection('reviews').doc(reviewId);

    return db.runTransaction(async (transaction) => {
      const reviewDoc = await transaction.get(reviewRef);
      if (!reviewDoc.exists) {
        throw new Error('Review not found during reporting.');
      }

      const data = reviewDoc.data();
      
      // Check if user already reported this review
      const reportedBy = data.reportedBy || [];
      if (reportedBy.includes(userId)) {
        throw new Error('You have already reported this review.');
      }

      const newReportCount = (data.reportCount || 0) + 1;
      const shouldFlag = newReportCount >= REPORT_THRESHOLD;

      const updates = {
        reportCount: newReportCount,
        reportedBy: admin.firestore.FieldValue.arrayUnion(userId),
        updatedAt: new Date(),
      };

      if (shouldFlag && data.flagged !== true) {
        updates.flagged = true;
        updates.status = 'pending_review'; // Set status to flag for admin
        updates.flaggedAt = new Date();
      }

      transaction.update(reviewRef, updates);
      
      return { ...data, id: reviewDoc.id, ...updates };
    });
  }
  
  /**
   * Get flagged reviews for admin (reviews that need attention)
   * @returns {Promise<Array<object>>} List of flagged reviews
   */
  static async getFlaggedReviews() {
    try {
      const snapshot = await db.collection('reviews')
        .where('flagged', '==', true)
        .orderBy('reportCount', 'desc')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting flagged reviews:', error);
      throw new Error('Failed to retrieve flagged reviews.');
    }
  }

  /**
   * Get all reviews with filtering options for admin
   * @param {object} filters - Optional filters (status, flagged, vendorId, etc.)
   * @returns {Promise<Array<object>>} List of reviews
   */
  static async getAllReviewsAdmin(filters = {}) {
    try {
      let query = db.collection('reviews');
      
      // Apply filters
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters.flagged !== undefined) {
        query = query.where('flagged', '==', filters.flagged);
      }
      if (filters.vendorId) {
        query = query.where('vendorId', '==', filters.vendorId);
      }
      
      // Order by creation date (newest first) or by report count for flagged ones
      if (filters.flagged) {
        query = query.orderBy('reportCount', 'desc');
      } else {
        query = query.orderBy('createdAt', 'desc');
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all reviews for admin:', error);
      throw new Error('Failed to retrieve all reviews.');
    }
  }

  /**
   * Updates the status of a review with admin action tracking.
   * @param {string} reviewId - The ID of the review.
   * @param {string} newStatus - The new status ('approved', 'pending_review', 'removed').
   * @param {string} adminId - The ID of the admin performing the action.
   * @param {string} actionReason - Reason for the action (optional).
   * @returns {Promise<object>} The updated review document.
   */
  static async updateReviewStatus(reviewId, newStatus, adminId, actionReason = '') {
    if (!['approved', 'pending_review', 'removed'].includes(newStatus)) {
      throw new Error('Invalid review status provided.');
    }
    
    try {
      const reviewRef = db.collection('reviews').doc(reviewId);
      const adminAction = {
        adminId,
        action: newStatus,
        reason: actionReason,
        performedAt: new Date(),
      };

      const updates = { 
        status: newStatus, 
        updatedAt: new Date(),
        adminAction: adminAction
      };

      // If approved, reset flagged status and clear reports
      if (newStatus === 'approved') {
        updates.flagged = false;
        updates.reportCount = 0;
        updates.reportedBy = [];
      }

      // If removed, keep flagged status but update
      if (newStatus === 'removed') {
        updates.flagged = true; // Keep flagged for record
      }

      await reviewRef.update(updates);
      const updatedDoc = await reviewRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating review status:', error);
      throw new Error('Failed to update review status.');
    }
  }

  /**
   * Remove a review (soft delete - mark as removed)
   * @param {string} reviewId - The ID of the review to remove.
   * @param {string} adminId - The ID of the admin performing the action.
   * @param {string} reason - Reason for removal.
   * @returns {Promise<object>} The updated review document.
   */
  static async removeReview(reviewId, adminId, reason = 'Violation of community guidelines') {
    return this.updateReviewStatus(reviewId, 'removed', adminId, reason);
  }

  /**
   * Restore a removed review
   * @param {string} reviewId - The ID of the review to restore.
   * @param {string} adminId - The ID of the admin performing the action.
   * @returns {Promise<object>} The updated review document.
   */
  static async restoreReview(reviewId, adminId) {
    return this.updateReviewStatus(reviewId, 'approved', adminId, 'Review restored by admin');
  }

  /**
   * Dismiss reports for a review (reset report count but keep review)
   * @param {string} reviewId - The ID of the review.
   * @param {string} adminId - The ID of the admin performing the action.
   * @returns {Promise<object>} The updated review document.
   */
  static async dismissReports(reviewId, adminId) {
    try {
      const reviewRef = db.collection('reviews').doc(reviewId);
      const updates = {
        flagged: false,
        reportCount: 0,
        reportedBy: [],
        status: 'approved',
        updatedAt: new Date(),
        adminAction: {
          adminId,
          action: 'reports_dismissed',
          reason: 'Reports dismissed by admin',
          performedAt: new Date(),
        }
      };

      await reviewRef.update(updates);
      const updatedDoc = await reviewRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error dismissing reports:', error);
      throw new Error('Failed to dismiss reports.');
    }
  }
}

module.exports = ReviewModel;