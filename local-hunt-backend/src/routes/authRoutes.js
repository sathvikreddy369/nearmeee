// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register-profile', verifyToken, authController.registerUserProfile);
router.put('/users/:uid/role', verifyToken, authorizeRoles(['admin']), authController.updateUserRole);

module.exports = router;