// // src/models/ReviewModel.js
// const { db } = require('../config/firebaseAdmin');

// class ReviewModel {
//   /**
//    * Creates a new review document in Firestore.
//    * @param {string} vendorId - The ID of the vendor being reviewed.
//    * @param {string} userId - The ID of the user submitting the review.
//    * @param {number} rating - The rating (1-5).
//    * @param {string} comment - The review comment.
//    * @returns {Promise<object>} The created review document with its ID.
//    */
//   static async createReview(reviewData) {
//     const newReviewData = {
//       ...reviewData,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       status: 'approved', // Default to approved, can be 'pending' for admin moderation
//       flagged: false,
//       reportCount: 0,
//       vendorReply: null, // Initialize vendor reply
//     };

//     try {
//       const docRef = await db.collection('reviews').add(newReviewData);
//       return { id: docRef.id, ...newReviewData };
//     } catch (error) {
//       console.error('Error creating review in Firestore:', error);
//       throw new Error('Failed to submit review.');
//     }
//   }

//   /**
//    * Retrieves all reviews for a specific vendor.
//    * @param {string} vendorId - The ID of the vendor.
//    * @returns {Promise<Array<object>>} List of reviews for the vendor.
//    */
//   static async getAllReviewsAdmin() {
//     try {
//       const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').get();
//       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     } catch (error) {
//       console.error('Error getting all reviews for admin:', error);
//       throw new Error('Failed to retrieve all reviews.');
//     }
//   }

//   /**
//    * Updates the status of a review.
//    * @param {string} reviewId - The ID of the review.
//    * @param {string} newStatus - The new status ('approved', 'flagged', 'removed').
//    * @returns {Promise<object>} The updated review document.
//    */
//   static async updateReviewStatus(reviewId, newStatus) {
//     if (!['approved', 'flagged', 'removed'].includes(newStatus)) {
//       throw new Error('Invalid review status provided.');
//     }
//     try {
//       const reviewRef = db.collection('reviews').doc(reviewId);
//       await reviewRef.update({ status: newStatus, updatedAt: new Date() });
//       const updatedDoc = await reviewRef.get();
//       return { id: updatedDoc.id, ...updatedDoc.data() };
//     } catch (error) {
//       console.error('Error updating review status:', error);
//       throw new Error('Failed to update review status.');
//     }
//   }
//   static async getReviewsByVendorId(vendorId) {
//     try {
//       const snapshot = await db.collection('reviews')
//         .where('vendorId', '==', vendorId)
//         .where('status', '==', 'approved') // Only show approved reviews publicly
//         .orderBy('createdAt', 'desc') // Order by newest first
//         .get();

//       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     } catch (error) {
//       console.error('Error getting reviews by vendor ID:', error);
//       throw new Error('Failed to retrieve vendor reviews.');
//     }
//   }

//   /**
//    * Retrieves a single review by its ID.
//    * @param {string} reviewId - The ID of the review.
//    * @returns {Promise<object|null>} The review document or null.
//    */
//   static async getReviewById(reviewId) {
//     try {
//       const doc = await db.collection('reviews').doc(reviewId).get();
//       if (!doc.exists) {
//         return null;
//       }
//       return { id: doc.id, ...doc.data() };
//     } catch (error) {
//       console.error('Error getting review by ID:', error);
//       throw new Error('Failed to retrieve review.');
//     }
//   }

//   /**
//    * Updates an existing review.
//    * @param {string} reviewId - The ID of the review to update.
//    * @param {object} updates - The fields to update.
//    * @returns {Promise<object>} The updated review document.
//    */
//   static async updateReview(reviewId, updates) {
//     try {
//       const reviewRef = db.collection('reviews').doc(reviewId);
//       await reviewRef.update({ ...updates, updatedAt: new Date() });
//       const updatedDoc = await reviewRef.get();
//       return { id: updatedDoc.id, ...updatedDoc.data() };
//     } catch (error) {
//       console.error('Error updating review:', error);
//       throw new Error('Failed to update review.');
//     }
//   }

//   /**
//    * Deletes a review.
//    * @param {string} reviewId - The ID of the review to delete.
//    * @returns {Promise<boolean>} True if deleted successfully.
//    */
//   static async deleteReview(reviewId) {
//     try {
//       await db.collection('reviews').doc(reviewId).delete();
//       return true;
//     } catch (error) {
//       console.error('Error deleting review:', error);
//       throw new Error('Failed to delete review.');
//     }
//   }

//   /**
//    * Adds a reply from a vendor to a review.
//    * @param {string} reviewId - The ID of the review to reply to.
//    * @param {string} replyText - The text of the vendor's reply.
//    * @returns {Promise<object>} The updated review document.
//    */
//   static async addReply(reviewId, replyText) {
//     try {
//       const reviewRef = db.collection('reviews').doc(reviewId);
//       const replyData = {
//         text: replyText,
//         createdAt: new Date(),
//       };
//       await reviewRef.update({ vendorReply: replyData, updatedAt: new Date() });
//       const updatedDoc = await reviewRef.get();
//       return { id: updatedDoc.id, ...updatedDoc.data() };
//     } catch (error) {
//       console.error('Error adding vendor reply:', error);
//       throw new Error('Failed to add vendor reply.');
//     }
//   }
// }

// module.exports = ReviewModel;


// src/models/ReviewModel.js
const { db, admin } = require('../config/firebaseAdmin'); // Ensure admin is imported for FieldValue

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
      // --- NEW/UPDATED FIELDS FOR MONITORING ---
      flagged: false,      // Will be set to true if reportCount meets threshold
      reportCount: 0,      // Total reports received
      vendorReply: null,
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
   * @param {string} reviewId - The ID of the review.
   * @param {number} REPORT_THRESHOLD - The number of reports needed to flag the review.
   * @returns {Promise<object>} The updated review document.
   */
  static async reportReview(reviewId, REPORT_THRESHOLD) {
    const reviewRef = db.collection('reviews').doc(reviewId);

    // Use a transaction to safely increment and check the threshold
    return db.runTransaction(async (transaction) => {
        const reviewDoc = await transaction.get(reviewRef);
        if (!reviewDoc.exists) {
            throw new Error('Review not found during reporting.');
        }

        const data = reviewDoc.data();
        const newReportCount = (data.reportCount || 0) + 1;
        const shouldFlag = newReportCount >= REPORT_THRESHOLD;

        const updates = {
            reportCount: newReportCount,
            updatedAt: new Date(),
        };

        if (shouldFlag && data.flagged !== true) {
            updates.flagged = true;
            updates.status = 'pending_review'; // Set status to flag for admin
        }

        transaction.update(reviewRef, updates);
        
        // Return the updated data structure
        return { ...data, id: reviewDoc.id, ...updates };
    });
  }
  
  // Admin Methods
  static async getAllReviewsAdmin() {
    try {
      // Prioritize flagged reviews or those marked for special review
      const snapshot = await db.collection('reviews').orderBy('reportCount', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all reviews for admin:', error);
      throw new Error('Failed to retrieve all reviews.');
    }
  }

  /**
   * Updates the status of a review.
   * @param {string} reviewId - The ID of the review.
   * @param {string} newStatus - The new status ('approved', 'pending_review', 'removed').
   * @returns {Promise<object>} The updated review document.
   */
  static async updateReviewStatus(reviewId, newStatus) {
    if (!['approved', 'pending_review', 'removed'].includes(newStatus)) {
      throw new Error('Invalid review status provided.');
    }
    try {
      const reviewRef = db.collection('reviews').doc(reviewId);
      const updates = { status: newStatus, updatedAt: new Date() };
      // If approved, ensure flagged is reset
      if (newStatus === 'approved') {
          updates.flagged = false;
      }
      await reviewRef.update(updates);
      const updatedDoc = await reviewRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating review status:', error);
      throw new Error('Failed to update review status.');
    }
  }
}

module.exports = ReviewModel;