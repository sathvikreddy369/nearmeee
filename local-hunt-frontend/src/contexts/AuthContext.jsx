// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import * as authApi from '../services/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshUserProfile = async (user = null) => {
    const userToRefresh = user || currentUser;
    
    if (!userToRefresh) {
      setUserProfile(null);
      return;
    }

    try {
      console.log('🔄 Refreshing user profile for:', userToRefresh.uid);
      const idToken = await userToRefresh.getIdToken();
      const profile = await authApi.getAuthenticatedUserProfile(idToken);
      setUserProfile(profile);
      console.log('✅ User profile loaded:', profile);
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      
      // If profile doesn't exist, create it automatically
      if (error.message.includes('User profile not found') || error.message.includes('404') || error.message.includes('500')) {
        console.log('🆕 User profile not found, creating one...');
        try {
          const idToken = await userToRefresh.getIdToken();
          await authApi.registerUserProfileInBackend(
            userToRefresh.uid,
            userToRefresh.email,
            userToRefresh.displayName || 'User',
            'user',
            idToken
          );
          
          // Try to fetch the profile again
          const newProfile = await authApi.getAuthenticatedUserProfile(idToken);
          setUserProfile(newProfile);
          console.log('✅ New user profile created and loaded:', newProfile);
        } catch (createError) {
          console.error('❌ Failed to create user profile:', createError);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setUserProfile(null);
      setAuthError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError('Failed to logout. Please try again.');
    }
  };

  useEffect(() => {
    console.log('AuthContext: onAuthStateChanged listener initiated.');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: onAuthStateChanged callback fired. User:', user);
      setAuthError(null);
      
      if (user) {
        setCurrentUser(user);
        try {
          console.log('AuthContext: Attempting to fetch user profile from backend...');
          const profile = await authApi.getAuthenticatedUserProfile(await user.getIdToken());
          console.log('AuthContext: User profile fetched:', profile);
          setUserProfile(profile);
        } catch (error) {
          console.error("AuthContext: Error fetching user profile from backend:", error);
          
          // Use the refreshUserProfile function to handle missing profiles
          await refreshUserProfile(user);
        }
      } else {
        console.log('AuthContext: No user authenticated.');
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoadingAuth(false);
      console.log('AuthContext: setLoadingAuth(false).');
    });

    return () => {
      console.log('AuthContext: Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loadingAuth,
    authError,
    refreshUserProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
};