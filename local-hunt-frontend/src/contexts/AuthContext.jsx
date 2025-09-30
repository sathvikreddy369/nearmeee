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
    console.log('AuthContext: onAuthStateChanged listener initiated.'); // LOG 1
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: onAuthStateChanged callback fired. User:', user); // LOG 2
      setAuthError(null); // Reset error on auth change
      if (user) {
        setCurrentUser(user);
        try {
          console.log('AuthContext: Attempting to fetch user profile from backend...'); // LOG 3
          const profile = await authApi.getAuthenticatedUserProfile(await user.getIdToken());
          console.log('AuthContext: User profile fetched:', profile); // LOG 4
          setUserProfile(profile);
        } catch (error) {
          console.error("AuthContext: Error fetching user profile from backend:", error); // ERROR LOG
          setUserProfile(null);
          setAuthError('Failed to load user profile. Please refresh the page.');
        }
      } else {
        console.log('AuthContext: No user authenticated.'); // LOG 5
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoadingAuth(false);
      console.log('AuthContext: setLoadingAuth(false).'); // LOG 6
    });

    return () => {
      console.log('AuthContext: Cleaning up onAuthStateChanged listener.'); // LOG 7 (on unmount)
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loadingAuth,
    authError,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
};