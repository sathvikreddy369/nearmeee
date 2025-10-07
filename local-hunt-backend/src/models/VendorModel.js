// src/models/VendorModel.js
const { db, admin } = require('../config/firebaseAdmin');
const ngeohash = require('ngeohash');

/**
 * Generates a tokenized array of keywords for searching.
 * @param {object} vendorData - The vendor data.
 * @returns {Array<string>} An array of lowercase keywords.
 */
const generateSearchKeywords = (vendorData) => {
  const keywords = new Set();
  const addToKeywords = (text) => {
    if (!text) return;
    text.toLowerCase().split(/\s+/).forEach(word => keywords.add(word));
  };

  addToKeywords(vendorData.businessName);
  addToKeywords(vendorData.description);
  addToKeywords(vendorData.category);
  addToKeywords(vendorData.address?.colony);
  addToKeywords(vendorData.address?.city);

  if (vendorData.services) {
    vendorData.services.forEach(service => {
      addToKeywords(service.name);
      addToKeywords(service.description);
    });
  }

  return Array.from(keywords);
};

class VendorModel {
  static async createVendor(vendorData) {
    const newVendorData = {
      ...vendorData,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Keep existing analytics/review fields
      averageRating: 0,
      totalReviews: 0,
      profileViews: 0,
      searchImpressions: 0,
      
      // Update status/verification to match new model
      status: 'active',
      
      // Default VendorModel fields
      verificationStatus: vendorData.verificationStatus || 'pending_review_basic',
      isSuspended: vendorData.isSuspended || false, 
      changeHistory: vendorData.changeHistory || [],
      isOpen: true,
    };

    if (vendorData.location?.latitude && vendorData.location?.longitude) {
      newVendorData.geohash = ngeohash.encode(vendorData.location.latitude, vendorData.location.longitude, 9);
    }

    newVendorData._searchKeywords = generateSearchKeywords(newVendorData);

    try {
      const docRef = await db.collection('vendors').add(newVendorData);
      return { id: docRef.id, ...newVendorData };
    } catch (error) {
      console.error('Error creating vendor in Firestore:', error);
      throw new Error('Failed to create vendor profile.');
    }
  }
  static async getVendorById(vendorId) {
    try {
      const doc = await db.collection('vendors').doc(vendorId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting vendor by ID:', error);
      throw new Error('Failed to retrieve vendor profile.');
    }
  }

  static async getVendorByOwnerId(ownerUid) {
    try {
      const snapshot = await db.collection('vendors').where('userId', '==', ownerUid).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching vendor by owner UID:', error);
      throw new Error('Failed to fetch vendor profile by owner.');
    }
  }

  // In VendorModel.js - ensure this method exists with the fix
static async updateVendor(vendorId, updates) {
  const vendorRef = db.collection('vendors').doc(vendorId);
  const updatedData = { ...updates, updatedAt: new Date() };

  // Handle arrayUnion for changeHistory separately if present
  const changeHistoryUpdates = updatedData.changeHistory;
  delete updatedData.changeHistory;

  if (updates.location?.latitude && updates.location?.longitude) {
    updatedData.geohash = ngeohash.encode(updates.location.latitude, updates.location.longitude, 9);
  }

  const currentDoc = await vendorRef.get();
  const currentData = currentDoc.data();
  const potentiallyNewData = { ...currentData, ...updatedData };
  updatedData._searchKeywords = generateSearchKeywords(potentiallyNewData);

  try {
    if (changeHistoryUpdates && Array.isArray(changeHistoryUpdates) && changeHistoryUpdates.length > 0) {
      const finalUpdates = { 
        ...updatedData, 
        changeHistory: admin.firestore.FieldValue.arrayUnion(...changeHistoryUpdates)
      };
      await vendorRef.update(finalUpdates);
    } else {
      await vendorRef.update(updatedData);
    }
    
    const updatedDoc = await vendorRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw new Error('Failed to update vendor profile.');
  }
}

 // In VendorModel.js - update queryVendors method
static async queryVendors(params = {}) {
  let query = db.collection('vendors');
  
  // Default filter: only show non-suspended vendors
  const isSuspendedFilter = params.isSuspended === undefined ? false : params.isSuspended;
  query = query.where('isSuspended', '==', isSuspendedFilter);

  // Apply non-search filters to reduce dataset size
  if (params.category) query = query.where('category', '==', params.category);
  if (params.colony) query = query.where('address.colony', '==', params.colony);
  if (params.isOpen !== undefined) query = query.where('isOpen', '==', params.isOpen);

  const sortBy = params.sortBy || 'averageRating';
  const sortOrder = params.sortOrder || 'desc';
  query = query.orderBy(sortBy, sortOrder);

  try {
    const snapshot = await query.get();
    let vendors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Apply search filtering client-side
    if (params.search) {
      vendors = this.filterVendorsBySearch(vendors, params.search);
    }
    
    return vendors;
  } catch (error) {
    console.error('Error querying vendors:', error);
    throw new Error('Failed to retrieve vendors.');
  }
}

// Enhanced client-side search with better partial matching
static filterVendorsBySearch(vendors, searchTerm) {
  const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length >= 2);
  
  if (searchTerms.length === 0) return vendors;
  
  return vendors.filter(vendor => {
    // Create a searchable text blob from all relevant fields
    const searchableText = [
      vendor.businessName,
      vendor.description,
      vendor.category,
      vendor.address?.city,
      vendor.address?.colony,
      ...(vendor.services?.map(s => s.name) || []),
      ...(vendor.services?.map(s => s.description) || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    
    // Check if ALL search terms appear somewhere in the searchable text
    return searchTerms.every(term => searchableText.includes(term));
  });
}

  static async updateVendorRating(vendorId, ratingChange, reviewCountChange) {
    const vendorRef = db.collection('vendors').doc(vendorId);
    
    return db.runTransaction(async (transaction) => {
      const vendorDoc = await transaction.get(vendorRef);
      if (!vendorDoc.exists) {
        throw new Error('Vendor not found during rating update.');
      }

      const data = vendorDoc.data();
      const currentTotalReviews = data.totalReviews || 0;
      const currentAverageRating = data.averageRating || 0;

      const newTotalReviews = currentTotalReviews + reviewCountChange;
      if (newTotalReviews <= 0) {
        return transaction.update(vendorRef, { averageRating: 0, totalReviews: 0 });
      }

      const currentTotalRating = currentAverageRating * currentTotalReviews;
      const newTotalRating = currentTotalRating + ratingChange;
      const newAverageRating = newTotalRating / newTotalReviews;

      return transaction.update(vendorRef, {
        averageRating: parseFloat(newAverageRating.toFixed(2)),
        totalReviews: newTotalReviews,
      });
    });
  }

  /**
   * FIX: Recalculates the vendor's average rating and total reviews from scratch.
   * This is a robust method to ensure rating accuracy after administrative actions
   * like deleting a review or changing its approval status.
   * @param {string} vendorId - The ID of the vendor to recalculate.
   */
  static async recalculateVendorRating(vendorId) {
    const vendorRef = db.collection('vendors').doc(vendorId);
    // Assuming 'status' for reviews is used for approval (e.g., 'approved')
    const reviewsSnapshot = await db.collection('reviews').where('vendorId', '==', vendorId).where('status', '==', 'approved').get();

    if (reviewsSnapshot.empty) {
      await vendorRef.update({ averageRating: 0, totalReviews: 0 });
      return;
    }

    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    await vendorRef.update({
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews: totalReviews,
    });
  }

  // Other methods like getAllVendorsAdmin, updateVendorStatus, etc.
  static async getAllVendorsAdmin() {
    try {
      const snapshot = await db.collection('vendors').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all vendors for admin:', error);
      throw new Error('Failed to retrieve all vendors.');
    }
  }

  // Renamed/updated to use the new verification model
  static async updateVendorStatus(vendorId, updates) {
    if (updates.status && !['pending', 'approved', 'suspended', 'rejected'].includes(updates.status)) {
      throw new Error('Invalid vendor status provided.');
    }
    const vendorRef = db.collection('vendors').doc(vendorId);
    const updatedData = { ...updates, updatedAt: new Date() };
    
    try {
        await vendorRef.update(updatedData);
        const updatedDoc = await vendorRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
        console.error('Error updating vendor status/verification:', error);
        throw new Error('Failed to update vendor verification/status.');
    }
  }

  static async incrementProfileView(vendorId) {
    try {
      const vendorRef = db.collection('vendors').doc(vendorId);
      await vendorRef.update({ profileViews: admin.firestore.FieldValue.increment(1) });
    } catch (error) {
      console.error(`Error incrementing profile view for vendor ${vendorId}:`, error);
    }
  }

  static async incrementSearchImpression(vendorId) {
    try {
      const vendorRef = db.collection('vendors').doc(vendorId);
      await vendorRef.update({ searchImpressions: admin.firestore.FieldValue.increment(1) });
    } catch (error) {
      console.error(`Error incrementing search impression for vendor ${vendorId}:`, error);
    }
  }

  static async deleteVendor(vendorId) {
    try {
      await db.collection('vendors').doc(vendorId).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting vendor ${vendorId}:`, error);
      throw new Error('Failed to delete vendor.');
    }
  }

  /**
   * Verify GSTIN for a vendor (admin function)
   * @param {string} vendorId - The ID of the vendor
   * @param {string} gstin - The GSTIN to verify
   * @returns {Promise<object>} Verification result
   */
  static async verifyGstin(vendorId, gstin) {
    try {
      const GstinService = require('../services/GstinService');
      const result = await GstinService.verify(gstin);
      
      const updates = {
        gstinVerified: result.isValid,
        gstinVerificationDate: new Date(),
        gstinVerificationResult: result
      };

      // Update verification status based on GST result
      if (result.isValid) {
        updates.verificationStatus = 'verified_gst';
      } else {
        updates.verificationStatus = 'gst_verification_failed';
      }

      await db.collection('vendors').doc(vendorId).update(updates);
      
      return {
        success: true,
        vendorId,
        gstin,
        isValid: result.isValid,
        businessName: result.businessName,
        message: result.isValid ? 'GSTIN verified successfully' : result.error
      };
    } catch (error) {
      console.error('Error verifying GSTIN:', error);
      throw new Error('Failed to verify GSTIN: ' + error.message);
    }
  }

  /**
   * Update vendor verification status (admin function)
   * @param {string} vendorId - The ID of the vendor
   * @param {string} status - New verification status
   * @param {string} notes - Admin notes for the status change
   * @returns {Promise<object>} Updated vendor
   */
  static async updateVerificationStatus(vendorId, status, notes = '') {
    const validStatuses = [
      'pending_review_basic', 
      'pending_gst_verification',
      'verified_basic',
      'verified_gst', 
      'gst_verification_failed',
      'suspended',
      'rejected'
    ];

    if (!validStatuses.includes(status)) {
      throw new Error('Invalid verification status provided.');
    }

    const updates = {
      verificationStatus: status,
      updatedAt: new Date(),
      verificationNotes: notes
    };

    // If suspending, also set isSuspended
    if (status === 'suspended') {
      updates.isSuspended = true;
    } else if (status === 'rejected') {
      updates.isSuspended = true;
      updates.status = 'rejected';
    } else {
      updates.isSuspended = false;
      updates.status = 'active';
    }

    try {
      const vendorRef = db.collection('vendors').doc(vendorId);
      await vendorRef.update(updates);
      const updatedDoc = await vendorRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating vendor verification status:', error);
      throw new Error('Failed to update vendor verification status.');
    }
  }
}
module.exports = VendorModel;