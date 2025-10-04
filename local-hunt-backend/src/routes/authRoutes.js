// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Add your existing routes
const authController = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.post('/register-profile', verifyToken, authController.registerUserProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.put('/profile', verifyToken, authController.updateUserProfile);
router.put('/password', verifyToken, authController.changePassword);

// Admin routes
router.put('/users/:uid/role', verifyToken, authorizeRoles(['admin']), authController.updateUserRole);

module.exports = router;