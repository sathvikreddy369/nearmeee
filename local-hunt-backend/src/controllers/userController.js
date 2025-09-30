// src/controllers/userController.js
const UserModel = require('../models/UserModel');
const MapboxService = require('../services/mapboxService'); // Import Mapbox service

exports.getMe = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const userProfile = await UserModel.getUserProfile(uid);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    // FIX: Wrap userProfile in a 'user' key for consistency with other backend responses
    res.status(200).json({ user: userProfile }); // <--- CHANGE THIS LINE
  } catch (error) {
    next(error);
  }
};

// Update authenticated user's profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const uid = req.user.uid; // User ID from authenticated token
    const updates = req.body;

    // Basic validation (you can enhance this with express-validator)
    if (updates.location && (typeof updates.location.latitude !== 'number' || typeof updates.location.longitude !== 'number')) {
        return res.status(400).json({ message: 'Latitude and Longitude must be numbers if location is provided.' });
    }

    // If coordinates are provided, perform reverse geocoding to get a detailed address
    if (updates.location && updates.location.latitude && updates.location.longitude) {
        try {
            const geoData = await MapboxService.reverseGeocode(updates.location.longitude, updates.location.latitude);
            // Merge detailed address components from Mapbox service
            updates.location = {
                ...updates.location,
                ...geoData // This will contain fullAddress, street, city, colony, etc.
            };
        } catch (geoError) {
            console.warn('Reverse geocoding failed for user:', uid, geoError.message);
            // Optionally, return an error or proceed without detailed address if geocoding fails
            // For now, we'll just log and proceed with only lat/long if geocoding fails.
        }
    }

    const updatedProfile = await UserModel.updateUserProfile(uid, updates);

    res.status(200).json({ message: 'Profile updated successfully.', user: updatedProfile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    next(error);
  }
};

/**
 * Add a vendor to the authenticated user's favorites list.
 * @route POST /api/users/me/favorites/:vendorId
 */
exports.addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.uid; // Authenticated user's UID
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor ID is required.' });
    }

    await UserModel.addFavoriteVendor(userId, vendorId);
    res.status(200).json({ message: 'Vendor added to favorites.' });
  } catch (error) {
    console.error('Error adding favorite vendor:', error);
    next(error);
  }
};

/**
 * Remove a vendor from the authenticated user's favorites list.
 * @route DELETE /api/users/me/favorites/:vendorId
 */
exports.removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.uid; // Authenticated user's UID
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor ID is required.' });
    }

    await UserModel.removeFavoriteVendor(userId, vendorId);
    res.status(200).json({ message: 'Vendor removed from favorites.' });
  } catch (error) {
    console.error('Error removing favorite vendor:', error);
    next(error);
  }
};


/**
 * Get notifications for the authenticated user.
 * @route GET /api/users/me/notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { unreadOnly } = req.query; // Query param 'unreadOnly=true'
    const notifications = await UserModel.getNotificationsForUser(userId, unreadOnly === 'true');
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    next(error);
  }
};

/**
 * Mark a notification as read for the authenticated user.
 * @route PUT /api/users/me/notifications/:notificationId/read
 */
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { notificationId } = req.params;
    await UserModel.markNotificationAsRead(userId, notificationId);
    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
};

/**
 * Delete a notification for the authenticated user.
 * @route DELETE /api/users/me/notifications/:notificationId
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { notificationId } = req.params;
    await UserModel.deleteNotification(userId, notificationId);
    res.status(200).json({ message: 'Notification deleted.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    next(error);
  }
};