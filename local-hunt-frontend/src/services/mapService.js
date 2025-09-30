// src/services/mapService.js
import axios from 'axios';

const MAPBOX_API_URL = 'https://api.mapbox.com/directions/v5/mapbox';
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

// Fallback coordinates
const FALLBACK_COORDINATES = {
  latitude: 17.385044,
  longitude: 78.486671
};

/**
 * Validates coordinates
 */
const validateCoordinates = (coords) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return false;
  }
  const [lng, lat] = coords;
  return (
    typeof lng === 'number' && typeof lat === 'number' &&
    lng >= -180 && lng <= 180 &&
    lat >= -90 && lat <= 90
  );
};

/**
 * Gets fallback coordinates when geolocation fails
 */
export const getFallbackCoordinates = () => {
  console.warn('Using fallback coordinates');
  return [FALLBACK_COORDINATES.longitude, FALLBACK_COORDINATES.latitude];
};

/**
 * Fetches a driving route from start to end coordinates
 */
export const getDirections = async (startCoords, endCoords, profile = 'driving') => {
  try {
    // Validate coordinates
    if (!validateCoordinates(startCoords)) {
      console.warn('Invalid start coordinates, using fallback');
      startCoords = getFallbackCoordinates();
    }
    
    if (!validateCoordinates(endCoords)) {
      throw new Error('Invalid end coordinates provided');
    }

    if (!MAPBOX_ACCESS_TOKEN) {
      throw new Error('Mapbox access token is not configured');
    }

    const response = await axios.get(
      `${MAPBOX_API_URL}/${profile}/${startCoords.join(',')};${endCoords.join(',')}`,
      {
        params: {
          geometries: 'geojson',
          access_token: MAPBOX_ACCESS_TOKEN,
          steps: true,
          overview: 'full',
          alternatives: false,
          annotations: 'distance,duration',
          language: 'en'
        },
        timeout: 10000
      }
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        geometry: route.geometry,
        distance: route.distance, // meters
        duration: route.duration, // seconds
        steps: route.legs?.[0]?.steps || [],
        summary: route.legs?.[0]?.summary || ''
      };
    } else {
      throw new Error('No route found between the specified locations.');
    }
  } catch (error) {
    console.error('Error fetching directions from Mapbox:', error);
    
    if (error.response) {
      throw new Error(`Mapbox API error: ${error.response.data.message || 'Unable to get directions'}`);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to Mapbox service');
    } else {
      throw new Error('Could not retrieve directions: ' + error.message);
    }
  }
};

/**
 * Gets distance and duration between two points
 */
export const getDistanceMatrix = async (startCoords, endCoords, profile = 'driving') => {
  try {
    if (!validateCoordinates(startCoords)) {
      startCoords = getFallbackCoordinates();
    }
    
    if (!validateCoordinates(endCoords)) {
      return { distance: 'Unknown', duration: 'Unknown' };
    }

    const response = await axios.get(
      `${MAPBOX_API_URL}/${profile}/${startCoords.join(',')};${endCoords.join(',')}`,
      {
        params: {
          geometries: 'geojson',
          access_token: MAPBOX_ACCESS_TOKEN,
          overview: 'simplified'
        }
      }
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: (route.distance / 1000).toFixed(1), // km
        duration: Math.round(route.duration / 60), // minutes
        rawDistance: route.distance,
        rawDuration: route.duration
      };
    }
    
    return { distance: 'Unknown', duration: 'Unknown' };
  } catch (error) {
    console.error('Error fetching distance matrix:', error);
    return {
      distance: 'Unknown',
      duration: 'Unknown'
    };
  }
};

/**
 * Get turn-by-turn instructions
 */
export const getRouteInstructions = (steps) => {
  if (!steps || !Array.isArray(steps)) return [];
  
  return steps.map((step, index) => {
    const distance = (step.distance / 1000).toFixed(1);
    const duration = Math.round(step.duration / 60);
    
    return {
      step: index + 1,
      instruction: step.maneuver.instruction,
      distance: `${distance} km`,
      duration: `${duration} min`,
      type: step.maneuver.type,
      modifier: step.maneuver.modifier
    };
  });
};

/**
 * Opens Mapbox directions in new tab
 */
export const openMapboxDirections = (startCoords, endCoords, profile = 'driving') => {
  if (!validateCoordinates(startCoords) || !validateCoordinates(endCoords)) {
    throw new Error('Invalid coordinates for Mapbox directions');
  }

  const start = startCoords.join(',');
  const end = endCoords.join(',');
  
  const url = `https://www.mapbox.com/directions/?api=1&origin=${start}&destination=${end}&profile=${profile}`;
  window.open(url, '_blank');
};