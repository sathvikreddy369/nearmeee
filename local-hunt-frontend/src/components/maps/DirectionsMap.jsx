// src/components/maps/DirectionsMap.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Modal, Button, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { getRouteInstructions } from '../../services/mapService';

// Initialize Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
if (MAPBOX_TOKEN && MAPBOX_TOKEN !== 'undefined') {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

function DirectionsMap({
  userLocation,
  vendorLocation,
  vendorName = 'Destination',
  travelMode = 'driving',
  show = false,
  onClose,
  onRouteCalculated,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create custom marker
  const createMarker = useCallback((color, label, content) => {
    const el = document.createElement('div');
    el.className = 'custom-directions-marker';
    el.style.backgroundColor = color;
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.color = 'white';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '12px';
    el.textContent = label;
    
    const marker = new mapboxgl.Marker({ element: el })
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(content));
    
    return marker;
  }, []);

  // Calculate route using Mapbox Directions API
  const calculateRoute = useCallback(async () => {
    if (!userLocation || !vendorLocation || !map.current) return;

    setLoading(true);
    setError(null);
    setRouteInfo(null);
    setRouteInstructions([]);

    try {
      const start = [userLocation.longitude, userLocation.latitude];
      const end = [vendorLocation.longitude, vendorLocation.latitude];

      // Import the getDirections function
      const { getDirections } = await import('../../services/mapService');
      
      const routeData = await getDirections(start, end, travelMode);

      if (routeData) {
        const routeGeoJSON = {
          type: 'Feature',
          geometry: routeData.geometry
        };

        // Draw route on map
        const mapInstance = map.current;
        
        // Remove existing route layers
        if (mapInstance.getSource('route')) {
          mapInstance.removeSource('route');
        }
        if (mapInstance.getLayer('route')) {
          mapInstance.removeLayer('route');
        }

        // Add route source and layer
        mapInstance.addSource('route', {
          type: 'geojson',
          data: routeGeoJSON,
        });

        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
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

        // Add start and end markers
        const startMarker = createMarker(
          '#28a745', 
          'A', 
          `<div class="p-2">
            <strong>Your Location</strong><br>
            <small>Start point</small>
          </div>`
        ).setLngLat(start).addTo(mapInstance);

        const endMarker = createMarker(
          '#dc3545', 
          'B', 
          `<div class="p-2">
            <strong>${vendorName}</strong><br>
            <small>Destination</small>
          </div>`
        ).setLngLat(end).addTo(mapInstance);

        // Fit map to route
        const coordinates = routeData.geometry.coordinates;
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        mapInstance.fitBounds(bounds, { 
          padding: 50,
          duration: 1000 
        });

        // Set route info and instructions
        const routeInfoData = {
          distance: (routeData.distance / 1000).toFixed(1), // km
          duration: Math.round(routeData.duration / 60), // minutes
          mode: travelMode,
          rawDistance: routeData.distance,
          rawDuration: routeData.duration
        };
        
        setRouteInfo(routeInfoData);
        setRouteInstructions(getRouteInstructions(routeData.steps));

        if (onRouteCalculated) {
          onRouteCalculated(routeInfoData);
        }
      } else {
        throw new Error('No route found');
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      setError(err.message || 'Could not calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userLocation, vendorLocation, vendorName, travelMode, createMarker, onRouteCalculated]);

  // Initialize map when modal opens
  useEffect(() => {
    if (!show || !mapContainer.current || !MAPBOX_TOKEN) return;

    // Clean up previous map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: vendorLocation ? 
          [vendorLocation.longitude, vendorLocation.latitude] : 
          [78.4867, 17.3850],
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        setError(null);
      });

      map.current.on('error', () => {
        setError('Failed to load map');
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
      setRouteInfo(null);
      setRouteInstructions([]);
      setError(null);
    };
  }, [show, vendorLocation]);

  // Calculate route when map is loaded and locations are available
  useEffect(() => {
    if (mapLoaded && userLocation && vendorLocation) {
      calculateRoute();
    }
  }, [mapLoaded, userLocation, vendorLocation, calculateRoute]);

  const formatDuration = (minutes) => {
    if (!minutes) return 'Unknown';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleOpenInMapbox = () => {
    if (!userLocation || !vendorLocation) return;
    
    const start = [userLocation.longitude, userLocation.latitude];
    const end = [vendorLocation.longitude, vendorLocation.latitude];
    
    const { openMapboxDirections } = require('../../services/mapService');
    openMapboxDirections(start, end, travelMode);
  };

  if (!show) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="border-bottom-0">
        <Modal.Title className="d-flex align-items-center">
          <i className="bi bi-geo-alt-fill text-primary me-2"></i>
          Directions to {vendorName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {error && (
          <Alert variant="warning" className="m-3 mb-0">
            <Alert.Heading className="h6">Directions Unavailable</Alert.Heading>
            <p className="mb-2 small">{error}</p>
            <Button 
              variant="outline-warning" 
              size="sm" 
              onClick={calculateRoute}
              disabled={loading}
            >
              {loading ? 'Calculating...' : 'Retry'}
            </Button>
          </Alert>
        )}

        {/* Route Summary */}
        {routeInfo && (
          <div className="p-3 bg-light border-bottom">
            <div className="row text-center">
              <div className="col">
                <div className="text-primary fw-bold fs-4">{routeInfo.distance} km</div>
                <small className="text-muted">Distance</small>
              </div>
              <div className="col">
                <div className="text-primary fw-bold fs-4">{formatDuration(routeInfo.duration)}</div>
                <small className="text-muted">Duration</small>
              </div>
              <div className="col">
                <div className="text-primary fw-bold fs-4 text-capitalize">{routeInfo.mode}</div>
                <small className="text-muted">Mode</small>
              </div>
            </div>
          </div>
        )}

        <div className="row g-0">
          {/* Map Column */}
          <div className="col-md-7">
            <div className="directions-map-container position-relative">
              <div 
                ref={mapContainer} 
                style={{ 
                  width: '100%', 
                  height: '400px',
                }} 
              />
              
              {(loading || !mapLoaded) && !error && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-2 small text-muted">
                      {loading ? 'Calculating route...' : 'Loading map...'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions Column */}
          <div className="col-md-5">
            <div className="p-3 instructions-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <h6 className="mb-3">Turn-by-Turn Directions</h6>
              
              {routeInstructions.length > 0 ? (
                <ListGroup variant="flush">
                  {routeInstructions.map((instruction, index) => (
                    <ListGroup.Item key={index} className="px-0 py-2 border-0">
                      <div className="d-flex align-items-start">
                        <Badge bg="primary" className="me-2 mt-1">{instruction.step}</Badge>
                        <div className="flex-grow-1">
                          <div className="small fw-medium">{instruction.instruction}</div>
                          <div className="text-muted extra-small">
                            {instruction.distance} • {instruction.duration}
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-signpost-split display-6 d-block mb-2"></i>
                  <small>Route instructions will appear here</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-top-0">
        <Button variant="outline-secondary" onClick={onClose}>
          Close
        </Button>
        
        <Button 
          variant="outline-primary"
          onClick={handleOpenInMapbox}
          disabled={!routeInfo}
        >
          <i className="bi bi-box-arrow-up-right me-2"></i>
          Open in Mapbox
        </Button>
        
        <Button 
          variant="primary"
          onClick={calculateRoute}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner as="span" size="sm" animation="border" className="me-2" />
              Recalculating...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Recalculate
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DirectionsMap;