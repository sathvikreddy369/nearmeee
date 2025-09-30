// src/controllers/vendorController.js
const VendorModel = require('../models/VendorModel');
const UserModel = require('../models/UserModel');
const ImageUploadService = require('../services/imageUploadService');
const MapboxService = require('../services/mapboxService');
const { db, auth } = require('../config/firebaseAdmin'); // Ensure 'db' is imported
const fs = require('fs');
const path = require('path');

exports.registerVendor = async (req, res, next) => {
  const profileImageFile = req.files?.profileImage ? req.files.profileImage[0] : null;
  const additionalImageFiles = req.files?.additionalImages || [];

  const {
    businessName,
    description,
    category,
    contactEmail,
    contactPhone,
    street,
    colony,
    city,
    state,
    zipCode,
    country,
    latitude,
    longitude,
    services,
    operatingHours,
    establishmentDate,
    awards,
  } = req.body;

  const userId = req.user.uid;

  let uploadedProfileImageUrl = '';
  let uploadedAdditionalImageUrls = [];
  const filesToDelete = [];

  try {
    if (!businessName || !description || !category || !contactEmail || !street || !city || !state || !zipCode || !country || !latitude || !longitude || !profileImageFile) {
      return res.status(400).json({ message: 'Missing required vendor registration fields, including profile image.' });
    }

    if (profileImageFile) {
      uploadedProfileImageUrl = await ImageUploadService.uploadImage(
        profileImageFile.path,
        `localhunt/vendors/${userId}/profile`
      );
      filesToDelete.push(profileImageFile.path);
    }

    if (additionalImageFiles.length > 0) {
      const additionalImagePaths = additionalImageFiles.map(file => file.path);
      uploadedAdditionalImageUrls = await ImageUploadService.uploadMultipleImages(
        additionalImagePaths,
        `localhunt/vendors/${userId}/additional`
      );
      filesToDelete.push(...additionalImagePaths);
    }

    let locationData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    try {
      const geoData = await MapboxService.reverseGeocode(locationData.longitude, locationData.latitude);
      locationData = { ...locationData, ...geoData };
    } catch (geoError) {
      console.warn('Reverse geocoding failed during vendor registration:', geoError.message);
      locationData.fullAddress = `${street}, ${city}, ${state}, ${country}`;
      locationData.address = street;
      locationData.colony = colony;
      locationData.city = city;
      locationData.state = state;
      locationData.zipCode = zipCode;
      locationData.country = country;
    }

    const vendorData = {
      userId,
      businessName,
      description,
      category,
      contactEmail,
      contactPhone: contactPhone || '',
      address: { street, colony: colony || '', city, state, zipCode, country },
      location: locationData,
      services: services ? JSON.parse(services) : [],
      operatingHours: operatingHours ? JSON.parse(operatingHours) : {},
      establishmentDate: establishmentDate ? new Date(establishmentDate) : null,
      awards: awards ? JSON.parse(awards) : [],
      profileImageUrl: uploadedProfileImageUrl,
      additionalImages: uploadedAdditionalImageUrls,
    };

    const newVendor = await VendorModel.createVendor(vendorData);

    await auth.setCustomUserClaims(userId, { role: 'vendor' });
    await UserModel.updateUserProfile(userId, { role: 'vendor' });

    res.status(201).json({
      message: 'Vendor registered successfully!',
      vendor: newVendor,
    });

  } catch (error) {
    console.error('Vendor registration failed:', error);
    next(error);
  } finally {
    filesToDelete.forEach(filePath => {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temp file:', filePath, err);
      });
    });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await VendorModel.queryVendors(req.query);
    res.status(200).json({ vendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await VendorModel.getVendorById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }
    VendorModel.incrementProfileView(id);
    res.status(200).json({ vendor });
  } catch (error) {
    console.error('Error fetching vendor by ID:', error);
    next(error);
  }
};

exports.getVendorProfileForOwner = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    // const snapshot = await db.collection('vendors').where('userId', '==', userId).limit(1).get();
    const snapshot = await db.collection('vendors').where('userId', '==', userId).get(); // Removed .limit(1)

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Vendor profile not found for this user.' });
    }

    const vendorDoc = snapshot.docs[0];
    res.status(200).json({ vendor: { id: vendorDoc.id, ...vendorDoc.data() } });
  } catch (error) {
    console.error('Error fetching vendor profile for owner:', error);
    next(error);
  }
};

/**
 * Get the authenticated vendor's own profile.
 * @route GET /api/vendors/me
 */
exports.getVendorProfileForOwner = async (req, res, next) => {
  try {
    const userId = req.user.uid; // Authenticated user's UID
    console.log(`--- DEBUG: getVendorProfileForOwner ---`);
    console.log(`DEBUG: User ID from token (req.user.uid): "${userId}" (Type: ${typeof userId})`);

    // Use the new method to find vendor by owner UID
    const vendor = await VendorModel.getVendorByOwnerId(userId.toString()); // Ensure userId is string

    console.log(`DEBUG: Vendor found by owner ID: ${!!vendor}`); // Logs true/false
    if (vendor) {
        console.log('DEBUG: Found vendor document data:', vendor); // Logs the found vendor object
    } else {
        console.log('DEBUG: No vendor document found for this userId in Firestore via getVendorByOwnerId.');
    }
    console.log(`--- END DEBUG ---`);


    if (!vendor) { // Check if vendor object is null
      return res.status(404).json({ message: 'Vendor profile not found for this user.' });
    }

    res.status(200).json({ vendor: vendor }); // Return the found vendor object
  } catch (error) {
    console.error('Error fetching vendor profile for owner:', error);
    next(error);
  }
};



exports.updateVendorProfile = async (req, res, next) => {
  const userId = req.user.uid;
  const {
    businessName, description, category, contactEmail, contactPhone,
    street, colony, city, state, zipCode, country,
    latitude, longitude, services, operatingHours, establishmentDate, awards,
    existingProfileImageUrl, existingAdditionalImagesUrls // These are JSON strings from frontend
  } = req.body;

  const profileImageFile = req.files?.profileImage ? req.files.profileImage[0] : null;
  const additionalImageFiles = req.files?.additionalImages || [];
  const filesToDelete = [];

  try {
    // const snapshot = await db.collection('vendors').where('userId', '==', userId).limit(1).get();
    const snapshot = await db.collection('vendors').where('userId', '==', userId).get(); // Removed .limit(1)
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Vendor profile not found for this user.' });
    }
    const vendorDoc = snapshot.docs[0];
    const vendorId = vendorDoc.id;
    const vendorDocData = vendorDoc.data(); // Get existing data to merge/fallback

    // --- Handle Image URLs ---
    let updatedProfileImageUrl = vendorDocData.profileImageUrl || ''; // Default to existing
    if (profileImageFile) {
      updatedProfileImageUrl = await ImageUploadService.uploadImage(
        profileImageFile.path,
        `localhunt/vendors/${userId}/profile`
      );
      filesToDelete.push(profileImageFile.path);
    } else if (existingProfileImageUrl !== undefined) { // If frontend explicitly sends existing URL (or empty string)
      updatedProfileImageUrl = existingProfileImageUrl;
    }

    let updatedAdditionalImageUrls = vendorDocData.additionalImages || []; // Default to existing array
    if (additionalImageFiles.length > 0) {
      const newAdditionalImagePaths = additionalImageFiles.map(file => file.path);
      const newUploadedUrls = await ImageUploadService.uploadMultipleImages(
        newAdditionalImagePaths,
        `localhunt/vendors/${userId}/additional`
      );
      filesToDelete.push(...newAdditionalImagePaths);
      // Combine existing (if any) and new, then slice to max 3
      const currentAdditional = JSON.parse(existingAdditionalImagesUrls || '[]').filter(url => url);
      updatedAdditionalImageUrls = [...currentAdditional, ...newUploadedUrls].slice(0, 3);
    } else if (existingAdditionalImagesUrls !== undefined) { // If frontend explicitly sends existing URLs (or empty array string)
      updatedAdditionalImageUrls = JSON.parse(existingAdditionalImagesUrls || '[]');
    }
    updatedAdditionalImageUrls = updatedAdditionalImageUrls.filter(url => url); // Filter out any null/empty strings


    // --- Construct updates object dynamically, only including fields that are explicitly provided and not undefined ---
    const updates = {};

    // Basic text fields
    if (businessName !== undefined) updates.businessName = businessName;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (contactEmail !== undefined) updates.contactEmail = contactEmail;
    if (contactPhone !== undefined) updates.contactPhone = contactPhone || '';

    // Address fields - merge with existing address to allow partial updates
    const currentAddress = vendorDocData.address || {};
    const newAddressUpdates = {};
    if (street !== undefined) newAddressUpdates.street = street;
    if (colony !== undefined) newAddressUpdates.colony = colony || '';
    if (city !== undefined) newAddressUpdates.city = city;
    if (state !== undefined) newAddressUpdates.state = state;
    if (zipCode !== undefined) newAddressUpdates.zipCode = zipCode;
    if (country !== undefined) newAddressUpdates.country = country;

    if (Object.keys(newAddressUpdates).length > 0) {
        updates.address = { ...currentAddress, ...newAddressUpdates };
    } else if (vendorDocData.address !== undefined) { // If original had address but no updates, keep it
        updates.address = currentAddress;
    }


    // Location data - perform reverse geocoding if coordinates are updated or newly provided
    const currentLat = vendorDocData.location?.latitude;
    const currentLon = vendorDocData.location?.longitude;
    let newLatitude = parseFloat(latitude);
    let newLongitude = parseFloat(longitude);
    let locationToSave = vendorDocData.location || {}; // Start with existing location

    // Check if latitude or longitude are provided AND are different from existing
    if (
        (latitude !== undefined && longitude !== undefined) &&
        (newLatitude !== currentLat || newLongitude !== currentLon)
    ) {
        try {
            const geoData = await MapboxService.reverseGeocode(newLongitude, newLatitude);
            locationToSave = {
                latitude: newLatitude,
                longitude: newLongitude,
                ...geoData // This will contain fullAddress, street, city, colony, etc.
            };
        } catch (geoError) {
            console.warn('Reverse geocoding failed during vendor profile update:', geoError.message);
            // Fallback to basic address if geocoding fails, keep provided lat/long
            locationToSave = {
                latitude: newLatitude,
                longitude: newLongitude,
                fullAddress: `${street || currentAddress.street || ''}, ${city || currentAddress.city || ''}, ${state || currentAddress.state || ''}, ${country || currentAddress.country || ''}`,
                street: street || currentAddress.street || '',
                colony: colony || currentAddress.colony || '',
                city: city || currentAddress.city || '',
                state: state || currentAddress.state || '',
                zipCode: zipCode || currentAddress.zipCode || '', // Fix: zipCode instead of zipAddress
                country: country || currentAddress.country || '',
            };
        }
        updates.location = locationToSave; // Only update location if it changed or was provided
    } else if (vendorDocData.location !== undefined) { // If original had location but no updates, keep it
        updates.location = locationToSave; // Keep existing location data
    }


    // Services, Operating Hours, Establishment Date, Awards
    if (services !== undefined) updates.services = services ? JSON.parse(services) : [];
    if (operatingHours !== undefined) updates.operatingHours = operatingHours ? JSON.parse(operatingHours) : {};
    if (establishmentDate !== undefined) updates.establishmentDate = establishmentDate ? new Date(establishmentDate) : null;
    if (awards !== undefined) updates.awards = awards ? JSON.parse(awards) : [];

    // Image URLs
    if (profileImageFile || existingProfileImageUrl !== undefined) {
        updates.profileImageUrl = updatedProfileImageUrl;
    }
    if (additionalImageFiles.length > 0 || existingAdditionalImagesUrls !== undefined) { 
        updates.additionalImages = updatedAdditionalImageUrls;
    }

    // Perform the update only if there are actual fields to update
    if (Object.keys(updates).length === 0) {
        return res.status(200).json({ message: 'No changes detected to update.', vendor: vendorDocData });
    }

    const updatedVendor = await VendorModel.updateVendor(vendorId, updates);

    res.status(200).json({
      message: 'Vendor profile updated successfully!',
      vendor: updatedVendor,
    });

  } catch (error) {
    console.error('Vendor profile update failed:', error);
    next(error);
  } finally {
    filesToDelete.forEach(filePath => {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temp file:', filePath, err);
      });
    });
  }
};

/**
 * Endpoint to increment a vendor's profile view count.
 * @route POST /api/vendors/:id/increment-view
 */
exports.incrementProfileView = async (req, res, next) => {
  try {
    const { id } = req.params;
    await VendorModel.incrementProfileView(id);
    res.status(200).json({ message: 'Profile view incremented.' });
  } catch (error) {
    // Log but don't send error to client as it's a non-critical background task
    console.error('Error incrementing profile view:', error);
    res.status(500).json({ message: 'Failed to increment view.' }); // Still send a response
  }
};

/**
 * Endpoint to increment a vendor's search impression count.
 * @route POST /api/vendors/:id/increment-impression
 */
exports.incrementSearchImpression = async (req, res, next) => {
  try {
    const { id } = req.params;
    await VendorModel.incrementSearchImpression(id);
    res.status(200).json({ message: 'Search impression incremented.' });
  } catch (error) {
    console.error('Error incrementing search impression:', error);
    res.status(500).json({ message: 'Failed to increment impression.' });
  }
};