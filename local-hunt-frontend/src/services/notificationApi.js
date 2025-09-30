import axios from 'axios';
    import { getCurrentIdToken } from './authApi';

    const API_URL = import.meta.env.VITE_BACKEND_API_URL;

    // Get all notifications for the authenticated user
    export const getNotifications = async (unreadOnly = false) => {
      try {
        const idToken = await getCurrentIdToken();
        if (!idToken) {
          throw new Error('No authentication token found. Please log in.');
        }
        const response = await axios.get(`${API_URL}/users/me/notifications`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          params: { unreadOnly },
        });
        return response.data.notifications;
      } catch (error) {
        throw error.response?.data?.message || error.message;
      }
    };

    // Mark a specific notification as read
    export const markNotificationAsRead = async (notificationId) => {
      try {
        const idToken = await getCurrentIdToken();
        if (!idToken) {
          throw new Error('No authentication token found. Please log in.');
        }
        const response = await axios.put(`${API_URL}/users/me/notifications/${notificationId}/read`, {}, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data?.message || error.message;
      }
    };

    // Delete a specific notification
    export const deleteNotification = async (notificationId) => {
      try {
        const idToken = await getCurrentIdToken();
        if (!idToken) {
          throw new Error('No authentication token found. Please log in.');
        }
        const response = await axios.delete(`${API_URL}/users/me/notifications/${notificationId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data?.message || error.message;
      }
    };