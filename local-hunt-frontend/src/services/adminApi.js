import axios from 'axios';
import { getCurrentIdToken } from './authApi';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Helper to make authenticated admin requests
const adminAxios = axios.create({
  baseURL: `${API_URL}/admin`,
});

adminAxios.interceptors.request.use(async (config) => {
  const idToken = await getCurrentIdToken();
  if (idToken) {
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Regular API instance for non-admin routes
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const idToken = await getCurrentIdToken();
  if (idToken) {
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Dashboard Stats ---
export const getDashboardStats = async () => {
  try {
    const response = await adminAxios.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// --- User Management ---
export const getAllUsers = async () => {
  try {
    const response = await adminAxios.get('/users');
    return response.data.users;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateUserRole = async (uid, role) => {
  try {
    const response = await adminAxios.put(`/users/${uid}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteUser = async (uid) => {
  try {
    const response = await adminAxios.delete(`/users/${uid}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// --- Vendor Management ---
export const getAllVendorsAdmin = async () => {
  try {
    const response = await adminAxios.get('/vendors');
    return response.data.vendors;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateVendorStatus = async (vendorId, status) => {
  try {
    const response = await adminAxios.put(`/vendors/${vendorId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateVendorVerificationStatus = async (vendorId, verificationStatus, notes = '') => {
  try {
    const response = await adminAxios.put(`/vendors/${vendorId}/verification-status`, { 
      status: verificationStatus, 
      notes 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// FIXED: Use adminAxios instead of api
export const verifyGstinForVendor = async (vendorId, gstin) => {
  try {
    const response = await adminAxios.post(`/vendors/${vendorId}/verify-gstin`, { gstin });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'GSTIN verification failed');
  }
};

export const getVendorsByVerificationStatus = async (status) => {
  try {
    const response = await adminAxios.get(`/vendors/verification/${status}`);
    return response.data.vendors;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteVendor = async (vendorId) => {
  try {
    const response = await adminAxios.delete(`/vendors/${vendorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// --- Review Management ---
export const getAllReviewsAdmin = async (filters = {}) => {
  try {
    const response = await adminAxios.get('/reviews', { params: filters });
    return response.data.reviews;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getFlaggedReviews = async () => {
  try {
    const response = await adminAxios.get('/reviews/flagged');
    return response.data.reviews;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getReviewAnalytics = async () => {
  try {
    const response = await adminAxios.get('/reviews/analytics');
    return response.data.analytics;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateReviewStatus = async (reviewId, status) => {
  try {
    const response = await adminAxios.put(`/reviews/${reviewId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const removeReviewAdmin = async (reviewId, reason = '') => {
  try {
    const response = await adminAxios.post(`/reviews/${reviewId}/remove`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const restoreReviewAdmin = async (reviewId) => {
  try {
    const response = await adminAxios.post(`/reviews/${reviewId}/restore`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const dismissReports = async (reviewId) => {
  try {
    const response = await adminAxios.post(`/reviews/${reviewId}/dismiss-reports`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await adminAxios.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const confirmGstinVerification = async (vendorId, confirmed, notes = '') => {
  try {
    const response = await adminAxios.post(`/vendors/${vendorId}/confirm-gstin-verification`, { 
      confirmed, 
      notes 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};