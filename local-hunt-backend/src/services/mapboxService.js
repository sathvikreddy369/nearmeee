// src/services/mapboxService.js
const axios = require('axios');
require('dotenv').config();

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_PRIVATE_TOKEN; // Use your private token for backend calls
const MAPBOX_GEOCODING_API_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

class MapboxService {
  // Reverse geocoding: coordinates to address
  static async reverseGeocode(longitude, latitude) {
    if (!longitude || !latitude) {
      throw new Error('Longitude and Latitude are required for reverse geocoding.');
    }

    try {
      // Format: {longitude},{latitude}.json
      const url = `${MAPBOX_GEOCODING_API_BASE}${longitude},${latitude}.json`;
      const response = await axios.get(url, {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          types: 'address,place,locality,region', // Limit result types for more relevant address
          language: 'en',
          limit: 1, // Only need the top result
        },
      });

      if (response.data && response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const address = feature.place_name;
        const context = feature.context; // Contains components like city, state, country

        let city = '';
        let colony = ''; // Mapbox doesn't have a direct 'colony', might be 'place' or 'neighborhood'
        let state = '';
        let zipCode = '';
        let country = '';

        if (context) {
          context.forEach(component => {
            if (component.id.startsWith('place.')) city = component.text;
            else if (component.id.startsWith('locality.')) colony = component.text; // often neighborhood or locality
            else if (component.id.startsWith('region.')) state = component.text;
            else if (component.id.startsWith('postcode.')) zipCode = component.text;
            else if (component.id.startsWith('country.')) country = component.text;
          });
        }

        return {
          fullAddress: address,
          street: feature.address || '', // May or may not have a specific street number
          colony: colony || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          country: country || '',
          // Keep original coordinates
          latitude: latitude,
          longitude: longitude,
        };
      } else {
        return { fullAddress: 'Address not found', latitude, longitude };
      }
    } catch (error) {
      console.error('Error in Mapbox reverse geocoding:', error.response?.data || error.message);
      throw new Error('Failed to retrieve address for coordinates.');
    }
  }

  // Forward geocoding (address to coordinates) - useful for search input later
  static async forwardGeocode(addressQuery) {
    if (!addressQuery) {
      throw new Error('Address query is required for forward geocoding.');
    }

    try {
      const url = `${MAPBOX_GEOCODING_API_BASE}${encodeURIComponent(addressQuery)}.json`;
      const response = await axios.get(url, {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          language: 'en',
          limit: 1,
        },
      });

      if (response.data && response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const [longitude, latitude] = feature.center;
        return {
          latitude,
          longitude,
          fullAddress: feature.place_name,
        };
      } else {
        return null; // Address not found
      }
    } catch (error) {
      console.error('Error in Mapbox forward geocoding:', error.response?.data || error.message);
      throw new Error('Failed to geocode address.');
    }
  }
}

module.exports = MapboxService;