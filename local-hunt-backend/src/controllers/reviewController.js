const ReviewModel = require('../models/ReviewModel');
const VendorModel = require('../models/VendorModel');
const UserModel = require('../models/UserModel');
const { db } = require('../config/firebaseAdmin');

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

    const reviewData = {
      vendorId,
      userId,
      rating,
      comment,
      reviewerName: userProfile.name,
      vendorName: vendor.businessName,
    };

    const newReview = await ReviewModel.createReview(reviewData);

    // Atomically update vendor rating
    await VendorModel.updateVendorRating(vendorId, rating, 1);

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

    if (rating !== undefined && rating !== existingReview.rating) {
      const ratingChange = rating - existingReview.rating;
      await VendorModel.updateVendorRating(existingReview.vendorId, ratingChange, 0);
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
    await VendorModel.updateVendorRating(existingReview.vendorId, -existingReview.rating, -1);

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
    const snapshot = await db.collection('reviews').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const snapshot = await db.collection('reviews').where('status', '==', 'approved').orderBy('createdAt', 'desc').get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};
