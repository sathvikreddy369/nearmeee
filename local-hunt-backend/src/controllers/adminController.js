// src/controllers/adminController.js
const UserModel = require('../models/UserModel');
const VendorModel = require('../models/VendorModel');
const ReviewModel = require('../models/ReviewModel');
const { auth } = require('../config/firebaseAdmin'); // For Firebase Auth user management

// --- User Management ---
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error('Admin: Error getting all users:', error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    // Delete user from Firebase Authentication
    await auth.deleteUser(uid);
    // Delete user's profile from Firestore
    await UserModel.deleteUserProfile(uid);
    // Optionally, delete associated vendor/reviews (or set status to removed)
    // For simplicity, we'll just delete the user profile.
    // Associated reviews/vendors would need to be handled carefully (e.g., soft delete, reassign)

    res.status(200).json({ message: `User ${uid} deleted successfully.` });
  } catch (error) {
    console.error('Admin: Error deleting user:', error);
    next(error);
  }
};

// --- Vendor Management ---
exports.getAllVendorsAdmin = async (req, res, next) => {
  try {
    const vendors = await VendorModel.getAllVendorsAdmin();
    res.status(200).json({ vendors });
  } catch (error) {
    console.error('Admin: Error getting all vendors for admin:', error);
    next(error);
  }
};

exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body; // 'pending', 'approved', 'suspended', 'rejected'

    const updatedVendor = await VendorModel.updateVendorStatus(vendorId, status);
    res.status(200).json({ message: `Vendor ${vendorId} status updated to ${status}.`, vendor: updatedVendor });
  } catch (error) {
    console.error('Admin: Error updating vendor status:', error);
    next(error);
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    await VendorModel.deleteVendor(vendorId);
    // Optionally, delete associated reviews or mark them as orphaned
    res.status(200).json({ message: `Vendor ${vendorId} deleted successfully.` });
  } catch (error) {
    console.error('Admin: Error deleting vendor:', error);
    next(error);
  }
};

// --- Review Management ---
exports.getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await ReviewModel.getAllReviewsAdmin();
    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Admin: Error getting all reviews for admin:', error);
    next(error);
  }
};

exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body; // 'approved', 'flagged', 'removed'

    const updatedReview = await ReviewModel.updateReviewStatus(reviewId, status);
    // FIX: The vendor's rating is recalculated from scratch to ensure accuracy after a review's status changes.
    // The previous method of incrementally updating was prone to errors.
    await VendorModel.recalculateVendorRating(updatedReview.vendorId);

    res.status(200).json({ message: `Review ${reviewId} status updated to ${status}.`, review: updatedReview });
  } catch (error) {
    console.error('Admin: Error updating review status:', error);
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const reviewToDelete = await ReviewModel.getReviewById(reviewId); // Get review to know vendorId
    if (!reviewToDelete) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    await ReviewModel.deleteReview(reviewId);
    // FIX: The vendor's rating is recalculated from scratch to ensure accuracy after a review is deleted.
    await VendorModel.recalculateVendorRating(reviewToDelete.vendorId);

    res.status(200).json({ message: `Review ${reviewId} deleted successfully.` });
  } catch (error) {
    console.error('Admin: Error deleting review:', error);
    next(error);
  }
};