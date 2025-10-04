// src/controllers/adminController.js
const UserModel = require('../models/UserModel');
const VendorModel = require('../models/VendorModel');
const ReviewModel = require('../models/ReviewModel');
const { auth } = require('../config/firebaseAdmin');
const GstinService = require('../services/GstinService');
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

exports.updateVendorVerificationStatus = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Verification status is required.' });
    }

    const vendor = await VendorModel.getVendorById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    const updatedVendor = await VendorModel.updateVerificationStatus(vendorId, status, notes);

    // Send notification to vendor about status change
    try {
      const statusMessages = {
        'verified_basic': 'Your basic verification is complete.',
        'verified_gst': 'Your GST verification is complete.',
        'suspended': 'Your vendor account has been suspended.',
        'rejected': 'Your vendor registration has been rejected.'
      };

      if (statusMessages[status]) {
        await UserModel.addNotification(
          vendor.userId,
          'verification_status_update',
          statusMessages[status],
          vendorId
        );
      }
    } catch (notifyError) {
      console.warn('Failed to send verification status notification:', notifyError);
    }

    res.status(200).json({
      message: `Vendor verification status updated to ${status}.`,
      vendor: updatedVendor
    });
  } catch (error) {
    console.error('Admin: Error updating vendor verification status:', error);
    next(error);
  }
};

// In src/controllers/adminController.js - simplify the verifyGstinForVendor function

// In src/controllers/adminController.js - fix the verifyGstinForVendor function
exports.verifyGstinForVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { gstin } = req.body;

    if (!gstin) {
      return res.status(400).json({ message: 'GSTIN is required for verification.' });
    }

    const vendor = await VendorModel.getVendorById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    // Call GST verification API
    const verificationResult = await GstinService.verify(gstin);

    console.log('🔍 GST Verification Result for Admin:', verificationResult); // Debug log

    // Return both vendor data and verification result for manual review
    res.status(200).json({
      success: true,
      message: 'GSTIN verification completed. Please review the details.',
      vendorData: {
        id: vendor.id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        category: vendor.category,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone,
        location: vendor.location,
        submittedGstin: vendor.gstin,
        verificationStatus: vendor.verificationStatus,
        createdAt: vendor.createdAt
      },
      gstVerificationResult: verificationResult // This should now contain the proper data
    });

  } catch (error) {
    console.error('Admin: Error verifying GSTIN:', error);
    next(error);
  }
};


exports.getVendorsByVerificationStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    
    const vendors = await VendorModel.getAllVendorsAdmin();
    const filteredVendors = vendors.filter(vendor => vendor.verificationStatus === status);
    
    // Enhance vendor data with user information
    const enhancedVendors = await Promise.all(
      filteredVendors.map(async (vendor) => {
        try {
          const user = await UserModel.getUserProfile(vendor.userId);
          return {
            ...vendor,
            userEmail: user?.email,
            userName: user?.name,
            userRole: user?.role
          };
        } catch (error) {
          return vendor;
        }
      })
    );
    
    res.status(200).json({ 
      status,
      count: enhancedVendors.length,
      vendors: enhancedVendors 
    });
  } catch (error) {
    console.error('Admin: Error getting vendors by verification status:', error);
    next(error);
  }
};

exports.confirmGstinVerification = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { confirmed, notes } = req.body;

    const vendor = await VendorModel.getVendorById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    let updates = {
      gstinVerified: confirmed,
      gstinVerificationDate: new Date(),
      verificationNotes: notes || ''
    };

    if (confirmed) {
      updates.verificationStatus = 'verified_gst';
      updates.isSuspended = false;
      updates.status = 'active';
    } else {
      updates.verificationStatus = 'gst_verification_failed';
    }

    const updatedVendor = await VendorModel.updateVendorStatus(vendorId, updates);

    // Send notification to vendor
    try {
      await UserModel.addNotification(
        vendor.userId,
        'gst_verification',
        `Your GSTIN verification has been ${confirmed ? 'approved' : 'rejected'}. ${notes || ''}`,
        vendorId
      );
    } catch (notifyError) {
      console.warn('Failed to send GST verification notification:', notifyError);
    }

    res.status(200).json({
      message: `GSTIN verification ${confirmed ? 'confirmed' : 'rejected'} successfully.`,
      vendor: updatedVendor
    });

  } catch (error) {
    console.error('Admin: Error confirming GST verification:', error);
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
    const { status, flagged, vendorId } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (flagged !== undefined) filters.flagged = flagged === 'true';
    if (vendorId) filters.vendorId = vendorId;

    const reviews = await ReviewModel.getAllReviewsAdmin(filters);
    
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
      filters,
      reviews: enhancedReviews 
    });
  } catch (error) {
    console.error('Admin: Error getting all reviews:', error);
    next(error);
  }
};

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
    console.error('Admin: Error getting flagged reviews:', error);
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
    console.error('Admin: Error getting review analytics:', error);
    next(error);
  }
};

exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.uid;

    const existingReview = await ReviewModel.getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const updatedReview = await ReviewModel.updateReviewStatus(reviewId, status, adminId, reason);
    
    // Recalculate vendor rating if status affects visibility
    if (status === 'removed' || status === 'approved') {
      await VendorModel.recalculateVendorRating(existingReview.vendorId);
    }

    // Notify the reviewer about status change
    if (status === 'removed') {
      try {
        await UserModel.addNotification(
          existingReview.userId,
          'review_removed',
          `Your review for ${existingReview.vendorName} has been removed: ${reason || 'Violation of community guidelines'}`,
          reviewId
        );
      } catch (notifyError) {
        console.warn('Failed to send removal notification:', notifyError);
      }
    } else if (status === 'approved' && existingReview.status === 'removed') {
      try {
        await UserModel.addNotification(
          existingReview.userId,
          'review_restored',
          `Your review for ${existingReview.vendorName} has been approved and restored.`,
          reviewId
        );
      } catch (notifyError) {
        console.warn('Failed to send restoration notification:', notifyError);
      }
    }

    res.status(200).json({ 
      message: `Review status updated to ${status}.`, 
      review: updatedReview 
    });
  } catch (error) {
    console.error('Admin: Error updating review status:', error);
    next(error);
  }
};

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
    console.error('Admin: Error removing review:', error);
    next(error);
  }
};

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
    console.error('Admin: Error restoring review:', error);
    next(error);
  }
};

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
    console.error('Admin: Error dismissing reports:', error);
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

    const flaggedReviews = reviews.filter(r => r.flagged);

    const stats = {
      totalUsers: users.length,
      totalVendors: vendors.length,
      totalReviews: reviews.length,
      pendingVendors: vendors.filter(v => v.verificationStatus === 'pending_review_basic' || v.verificationStatus === 'pending_gst_verification').length,
      flaggedReviews: flaggedReviews.length,
      newUsersToday: users.filter(u => {
        const today = new Date();
        const userDate = u.createdAt?._seconds ? new Date(u.createdAt._seconds * 1000) : new Date(u.createdAt);
        return userDate.toDateString() === today.toDateString();
      }).length,
      userRoles: {
        user: users.filter(u => u.role === 'user').length,
        vendor: users.filter(u => u.role === 'vendor').length,
        admin: users.filter(u => u.role === 'admin').length
      },
      vendorStatus: {
        pending: vendors.filter(v => v.verificationStatus === 'pending_review_basic' || v.verificationStatus === 'pending_gst_verification').length,
        approved: vendors.filter(v => v.verificationStatus === 'verified_basic' || v.verificationStatus === 'verified_gst').length,
        suspended: vendors.filter(v => v.verificationStatus === 'suspended').length
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Admin: Error getting dashboard stats:', error);
    next(error);
  }
};