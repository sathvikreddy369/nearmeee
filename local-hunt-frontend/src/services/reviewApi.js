// src/services/reviewApi.js
import axios from 'axios';
import { getCurrentIdToken } from './authApi';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Submit a new review
export const submitReview = async (vendorId, rating, comment) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.post(`${API_URL}/reviews`, { vendorId, rating, comment }, {
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

// Get all reviews for a specific vendor
export const getReviewsForVendor = async (vendorId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/vendor/${vendorId}`);
    return response.data.reviews;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Get all reviews submitted by the authenticated user
export const getReviewsByUser = async () => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.get(`${API_URL}/reviews/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data.reviews;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// New: Update an existing review
export const updateReview = async (reviewId, updates) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.put(`${API_URL}/reviews/${reviewId}`, updates, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Backend sends { message, review }
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// New: Delete an existing review
export const deleteReview = async (reviewId) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.data; // Backend sends { message }
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getAllReviews = async () => { // <--- ADD THIS FUNCTION
  try {
    const response = await axios.get(`${API_URL}/reviews`); // This hits the backend's exports.getAllReviews
    return response.data.reviews;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Add a reply to a review from a vendor
export const addVendorReply = async (reviewId, replyText) => {
  try {
    const idToken = await getCurrentIdToken();
    if (!idToken) {
      throw new Error('No authentication token found. Please log in.');
    }
    const response = await axios.put(`${API_URL}/reviews/${reviewId}/reply`, { replyText }, {
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