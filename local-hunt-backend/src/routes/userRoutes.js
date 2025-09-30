// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get the authenticated user's profile
router.get('/me', verifyToken, userController.getMe);

// Update the authenticated user's profile
router.put('/me', verifyToken, userController.updateUserProfile);

// Add a vendor to user's favorites
router.post('/me/favorites/:vendorId', verifyToken, userController.addFavorite);

// Remove a vendor from user's favorites
router.delete('/me/favorites/:vendorId', verifyToken, userController.removeFavorite);

// --- Notifications Routes ---
// Get notifications for the authenticated user
router.get('/me/notifications', verifyToken, userController.getNotifications); // <--- ADD THIS LINE

// Mark a notification as read
router.put('/me/notifications/:notificationId/read', verifyToken, userController.markNotificationAsRead); // <--- ADD THIS LINE

// Delete a notification
router.delete('/me/notifications/:notificationId', verifyToken, userController.deleteNotification); // <--- ADD THIS LINE

module.exports = router;