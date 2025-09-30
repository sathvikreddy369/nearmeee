// src/controllers/authController.js
const UserModel = require('../models/UserModel');
const { auth } = require('../config/firebaseAdmin');

exports.registerUserProfile = async (req, res, next) => {
  try {
    const { uid, email, name, role } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ message: 'UID and email are required for profile creation.' });
    }

    const userProfile = await UserModel.createUserProfile(uid, email, name || 'New User', role || 'user');
    res.status(201).json({ message: 'User profile created successfully.', user: userProfile });
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Firestore error code for Already Exists (code 6) or (code 9) ABORTED
    if (error.code === 6 || error.code === 9) {
        return res.status(409).json({ message: 'User profile might already exist or operation aborted.' });
    }
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided.' });
    }

    await auth.setCustomUserClaims(uid, { role });
    const updatedUser = await UserModel.updateUserProfile(uid, { role });

    res.status(200).json({ message: `User ${uid} role updated to ${role}.`, user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    next(error);
  }
};