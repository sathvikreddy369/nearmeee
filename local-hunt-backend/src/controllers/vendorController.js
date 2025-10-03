// src/controllers/vendorController.js
const VendorModel = require('../models/VendorModel');
const UserModel = require('../models/UserModel');
const ImageUploadService = require('../services/imageUploadService');
const MapboxService = require('../services/mapboxService');
const GstinService = require('../services/GstinService'); 
const { db, auth, admin } = require('../config/firebaseAdmin');
const fs = require('fs');
const path = require('path');
const ngeohash = require('ngeohash');


/**
 * Endpoint for the frontend to check a GSTIN instantly before registration.
 * Fetches Legal Name (Business) and Owner Name (Legal Entity/Proprietor).
 * @route POST /api/vendors/check-gstin
 */
exports.checkGstinForRegistration = async (req, res, next) => {
    const { gstin } = req.body;
    
    if (!gstin) {
        return res.status(400).json({ 
            success: false,
            message: 'GSTIN is required for verification.' 
        });
    }
    
    // Basic GSTIN format validation
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin.trim())) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid GSTIN format. Please check the number and try again.' 
        });
    }
    
    try {
        const result = await GstinService.verify(gstin); 
        
        if (result.isValid) {
            return res.status(200).json({
                success: true,
                message: 'GSTIN is active and details fetched. Please confirm the names.',
                verifiedDetails: {
                    businessName: result.businessName,
                    ownerName: result.ownerName,
                    address: result.principalAddress,
                    additionalData: result.additionalData
                },
                gstin: gstin.trim()
            });
        } else {
            return res.status(400).json({ 
                success: false,
                message: result.error || 'GSTIN is invalid or currently inactive. Please check the number or proceed as a small vendor.',
                gstin: gstin.trim()
            });
        }
        
    } catch (error) {
        console.error('GST check failed:', error);
        
        // More specific error messages
        let userMessage = 'Verification service temporarily unavailable. Please proceed with manual registration.';
        
        if (error.message.includes('unavailable') || error.message.includes('connection')) {
            userMessage = 'GST verification service is currently unavailable. You can proceed with manual registration and verify your GSTIN later.';
        }
        
        return res.status(503).json({ 
            success: false,
            message: userMessage,
            gstin: gstin.trim()
        });
    }
};

exports.registerVendor = async (req, res, next) => {
  const profileImageFile = req.files?.profileImage ? req.files.profileImage[0] : null;
  const additionalImageFiles = req.files?.additionalImages || [];

  // DEBUG: Log ALL request body fields to see what's actually being received
  console.log('📨 ALL REQUEST BODY FIELDS:', Object.keys(req.body));
  console.log('📨 Request body values:', {
    businessName: req.body.businessName,
    ownerName: req.body.ownerName,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zipCode,
    country: req.body.country,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    address: req.body.address // The JSON string
  });

  // Parse address from JSON string and extract individual fields
  let parsedAddress = {};
  if (req.body.address) {
    try {
      parsedAddress = JSON.parse(req.body.address);
      console.log('📍 Parsed address data:', parsedAddress);
    } catch (error) {
      console.warn('Failed to parse address JSON:', error.message);
    }
  }

  // Use individual fields from body OR parsed address data
  const businessName = req.body.businessName;
  const ownerName = req.body.ownerName;
  const description = req.body.description;
  const category = req.body.category;
  const contactEmail = req.body.contactEmail;
  const contactPhone = req.body.contactPhone;
  
  // Address fields: try body first, then parsed address
  const street = req.body.street || parsedAddress.street;
  const colony = req.body.colony || parsedAddress.colony;
  const city = req.body.city || parsedAddress.city;
  const state = req.body.state || parsedAddress.state;
  const zipCode = req.body.zipCode || parsedAddress.zipCode;
  const country = req.body.country || parsedAddress.country || 'India'; // Default to India
  
  // Location fields
  let latitude = req.body.latitude;
  let longitude = req.body.longitude;
  
  // If location is sent as JSON string, parse it
  if (req.body.location && !latitude && !longitude) {
    try {
      const parsedLocation = JSON.parse(req.body.location);
      latitude = parsedLocation.latitude;
      longitude = parsedLocation.longitude;
      console.log('📍 Parsed location data:', { latitude, longitude });
    } catch (error) {
      console.warn('Failed to parse location JSON:', error.message);
    }
  }

  const services = req.body.services;
  const operatingHours = req.body.operatingHours;
  const establishmentDate = req.body.establishmentDate;
  const awards = req.body.awards;
  const gstin = req.body.gstin;

  const userId = req.user.uid;

  let uploadedProfileImageUrl = '';
  let uploadedAdditionalImageUrls = [];
  const filesToDelete = [];

  try {
    // Enhanced validation with final values
    console.log('🔍 FINAL Validation check:', {
      businessName: !!businessName,
      ownerName: !!ownerName,
      description: !!description,
      category: !!category,
      contactEmail: !!contactEmail,
      street: !!street,
      city: !!city,
      state: !!state,
      zipCode: !!zipCode,
      country: !!country,
      latitude: !!latitude,
      longitude: !!longitude,
      profileImageFile: !!profileImageFile
    });

    // Final validation with the actual values we'll use
    if (!businessName || !ownerName || !description || !category || !contactEmail || 
        !street || !city || !state || !zipCode || !country || 
        !latitude || !longitude || !profileImageFile) {
      
      return res.status(400).json({ 
        message: 'Missing required vendor registration fields.',
        missingFields: {
          businessName: !businessName,
          ownerName: !ownerName,
          description: !description,
          category: !category,
          contactEmail: !contactEmail,
          street: !street,
          city: !city,
          state: !state,
          zipCode: !zipCode,
          country: !country,
          latitude: !latitude,
          longitude: !longitude,
          profileImage: !profileImageFile
        },
        receivedData: {
          businessName,
          ownerName,
          street,
          city,
          state,
          zipCode,
          country,
          latitude,
          longitude,
          hasAddressJSON: !!req.body.address,
          hasLocationJSON: !!req.body.location
        }
      });
    }

    // --- REST OF YOUR CODE REMAINS THE SAME ---
    // Handle Image Uploads
    if (profileImageFile) {
      uploadedProfileImageUrl = await ImageUploadService.uploadImage(profileImageFile.path, `localhunt/vendors/${userId}/profile`);
      filesToDelete.push(profileImageFile.path);
    }

    if (additionalImageFiles.length > 0) {
      const additionalImagePaths = additionalImageFiles.map(file => file.path);
      uploadedAdditionalImageUrls = await ImageUploadService.uploadMultipleImages(additionalImagePaths, `localhunt/vendors/${userId}/additional`);
      filesToDelete.push(...additionalImagePaths);
    }

    // Handle Geocoding
    let locationData = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
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

    // Determine Verification Status
    const hasGstin = gstin && gstin.trim();
    let initialVerificationStatus;
    let legalGstName = null;

    if (hasGstin) {
      try {
        const gstinCheck = await GstinService.verify(hasGstin);
        if (gstinCheck.isValid) {
          initialVerificationStatus = 'verified_gst'; 
          legalGstName = gstinCheck.businessName;
        } else {
          initialVerificationStatus = 'pending_review_gst'; 
        }
      } catch (gstError) {
        console.warn('GST verification failed:', gstError.message);
        initialVerificationStatus = 'pending_review_gst';
      }
    } else {
      initialVerificationStatus = 'pending_review_basic'; 
    }

    // Safe JSON parsing
    const parseSafeJSON = (jsonString, defaultValue) => {
      if (!jsonString || jsonString.trim() === '') return defaultValue;
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.warn('JSON parse error for:', jsonString, 'Using default:', defaultValue);
        return defaultValue;
      }
    };

    const vendorData = {
      userId,
      businessName,
      ownerName,
      description,
      category,
      contactEmail,
      contactPhone: contactPhone || '',
      address: { street, colony: colony || '', city, state, zipCode, country },
      location: locationData,
      services: parseSafeJSON(services, []),
      operatingHours: parseSafeJSON(operatingHours, {}),
      establishmentDate: establishmentDate ? new Date(establishmentDate) : null,
      awards: parseSafeJSON(awards, []),
      profileImageUrl: uploadedProfileImageUrl,
      additionalImages: uploadedAdditionalImageUrls,
      gstin: hasGstin ? gstin.trim() : '',
      legalGstName: legalGstName,
      verificationStatus: initialVerificationStatus, 
      isSuspended: false, 
      changeHistory: [], 
      status: 'active', 
      isOpen: true,
    };

    console.log('✅ Creating vendor with final data:', {
      businessName: vendorData.businessName,
      ownerName: vendorData.ownerName,
      address: vendorData.address,
      location: vendorData.location,
      servicesCount: vendorData.services.length
    });

    const newVendor = await VendorModel.createVendor(vendorData);

    await auth.setCustomUserClaims(userId, { role: 'vendor' });
    await UserModel.updateUserProfile(userId, { role: 'vendor' });
        // Send notification to admin about new vendor registration
    try {
      const adminUsers = await UserModel.getUsersByRole('admin');
      adminUsers.forEach(async (adminUser) => {
        await UserModel.addNotification(
          adminUser.userId, 
          'new_vendor_registration',
          `New vendor registered: ${businessName}. Status: ${initialVerificationStatus}`,
          newVendor.id
        );
      });
    } catch (notifyError) {
      console.warn('Failed to send admin notifications:', notifyError);
    }

    res.status(201).json({
      message: 'Vendor registered successfully! Your listing is now public but marked as unverified.',
      vendor: newVendor,
    });

  } catch (error) {
    console.error('❌ Vendor registration failed:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Registration failed due to server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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
    const vendors = await VendorModel.queryVendors({ ...req.query, isSuspended: false });
    res.status(200).json({ vendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await VendorModel.getVendorById(id);
    if (!vendor || vendor.isSuspended) { 
      return res.status(404).json({ message: 'Vendor not found or suspended.' });
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
    const vendor = await VendorModel.getVendorByOwnerId(userId.toString()); 
    if (!vendor) { 
      return res.status(404).json({ message: 'Vendor profile not found for this user.' });
    }

    res.status(200).json({ vendor: vendor }); 
  } catch (error) {
    console.error('Error fetching vendor profile for owner:', error);
    next(error);
  }
};

exports.updateVendorProfile = async (req, res, next) => {
  const userId = req.user.uid;
  
  // Parse address from JSON string if it exists for updates too
  let addressData = {};
  if (req.body.address) {
    try {
      addressData = JSON.parse(req.body.address);
    } catch (error) {
      console.warn('Failed to parse address JSON during update:', error.message);
    }
  }

  const {
    businessName, ownerName, description, category, contactEmail, contactPhone,
    street = addressData.street,
    colony = addressData.colony, 
    city = addressData.city,
    state = addressData.state,
    zipCode = addressData.zipCode,
    country = addressData.country,
    latitude, longitude, services, operatingHours, establishmentDate, awards,
    existingProfileImageUrl, existingAdditionalImagesUrls,
    gstin 
  } = req.body;

  const profileImageFile = req.files?.profileImage ? req.files.profileImage[0] : null;
  const additionalImageFiles = req.files?.additionalImages || [];
  const filesToDelete = [];

  try {
    const snapshot = await db.collection('vendors').where('userId', '==', userId).get(); 
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Vendor profile not found for this user.' });
    }
    const vendorDoc = snapshot.docs[0];
    const vendorId = vendorDoc.id;
    const vendorDocData = vendorDoc.data(); 

    const updates = {};
    const auditLogs = []; 
    const timestamp = new Date().toISOString();

    // --- 1. Handle Image URLs ---
    let updatedProfileImageUrl = vendorDocData.profileImageUrl || '';
    if (profileImageFile) { 
        updatedProfileImageUrl = await ImageUploadService.uploadImage(profileImageFile.path, `localhunt/vendors/${userId}/profile`);
        filesToDelete.push(profileImageFile.path);
    } else if (existingProfileImageUrl !== undefined) {
        updatedProfileImageUrl = existingProfileImageUrl;
    }
    if (profileImageFile || existingProfileImageUrl !== undefined) {
        updates.profileImageUrl = updatedProfileImageUrl;
    }
    let updatedAdditionalImageUrls = vendorDocData.additionalImages || []; 
    if (additionalImageFiles.length > 0 || existingAdditionalImagesUrls !== undefined) {
      const newAdditionalImagePaths = additionalImageFiles.map(file => file.path);
      const newUploadedUrls = additionalImageFiles.length > 0 ? await ImageUploadService.uploadMultipleImages(newAdditionalImagePaths, `localhunt/vendors/${userId}/additional`) : [];
      filesToDelete.push(...newAdditionalImagePaths);
      const currentAdditional = JSON.parse(existingAdditionalImagesUrls || '[]').filter(url => url);
      updatedAdditionalImageUrls = [...currentAdditional, ...newUploadedUrls].slice(0, 3);
      updates.additionalImages = updatedAdditionalImageUrls.filter(url => url);
    }

    // --- 2. Audit and Update Critical Fields (Names, Contact, GSTIN) ---
    if (businessName !== undefined && businessName !== vendorDocData.businessName) {
      auditLogs.push({ field: 'businessName', oldValue: vendorDocData.businessName, newValue: businessName, changedBy: userId, timestamp, flagForReview: true });
      updates.businessName = businessName;
    }
    if (ownerName !== undefined && ownerName !== vendorDocData.ownerName) {
      auditLogs.push({ field: 'ownerName', oldValue: vendorDocData.ownerName, newValue: ownerName, changedBy: userId, timestamp, flagForReview: true });
      updates.ownerName = ownerName;
    }
    if (contactPhone !== undefined && contactPhone !== vendorDocData.contactPhone) {
      auditLogs.push({ field: 'contactPhone', oldValue: vendorDocData.contactPhone, newValue: contactPhone, changedBy: userId, timestamp, flagForReview: false });
      updates.contactPhone = contactPhone || '';
    }
    // GSTIN Change/Addition Audit & Re-verification
    if (gstin !== undefined && gstin.trim() !== (vendorDocData.gstin || '')) {
      const trimmedGstin = gstin.trim();
      auditLogs.push({ field: 'gstin', oldValue: vendorDocData.gstin || '', newValue: trimmedGstin, changedBy: userId, timestamp, flagForReview: true });
      updates.gstin = trimmedGstin;
      
      // --- AUTOMATIC GST VERIFICATION on change ---
      try {
         const gstinCheck = await GstinService.verify(trimmedGstin);
         
         if (gstinCheck.isValid) {
           updates.verificationStatus = 'verified_gst'; 
           updates.legalGstName = gstinCheck.businessName;
         } else {
           updates.verificationStatus = 'pending_review_gst'; 
         }
      } catch (apiError) {
         console.error('Failed to communicate with GST API:', apiError.message);
         updates.verificationStatus = 'pending_review_gst'; 
      }
    } else if (gstin !== undefined) {
      updates.gstin = gstin.trim(); 
    }

    // Other basic fields (no audit log needed)
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (contactEmail !== undefined) updates.contactEmail = contactEmail;
    
    // Safe JSON parsing for updates
    const parseSafeJSON = (jsonString, defaultValue) => {
      if (!jsonString || jsonString.trim() === '') return defaultValue;
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        return defaultValue;
      }
    };
    
    if (services !== undefined) updates.services = parseSafeJSON(services, []);
    if (operatingHours !== undefined) updates.operatingHours = parseSafeJSON(operatingHours, {});
    if (establishmentDate !== undefined) updates.establishmentDate = establishmentDate ? new Date(establishmentDate) : null;
    if (awards !== undefined) updates.awards = parseSafeJSON(awards, []);

    // --- 3. Audit and Update Address Fields ---
    const currentAddress = vendorDocData.address || {};
    const newAddressUpdates = {};
    let addressChanged = false;

    if (street !== undefined) newAddressUpdates.street = street;
    if (colony !== undefined) newAddressUpdates.colony = colony || '';
    if (city !== undefined) newAddressUpdates.city = city;
    if (state !== undefined) newAddressUpdates.state = state;
    if (zipCode !== undefined) newAddressUpdates.zipCode = zipCode;
    if (country !== undefined) newAddressUpdates.country = country;

    const newFullAddress = { ...currentAddress, ...newAddressUpdates };
    if (JSON.stringify(newFullAddress) !== JSON.stringify(currentAddress)) {
      addressChanged = true;
    }

    if (addressChanged) {
      auditLogs.push({ field: 'address', oldValue: currentAddress, newValue: newFullAddress, changedBy: userId, timestamp, flagForReview: true });
      updates.address = newFullAddress;
    } else if (vendorDocData.address !== undefined) {
      updates.address = currentAddress;
    }

    // --- 4. Audit and Update Location Coordinates/Geocoding ---
    const currentLat = vendorDocData.location?.latitude;
    const currentLon = vendorDocData.location?.longitude;
    let newLatitude = parseFloat(latitude);
    let newLongitude = parseFloat(longitude);
    let locationToSave = vendorDocData.location || {};

    if (
        (latitude !== undefined && longitude !== undefined) &&
        (newLatitude !== currentLat || newLongitude !== currentLon)
    ) {
      auditLogs.push({ field: 'location_coords', oldValue: { lat: currentLat, lon: currentLon }, newValue: { lat: newLatitude, lon: newLongitude }, changedBy: userId, timestamp, flagForReview: true });

      try {
            const geoData = await MapboxService.reverseGeocode(newLongitude, newLatitude);
            locationToSave = { latitude: newLatitude, longitude: newLongitude, ...geoData };
      } catch (geoError) {
            console.warn('Reverse geocoding failed during vendor profile update:', geoError.message);
            locationToSave = { latitude: newLatitude, longitude: newLongitude, fullAddress: `${newFullAddress.street || ''}, ${newFullAddress.city || ''}, ${newFullAddress.state || ''}, ${newFullAddress.country || ''}`, ...newFullAddress };
      }
      updates.location = locationToSave; 
      if (vendorDocData.verificationStatus !== 'pending_review_gst' && vendorDocData.verificationStatus !== 'verified_gst') {
        updates.verificationStatus = 'pending_review_basic'; 
      }
    } else if (vendorDocData.location !== undefined) {
      updates.location = locationToSave;
    }

    // --- 5. Finalize Update with Audit Logs ---
    if (Object.keys(updates).length === 0) {
        return res.status(200).json({ message: 'No changes detected to update.', vendor: vendorDocData });
    }

    // Pass audit logs to VendorModel (as regular array)
    if (auditLogs.length > 0) {
      updates.changeHistory = auditLogs;
    }

    // Use VendorModel.updateVendor which handles geohash and search keywords automatically
    const updatedVendor = await VendorModel.updateVendor(vendorId, updates);

    res.status(200).json({
      message: 'Vendor profile updated successfully! Critical changes may require re-verification.',
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

exports.incrementProfileView = async (req, res, next) => {
  try {
    const { id } = req.params;
    await VendorModel.incrementProfileView(id);
    res.status(200).json({ message: 'Profile view incremented.' });
  } catch (error) {
    console.error('Error incrementing profile view:', error);
    res.status(500).json({ message: 'Failed to increment view.' });
  }
};

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