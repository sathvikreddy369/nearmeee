// src/components/maps/MapDisplay.jsx
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/MapDisplay.css';

// Initialize Mapbox token only once
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
if (MAPBOX_TOKEN && MAPBOX_TOKEN !== 'undefined') {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} else {
  console.warn('Mapbox access token is not configured');
}

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food & Beverage': return { icon: '🍽️', color: '#ff7a45' };
    case 'Retail': return { icon: '🛍️', color: '#5a9e2f' };
    case 'Services': return { icon: '🔧', color: '#3498db' };
    case 'Healthcare': return { icon: '🏥', color: '#e74c3c' };
    case 'Automotive': return { icon: '🚗', color: '#f1c40f' };
    case 'Education': return { icon: '📚', color: '#9b59b6' };
    default: return { icon: '📍', color: '#7f8c8d' };
  }
};

function MapDisplay({
  center = [78.486671, 17.385044],
  zoom = 10,
  vendors = [],
  routeGeoJSON = null,
  isInteractive = true,
  style = 'mapbox://styles/mapbox/streets-v11',
  onMarkerClick,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'undefined') {
      setMapError('Mapbox access token is not configured');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: center,
        zoom: zoom,
        interactive: isInteractive,
      });

      if (isInteractive) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }

      map.current.on('load', () => {
        setMapLoaded(true);
        setMapError(null);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please check your internet connection.');
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map.');
    }

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Clean up map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when vendors change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    vendors.forEach(vendor => {
      if (vendor.location?.latitude && vendor.location?.longitude) {
        const { icon, color } = getCategoryIcon(vendor.category);
        
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundColor = color;
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontSize = '16px';
        el.style.fontWeight = 'bold';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.innerHTML = icon;

        // Create popup content
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeOnClick: false 
        }).setHTML(`
          <div class="vendor-popup">
            <h6 class="fw-bold mb-1">${vendor.businessName}</h6>
            <p class="text-muted mb-1 small">${vendor.category}</p>
            ${vendor.description ? `<p class="mb-2 small">${vendor.description.substring(0, 100)}...</p>` : ''}
            <a href="/vendors/${vendor.id}" class="btn btn-sm btn-primary w-100">View Details</a>
          </div>
        `);

        // Create marker
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([vendor.location.longitude, vendor.location.latitude])
          .setPopup(popup)
          .addTo(map.current);

        // Add click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onMarkerClick) {
            onMarkerClick(vendor);
          }
        });

        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers if there are vendors
    if (vendors.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      vendors.forEach(vendor => {
        if (vendor.location?.latitude && vendor.location?.longitude) {
          bounds.extend([vendor.location.longitude, vendor.location.latitude]);
        }
      });
      
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
          duration: 1000
        });
      }
    }
  }, [vendors, mapLoaded, onMarkerClick]);

  // Handle route drawing
  useEffect(() => {
    if (!mapLoaded || !map.current || !routeGeoJSON) return;

    const mapInstance = map.current;
    const routeSourceId = 'route-source';
    const routeLayerId = 'route-layer';

    // Remove existing route
    if (mapInstance.getLayer(routeLayerId)) {
      mapInstance.removeLayer(routeLayerId);
    }
    if (mapInstance.getSource(routeSourceId)) {
      mapInstance.removeSource(routeSourceId);
    }

    // Add new route
    mapInstance.addSource(routeSourceId, {
      type: 'geojson',
      data: routeGeoJSON,
    });

    mapInstance.addLayer({
      id: routeLayerId,
      type: 'line',
      source: routeSourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });

    // Fit map to route bounds
    try {
      const coordinates = routeGeoJSON.geometry.coordinates;
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      mapInstance.fitBounds(bounds, { 
        padding: 50,
        duration: 1000 
      });
    } catch (error) {
      console.warn('Error fitting bounds to route:', error);
    }

    // Cleanup function for this effect
    return () => {
      if (mapInstance.getLayer(routeLayerId)) {
        mapInstance.removeLayer(routeLayerId);
      }
      if (mapInstance.getSource(routeSourceId)) {
        mapInstance.removeSource(routeSourceId);
      }
    };
  }, [routeGeoJSON, mapLoaded]);

  // Update center and zoom when props change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    map.current.setCenter(center);
    map.current.setZoom(zoom);
  }, [center, zoom, mapLoaded]);

  if (mapError) {
    return (
      <div className="map-error-container d-flex align-items-center justify-content-center">
        <div className="text-center text-muted">
          <i className="bi bi-map display-4 mb-3"></i>
          <p>{mapError}</p>
          <small>Please check your Mapbox configuration.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="map-display-container">
      <div ref={mapContainer} className="map-display" />
      {!mapLoaded && !mapError && (
        <div className="map-loading-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapDisplay;