// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { userProfileLimiter } = require('../middleware/rateLimitMiddleware'); // <-- NEW

// Get the authenticated user's profile
router.get('/me', verifyToken, userController.getMe);

// Update the authenticated user's profile
router.put('/me', verifyToken, userProfileLimiter, userController.updateUserProfile); // <-- MODERATE PROFILE WRITE LIMIT

// Add a vendor to user's favorites
router.post('/me/favorites/:vendorId', verifyToken, userProfileLimiter, userController.addFavorite); // <-- MODERATE PROFILE WRITE LIMIT

// Remove a vendor from user's favorites
router.delete('/me/favorites/:vendorId', verifyToken, userProfileLimiter, userController.removeFavorite); // <-- MODERATE PROFILE WRITE LIMIT

// --- Notifications Routes (usually light traffic, can use general limiter) ---
// Get notifications for the authenticated user
router.get('/me/notifications', verifyToken, userController.getNotifications); 

// Mark a notification as read
router.put('/me/notifications/:notificationId/read', verifyToken, userController.markNotificationAsRead); 

// Delete a notification
router.delete('/me/notifications/:notificationId', verifyToken, userController.deleteNotification); 

module.exports = router;