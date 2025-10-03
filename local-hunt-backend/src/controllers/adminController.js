// src/controllers/adminController.js
const UserModel = require('../models/UserModel');
const VendorModel = require('../models/VendorModel');
const ReviewModel = require('../models/ReviewModel');
const { auth } = require('../config/firebaseAdmin');

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

exports.updateUserRole = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    if (!['user', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided.' });
    }

    // Update in Firestore
    const updatedUser = await UserModel.updateUserRole(uid, role);
    
    // Update Firebase Auth custom claims
    await auth.setCustomUserClaims(uid, { role });

    res.status(200).json({ 
      message: `User role updated to ${role} successfully.`,
      user: updatedUser 
    });
  } catch (error) {
    console.error('Admin: Error updating user role:', error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    
    // Get user data first to check if they're a vendor
    const user = await UserModel.getUserProfile(uid);
    
    // Delete user from Firebase Authentication
    await auth.deleteUser(uid);
    
    // Delete user's profile from Firestore
    await UserModel.deleteUserProfile(uid);
    
    // If user was a vendor, also delete/archive their vendor profile
    if (user?.role === 'vendor' && user.vendorProfile) {
      try {
        await VendorModel.deleteVendor(user.vendorProfile);
      } catch (vendorError) {
        console.warn('Failed to delete vendor profile:', vendorError);
      }
    }

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
    
    // Enhance vendor data with user information
    const enhancedVendors = await Promise.all(
      vendors.map(async (vendor) => {
        try {
          const user = await UserModel.getUserProfile(vendor.userId);
          return {
            ...vendor,
            userEmail: user?.email,
            userName: user?.name,
            userRole: user?.role
          };
        } catch (error) {
          return vendor; // Return basic vendor data if user fetch fails
        }
      })
    );
    
    res.status(200).json({ vendors: enhancedVendors });
  } catch (error) {
    console.error('Admin: Error getting all vendors for admin:', error);
    next(error);
  }
};

exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { status, verificationStatus } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (verificationStatus) updates.verificationStatus = verificationStatus;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided.' });
    }

    const updatedVendor = await VendorModel.updateVendorStatus(vendorId, updates);
    
    // Send notification to vendor about status change
    try {
      await UserModel.addNotification(
        updatedVendor.userId,
        'vendor_status_update',
        `Your vendor status has been updated to: ${status || verificationStatus}`,
        vendorId
      );
    } catch (notifyError) {
      console.warn('Failed to send vendor notification:', notifyError);
    }

    res.status(200).json({ 
      message: `Vendor ${vendorId} status updated successfully.`, 
      vendor: updatedVendor 
    });
  } catch (error) {
    console.error('Admin: Error updating vendor status:', error);
    next(error);
  }
};

exports.approveVendorRole = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    // Get vendor data
    const vendor = await VendorModel.getVendorById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    // Update vendor verification status
    const updatedVendor = await VendorModel.updateVendorStatus(vendorId, {
      verificationStatus: 'verified_premium',
      status: 'approved'
    });

    // Update user role to vendor
    await UserModel.updateUserRole(vendor.userId, 'vendor');
    await auth.setCustomUserClaims(vendor.userId, { role: 'vendor' });

    // Send notification to vendor
    try {
      await UserModel.addNotification(
        vendor.userId,
        'vendor_approved',
        'Congratulations! Your vendor account has been approved and is now active.',
        vendorId
      );
    } catch (notifyError) {
      console.warn('Failed to send approval notification:', notifyError);
    }

    res.status(200).json({ 
      message: 'Vendor role approved successfully. User can now access vendor dashboard.',
      vendor: updatedVendor 
    });
  } catch (error) {
    console.error('Admin: Error approving vendor role:', error);
    next(error);
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    // Get vendor data first to get userId
    const vendor = await VendorModel.getVendorById(vendorId);
    
    await VendorModel.deleteVendor(vendorId);
    
    // If vendor exists, revert user role to 'user'
    if (vendor && vendor.userId) {
      try {
        await UserModel.updateUserRole(vendor.userId, 'user');
        await auth.setCustomUserClaims(vendor.userId, { role: 'user' });
        
        // Notify user
        await UserModel.addNotification(
          vendor.userId,
          'vendor_profile_removed',
          'Your vendor profile has been removed by administrator.',
          vendorId
        );
      } catch (roleError) {
        console.warn('Failed to revert user role:', roleError);
      }
    }

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
          return review; // Return basic review data if fetches fail
        }
      })
    );
    
    res.status(200).json({ reviews: enhancedReviews });
  } catch (error) {
    console.error('Admin: Error getting all reviews for admin:', error);
    next(error);
  }
};

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
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    // Calculate average rating and distribution
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      analytics.averageRating = (totalRating / approvedReviews.length).toFixed(1);
      
      approvedReviews.forEach(review => {
        analytics.ratingDistribution[review.rating]++;
      });
    }

    res.status(200).json({ analytics });
  } catch (error) {
    console.error('Admin: Error getting review analytics:', error);
    next(error);
  }
};

exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    const updatedReview = await ReviewModel.updateReviewStatus(reviewId, status);
    
    // Recalculate vendor rating
    await VendorModel.recalculateVendorRating(updatedReview.vendorId);

    // Send notification to reviewer if review is removed
    if (status === 'removed') {
      try {
        await UserModel.addNotification(
          updatedReview.userId,
          'review_removed',
          'Your review has been removed by administrator for violating platform guidelines.',
          reviewId
        );
      } catch (notifyError) {
        console.warn('Failed to send removal notification:', notifyError);
      }
    }

    res.status(200).json({ 
      message: `Review ${reviewId} status updated to ${status}.`, 
      review: updatedReview 
    });
  } catch (error) {
    console.error('Admin: Error updating review status:', error);
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const reviewToDelete = await ReviewModel.getReviewById(reviewId);
    
    if (!reviewToDelete) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    await ReviewModel.deleteReview(reviewId);
    await VendorModel.recalculateVendorRating(reviewToDelete.vendorId);

    // Notify reviewer
    try {
      await UserModel.addNotification(
        reviewToDelete.userId,
        'review_deleted',
        'Your review has been deleted by administrator.',
        reviewId
      );
    } catch (notifyError) {
      console.warn('Failed to send deletion notification:', notifyError);
    }

    res.status(200).json({ message: `Review ${reviewId} deleted successfully.` });
  } catch (error) {
    console.error('Admin: Error deleting review:', error);
    next(error);
  }
};

// --- Dashboard Statistics ---
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [users, vendors, reviews] = await Promise.all([
      UserModel.getAllUsers(),
      VendorModel.getAllVendorsAdmin(),
      ReviewModel.getAllReviewsAdmin()
    ]);

    const stats = {
      totalUsers: users.length,
      totalVendors: vendors.length,
      totalReviews: reviews.length,
      pendingVendors: vendors.filter(v => v.status === 'pending').length,
      newUsersToday: users.filter(u => {
        const today = new Date();
        const userDate = u.createdAt?._seconds ? new Date(u.createdAt._seconds * 1000) : new Date(u.createdAt);
        return userDate.toDateString() === today.toDateString();
      }).length,
      flaggedReviews: reviews.filter(r => r.flagged).length,
      userRoles: {
        user: users.filter(u => u.role === 'user').length,
        vendor: users.filter(u => u.role === 'vendor').length,
        admin: users.filter(u => u.role === 'admin').length
      },
      vendorStatus: {
        pending: vendors.filter(v => v.status === 'pending').length,
        approved: vendors.filter(v => v.status === 'approved').length,
        suspended: vendors.filter(v => v.status === 'suspended').length
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Admin: Error getting dashboard stats:', error);
    next(error);
  }
};