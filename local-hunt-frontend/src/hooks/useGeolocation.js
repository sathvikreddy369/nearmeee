// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPosition = () => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null); // Clear previous errors

      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser.';
        setError(errorMsg);
        setLoading(false);
        reject(new Error(errorMsg));
        return;
      }

      const success = (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(newLocation);
        setLoading(false);
        resolve(newLocation);
      };

      const geoError = (err) => {
        let errorMessage = 'An unknown error occurred.';
        console.error("Geolocation API error object:", err);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation. Please enable location services in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please ensure your device\'s location services are enabled and try again.';
            break;
          case err.TIMEOUT:
            errorMessage = 'The request to get user location timed out. Please try again.';
            break;
          default:
            errorMessage = err.message || 'An unexpected geolocation error occurred.';
            break;
        }
        setError(errorMessage);
        setLoading(false);
        reject(new Error(errorMessage));
      };

      // More relaxed options for better success rate
      const options = {
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 15000, // Increased to 15 seconds
        maximumAge: 300000, // 5 minutes - accept cached location
      };

      navigator.geolocation.getCurrentPosition(success, geoError, options);
    });
  };

  // Optional: Add a method to clear location
  const clearLocation = () => {
    setLocation({
      latitude: null,
      longitude: null,
      accuracy: null,
      timestamp: null,
    });
    setError(null);
  };

  return { location, error, loading, getPosition, clearLocation };
};

export default useGeolocation;