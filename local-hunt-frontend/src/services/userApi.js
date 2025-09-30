// src/services/userApi.js
import axios from 'axios';
import { getCurrentIdToken } from './authApi';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const getUserProfile = async () => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.put(`${API_URL}/users/me`, profileData, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// New: Add a vendor to user's favorites
export const addFavoriteVendor = async (vendorId) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.post(`${API_URL}/users/me/favorites/${vendorId}`, {}, { // Empty body for POST
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// New: Remove a vendor from user's favorites
export const removeFavoriteVendor = async (vendorId) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.delete(`${API_URL}/users/me/favorites/${vendorId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};



// Add to userApi.js
export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      favoriteCount: 0,
      reviewCount: 0,
      messageCount: 0,
      recentViews: 0
    };
  }
};

export const getRecentActivity = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/activity`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};