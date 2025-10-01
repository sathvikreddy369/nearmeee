import axios from 'axios';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  // ⚠️ ADDED IMPORTS FOR GOOGLE SIGN-IN AND DELETE 
  GoogleAuthProvider, 
  signInWithPopup,
  deleteUser
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
  
  const result = await signInWithPopup(auth, provider);
  
  const isNewUser = result._tokenResponse?.isNewUser;
  
  if (isNewUser) {
    const user = result.user;
    const idToken = await user.getIdToken(); // Get token for backend registration
    
    await registerUserProfileInBackend(
      user.uid, 
      user.email, 
      user.displayName || 'Google User', 
      'user',
      idToken // Pass the ID token
    );
  }
  
  return result;
};

// ⚠️ FIX: deleteUserAccount now uses the imported deleteUser function
export const deleteUserAccount = async (userToDelete) => {
  const user = userToDelete || auth.currentUser;
  if (user) {
    await deleteUser(user); 
  }
};