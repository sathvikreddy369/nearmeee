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


/**
 * Update user profile (name, etc.)
 * @route PUT /api/auth/profile
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.uid;

    if (!name && !email) {
      return res.status(400).json({ 
        message: 'At least one field (name or email) is required for update.' 
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    // Update in Firebase Auth
    if (email) {
      await auth.updateUser(userId, { email });
    }
    if (name) {
      await auth.updateUser(userId, { displayName: name });
    }

    // Update in Firestore
    const updatedUser = await UserModel.updateUserProfile(userId, updates);

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        message: 'This email is already in use by another account.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update profile. Please try again.' 
    });
  }
};

/**
 * Change user password
 * @route PUT /api/auth/password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.uid;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Both current password and new password are required.' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long.' 
      });
    }

    // Firebase Admin SDK doesn't have a direct way to verify current password
    // So we'll rely on the client to re-authenticate before calling this endpoint
    // In a real app, you might want to implement additional verification
    
    await auth.updateUser(userId, { password: newPassword });

    res.status(200).json({
      message: 'Password changed successfully!'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        message: 'Password is too weak. Please choose a stronger password.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to change password. Please try again.' 
    });
  }
};

/**
 * Send password reset email
 * @route POST /api/auth/forgot-password
 */
// In your authController.js - update the forgotPassword function:

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    console.log('🔐 Forgot password request for email:', email);

    if (!email) {
      return res.status(400).json({ 
        message: 'Email address is required.' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address.' 
      });
    }

    try {
      // First, check if the user exists in Firebase Auth
      try {
        await auth.getUserByEmail(email);
        console.log('✅ User found in Firebase Auth');
      } catch (userError) {
        if (userError.code === 'auth/user-not-found') {
          console.log('ℹ️ User not found in Firebase Auth, but returning success for security');
          // For security, return success even if user doesn't exist
          return res.status(200).json({
            message: 'If an account with that email exists, a password reset link has been sent.'
          });
        }
        throw userError;
      }

      // Generate password reset link
      const actionCodeSettings = {
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
        handleCodeInApp: false // Set to false for web links
      };

      console.log('🔄 Generating password reset link...');
      
      // Use the correct Firebase Admin method for password reset
      const resetLink = await auth.generatePasswordResetLink(email, actionCodeSettings);
      console.log('✅ Password reset link generated successfully');

      // In a real application, you would send this link via email
      // For now, we'll log it for testing purposes
      console.log('📧 Password Reset Link:', resetLink);
      
      // TODO: Integrate with your email service (Nodemailer, SendGrid, etc.)
      // await sendPasswordResetEmail(email, resetLink);

      res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
        // Remove this in production - only for testing
        resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
      });

    } catch (firebaseError) {
      console.error('❌ Firebase error in forgot password:', firebaseError);
      
      // Handle specific Firebase errors
      if (firebaseError.code === 'auth/invalid-email') {
        return res.status(400).json({ 
          message: 'Please provide a valid email address.' 
        });
      }
      
      // For all other Firebase errors, return generic success message for security
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error in forgot password:', error);
    
    // For security, always return success
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }
};

/**
 * Reset password with action code
 * @route POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { oobCode, newPassword } = req.body;

    if (!oobCode || !newPassword) {
      return res.status(400).json({ 
        message: 'Reset code and new password are required.' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long.' 
      });
    }

    // Verify the password reset code
    await auth.verifyPasswordResetCode(oobCode);
    
    // Reset the password
    await auth.confirmPasswordReset(oobCode, newPassword);

    res.status(200).json({
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    
    if (error.code === 'auth/invalid-action-code') {
      return res.status(400).json({ 
        message: 'Invalid or expired reset code. Please request a new password reset.' 
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        message: 'Password is too weak. Please choose a stronger password.' 
      });
    }
    
    res.status(400).json({ 
      message: 'Failed to reset password. Please try again.' 
    });
  }
};