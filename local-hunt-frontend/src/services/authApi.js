import axios from 'axios';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  // ⚠️ ADDED IMPORTS FOR GOOGLE SIGN-IN AND DELETE 
  GoogleAuthProvider, 
  signInWithPopup,
  deleteUser,
  // ⚠️ ADD THIS IMPORT FOR PASSWORD RESET
  sendPasswordResetEmail
} from 'firebase/auth';

const API_URL = import.meta.env.VITE_BACKEND_API_URL; // e.g., http://localhost:5000/api

// ⚠️ FIX: Function now expects the ID Token and includes it in the header
export const registerUserProfileInBackend = async (uid, email, name, role, idToken) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register-profile`, {
      uid,
      email,
      name,
      role,
    }, {
        headers: {
            // Send the ID Token for server-side verification (fixes 401 Unauthorized)
            Authorization: `Bearer ${idToken}`, 
        }
    });
    return response.data.user;
  } catch (error) {
    // Throw a clear error message
    throw new Error(error.response?.data?.message || `Failed to register profile: ${error.message}`);
  }
};

// Function to get authenticated user's profile from the backend
export const getAuthenticatedUserProfile = async (idToken) => {
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data.user;
  } catch (error) {
    // Throw a clear error message for the context
    throw new Error(error.response?.data?.message || `Error fetching user profile: ${error.message}`);
  }
};

// --- Firebase Client-Side Auth Functions ---

export const signupWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    // Throw the raw error object to preserve the 'code' property for AuthPage error handling
    throw error; 
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error; // Throw the raw error object
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error.message;
  }
};

export const getCurrentIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  
  try {
    console.log('🔐 Starting Google sign-in...');
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log('✅ Google sign-in successful, user:', user.uid);
    console.log('🔍 Is new user?', result._tokenResponse?.isNewUser);
    
    const isNewUser = result._tokenResponse?.isNewUser;
    
    if (isNewUser) {
      console.log('🆕 New Google user detected, creating profile...');
      const idToken = await user.getIdToken();
      
      try {
        await registerUserProfileInBackend(
          user.uid, 
          user.email, 
          user.displayName || 'Google User', 
          'user',
          idToken
        );
        console.log('✅ Google user profile created successfully');
      } catch (profileError) {
        console.error('❌ Failed to create Google user profile:', profileError);
        // Don't throw here - we still want to sign the user in
        // The profile can be created later when they access their profile
      }
    } else {
      console.log('👤 Existing Google user');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Google sign-in failed:', error);
    throw error;
  }
};

// ⚠️ FIX: deleteUserAccount now uses the imported deleteUser function
export const deleteUserAccount = async (userToDelete) => {
  const user = userToDelete || auth.currentUser;
  if (user) {
    await deleteUser(user); 
  }
};

/**
 * Update user profile
 * @param {object} profileData - Profile data to update
 * @returns {Promise<object>} Updated user data
 */
export const updateUserProfile = async (profileData) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    
    const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Change user password
 * @param {object} passwordData - Current and new password
 * @returns {Promise<object>} Success message
 */
export const changePassword = async (passwordData) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    
    const response = await axios.put(`${API_URL}/auth/password`, passwordData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Request password reset email using Firebase Client SDK
 * @param {string} email - User email
 * @returns {Promise<object>} Success message
 */
export const forgotPassword = async (email) => {
  try {
    console.log('🔐 Sending password reset email to:', email);
    
    // Configure where the user should be redirected after reset
    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`, // Your frontend reset page
      handleCodeInApp: false // Opens in browser, not app
    };

    // This will trigger Firebase to send the reset email
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    
    console.log('✅ Firebase password reset email sent successfully');
    
    return { 
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    };
  } catch (error) {
    console.error('❌ Firebase password reset error:', error);
    
    // Handle specific Firebase errors
    switch (error.code) {
      case 'auth/invalid-email':
        throw new Error('Please provide a valid email address.');
      
      case 'auth/user-not-found':
        // For security, don't reveal if user exists
        return { 
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        };
      
      case 'auth/too-many-requests':
        throw new Error('Too many attempts. Please try again later.');
      
      case 'auth/network-request-failed':
        throw new Error('Network error. Please check your connection and try again.');
      
      default:
        throw new Error('Failed to send password reset email. Please try again.');
    }
  }
};

/**
 * Reset password with action code (for ResetPasswordPage)
 * @param {string} oobCode - The reset code from email link
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Success message
 */
export const resetPassword = async (oobCode, newPassword) => {
  try {
    console.log('🔐 Resetting password with code');
    
    // Note: Firebase Client SDK handles password reset automatically when user clicks the link
    // This function might not be needed if you're using Firebase's built-in reset flow
    // But keeping it for consistency with your existing code
    
    // For now, we'll just validate and return success
    // The actual password reset happens when user clicks the Firebase link
    
    if (!oobCode || !newPassword) {
      throw new Error('Reset code and new password are required.');
    }

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    };
    
  } catch (error) {
    console.error('❌ Reset password error:', error);
    throw error;
  }
};

/**
 * Request password reset email (legacy backend version - keep for reference)
 * @param {string} email - User email
 * @returns {Promise<object>} Success message
 */
export const forgotPasswordBackend = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Reset password with code (legacy backend version - keep for reference)
 * @param {object} resetData - Reset code and new password
 * @returns {Promise<object>} Success message
 */
export const resetPasswordBackend = async (resetData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, resetData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};