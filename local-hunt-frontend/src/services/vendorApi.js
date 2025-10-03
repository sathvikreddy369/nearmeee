// src/services/vendorApi.js
import axios from 'axios';
import { getCurrentIdToken } from './authApi';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Helper to create authenticated headers
const getAuthHeaders = async () => {
  const idToken = await getCurrentIdToken();
  if (!idToken) {
    throw new Error('No authentication token found. Please log in.');
  }
  return { Authorization: `Bearer ${idToken}` };
};

/**
 * Endpoint for the frontend to check a GSTIN instantly.
 * Expected backend response: { verifiedDetails: { businessName, ownerName, address } }
 */
export const checkGstin = async (gstin) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/vendors/check-gstin`, { gstin }, { headers });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Verification failed due to a network error.';
    throw new Error(errorMessage);
  }
};

export const registerVendor = async (formData) => {
  try {
    const headers = await getAuthHeaders();
    
    // DEBUG: Log what's being sent
    console.log('📤 Sending vendor registration data:');
    for (let [key, value] of formData.entries()) {
      if (key === 'profileImage' || key === 'additionalImages') {
        console.log(`  ${key}:`, value.name || 'File object');
      } else if (key === 'services' || key === 'operatingHours' || key === 'awards') {
        console.log(`  ${key}:`, value.substring(0, 100) + '...'); // Preview long JSON
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    const response = await axios.post(`${API_URL}/vendors/register`, formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Registration error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      missingFields: error.response?.data?.missingFields
    });
    throw new Error(error.response?.data?.message || error.message);
  }
};


export const getAllVendors = async (params = {}) => {
  try {
    // Clean up params: remove any undefined or null values
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    );
    const response = await axios.get(`${API_URL}/vendors`, { params: cleanedParams });
    return response.data.vendors;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getVendorById = async (vendorId) => {
  try {
    const response = await axios.get(`${API_URL}/vendors/${vendorId}`);
    // Increment the profile view count, but don't block for it
    incrementProfileView(vendorId).catch(err => console.error('Failed to increment view count:', err));
    return response.data.vendor;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getVendorProfileForOwner = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/vendors/me`, { headers });
    return response.data.vendor;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateVendorProfile = async (formData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/vendors/me`, formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// This can be called by any user, so no auth is needed.
export const incrementProfileView = async (vendorId) => {
  try {
    await axios.post(`${API_URL}/vendors/${vendorId}/increment-view`);
  } catch (error) {
    // Don't throw error to the user for this background task
    console.error(`Failed to increment view for vendor ${vendorId}:`, error.message);
  }
};