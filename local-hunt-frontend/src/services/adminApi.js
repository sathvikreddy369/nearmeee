// src/services/adminApi.js
import axios from 'axios';
import { getCurrentIdToken } from './authApi'; // To get the admin's ID token

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

// --- User Management ---
export const getAllUsers = async () => {
  try {
    const response = await adminAxios.get('/users');
    return response.data.users;
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

export const deleteVendor = async (vendorId) => {
  try {
    const response = await adminAxios.delete(`/vendors/${vendorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// --- Review Management ---
export const getAllReviewsAdmin = async () => {
  try {
    const response = await adminAxios.get('/reviews');
    return response.data.reviews;
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

export const deleteReview = async (reviewId) => {
  try {
    const response = await adminAxios.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};