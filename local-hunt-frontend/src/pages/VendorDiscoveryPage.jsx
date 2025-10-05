import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Spinner, 
  Alert, 
  InputGroup, 
  Card,
  Badge,
  Dropdown,
  Offcanvas
} from 'react-bootstrap'; 
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid, 
  Map, 
  X,
  Star,
  Clock,
  SlidersHorizontal,
  TrendingUp,
  Locate,
  RotateCcw,
  Eye,
  Navigation
} from 'lucide-react';
import VendorCard from '../components/vendors/VendorCard';
import MapDisplay from '../components/maps/MapDisplay';
import * as vendorApi from '../services/vendorApi';
import { useAuth } from '../contexts/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/VendorDiscoveryPage.css';

function VendorDiscoveryPage() {
  const { userProfile, loadingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [searchParams, setSearchParams] = useState({});
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColony, setSelectedColony] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);

  const [showMapView, setShowMapView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Categories for dropdown
  const categories = [
    'Beauty & Wellness', 'Food & Beverage', 'Retail', 'Services', 'Automotive', 
    'Healthcare', 'Education', 'Home Services', 'Other'
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First', icon: Clock },
    { value: 'averageRating', label: 'Highest Rated', icon: Star },
    { value: 'businessName', label: 'Name (A-Z)', icon: TrendingUp },
    { value: 'profileViews', label: 'Most Popular', icon: TrendingUp }
  ];

  const fetchVendors = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const fetchedVendors = await vendorApi.getAllVendors(params);
      setVendors(fetchedVendors || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch vendors.');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory) count++;
    if (selectedColony) count++;
    if (showOpenOnly) count++;
    if (minRating > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    setActiveFilters(count);
  }, [searchTerm, selectedCategory, selectedColony, showOpenOnly, minRating, priceRange]);

  useEffect(() => {
    if (!loadingAuth) {
      const initialParams = {
        search: searchTerm,
        category: selectedCategory,
        colony: selectedColony,
        isOpen: showOpenOnly ? true : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
        sortBy,
        sortOrder,
        ...searchParams
      };
      fetchVendors(initialParams);
    }
  }, [
    fetchVendors, loadingAuth, searchTerm, selectedCategory, selectedColony, 
    showOpenOnly, sortBy, sortOrder, searchParams, minRating, priceRange
  ]);

  // Handle initial search from homepage
  useEffect(() => {
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
    if (location.state?.useCurrentLocation) {
      handleNearbySearch();
    }
  }, [location.state]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ lat: undefined, lon: undefined });
  };

  const handleNearbySearch = () => {
    getPosition();
  };

  useEffect(() => {
    if (geoLoc.latitude && geoLoc.longitude) {
      setSearchTerm('Vendors near your location');
      setSearchParams({ lat: geoLoc.latitude, lon: geoLoc.longitude });
    }
  }, [geoLoc]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedColony('');
    setShowOpenOnly(false);
    setSortBy('createdAt');
    setSortOrder('desc');
    setMinRating(0);
    setPriceRange([0, 1000]);
    setSearchParams({});
    setShowFilters(false);
  };

  const handleGeocoderResult = ({ latitude, longitude, address }) => {
    setSearchTerm(address);
    setSearchParams({ lat: latitude, lon: longitude });
  };

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'category':
        setSelectedCategory('');
        break;
      case 'colony':
        setSelectedColony('');
        break;
      case 'openOnly':
        setShowOpenOnly(false);
        break;
      case 'rating':
        setMinRating(0);
        break;
      case 'price':
        setPriceRange([0, 1000]);
        break;
      default:
        break;
    }
  };

  const renderActiveFilters = () => {
    const filters = [];
    
    if (searchTerm) {
      filters.push(
        <Badge key="search" bg="primary" className="active-filters-badge">
          Search: {searchTerm}
          <X size={12} onClick={() => removeFilter('search')} />
        </Badge>
      );
    }
    
    if (selectedCategory) {
      filters.push(
        <Badge key="category" bg="secondary" className="active-filters-badge">
          Category: {selectedCategory}
          <X size={12} onClick={() => removeFilter('category')} />
        </Badge>
      );
    }
    
    if (selectedColony) {
      filters.push(
        <Badge key="colony" bg="info" className="active-filters-badge">
          Area: {selectedColony}
          <X size={12} onClick={() => removeFilter('colony')} />
        </Badge>
      );
    }
    
    if (showOpenOnly) {
      filters.push(
        <Badge key="open" bg="success" className="active-filters-badge">
          Open Now
          <X size={12} onClick={() => removeFilter('openOnly')} />
        </Badge>
      );
    }
    
    if (minRating > 0) {
      filters.push(
        <Badge key="rating" bg="warning" text="dark" className="active-filters-badge">
          Rating: {minRating}+
          <X size={12} onClick={() => removeFilter('rating')} />
        </Badge>
      );
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      filters.push(
        <Badge key="price" bg="dark" className="active-filters-badge">
          Price: ₹{priceRange[0]} - ₹{priceRange[1]}
          <X size={12} onClick={() => removeFilter('price')} />
        </Badge>
      );
    }

    return filters;
  };

  const handleViewDetails = (vendorId) => {
    navigate(`/vendors/${vendorId}`);
  };

  const handleGetDirections = (vendor) => {
    if (vendor.location?.latitude && vendor.location?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${vendor.location.latitude},${vendor.location.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (loadingAuth) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="vendor-discovery-page">
      <Container className="py-3 py-md-4">
        {/* Top Bar: Search and Filters */}
        <div className="discovery-top-bar">
          {/* Rounded Search Bar */}
          <div className="main-search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search for services or businesses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
          </div>

          {/* Horizontal Filter Buttons */}
          <div className="horizontal-filters">
            <button 
              className="filter-btn"
              onClick={() => setShowFilters(true)}
            >
              <Filter size={16} /> 
              <span>Filters</span>
              {activeFilters > 0 && (
                <span className="filter-count">{activeFilters}</span>
              )}
            </button>
            
            <button 
              className="filter-btn"
              onClick={handleNearbySearch}
              disabled={geoLoading}
            >
              <Locate size={16} /> 
              <span>{geoLoading ? 'Locating...' : 'Nearby'}</span>
            </button>
            
            <Dropdown className="category-dropdown">
              <Dropdown.Toggle className="filter-btn">
                <Grid size={16} /> 
                <span>Categories</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {categories.map(category => (
                  <Dropdown.Item 
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'active' : ''}
                  >
                    {category}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="active-filters-container">
              <div className="active-filters-header">
                <small className="text-muted fw-medium">Active Filters:</small>
                <button 
                  className="clear-all-btn"
                  onClick={handleClearFilters}
                >
                  <RotateCcw size={14} />
                  Clear All
                </button>
              </div>
              <div className="active-filters-list">
                {renderActiveFilters()}
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="results-header">
          <div className="results-info">
            <h2 className="results-title">Beauty Clinics in Mumbai</h2>
            <p className="results-count">
              {loading ? 'Searching...' : `${vendors.length} ${vendors.length === 1 ? 'Business' : 'Businesses'} Found`}
            </p>
          </div>
          
          <div className="results-controls">
            {/* Sort Dropdown */}
            <Dropdown className="sort-dropdown">
              <Dropdown.Toggle variant="outline-secondary">
                <Clock size={16} className="me-2" />
                <span>Sort by</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {sortOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <Dropdown.Item 
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className="d-flex align-items-center"
                    >
                      <Icon size={16} className="me-2" />
                      {option.label}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>

            {/* View Toggle */}
            <div className="view-toggle-group">
              <button
                className={`view-toggle-btn ${!showMapView ? 'active' : ''}`}
                onClick={() => setShowMapView(false)}
              >
                <Grid size={16} />
                <span>Grid</span>
              </button>
              <button
                className={`view-toggle-btn ${showMapView ? 'active' : ''}`}
                onClick={() => setShowMapView(true)}
              >
                <Map size={16} />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted">Finding the best businesses for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="danger" className="error-alert">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">{error}</div>
              <Button variant="outline-danger" size="sm" onClick={() => fetchVendors(searchParams)}>
                Try Again
              </Button>
            </div>
          </Alert>
        )}

        {/* Empty State */}
        {!loading && vendors.length === 0 && !error && (
          <Card className="empty-state-card">
            <Card.Body className="empty-state">
              <Search size={48} className="empty-state-icon mb-3" />
              <h5 className="text-muted">No businesses found</h5>
              <p className="text-muted mb-3">
                Try adjusting your search criteria or explore different categories.
              </p>
              <Button variant="primary" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </Card.Body>
          </Card>
        )}

        {/* Results */}
        {!loading && !error && vendors.length > 0 && (
          showMapView ? (
            <Card className="map-view-card">
              <Card.Body className="p-0">
                <div className="map-view-container">
                  <MapDisplay
                    center={userProfile?.location ? 
                      [userProfile.location.longitude, userProfile.location.latitude] : 
                      [78.486671, 17.385044]
                    }
                    zoom={userProfile?.location ? 12 : 10}
                    vendors={vendors}
                    showGeocoder={true}
                    onGeocoderResult={handleGeocoderResult}
                    isInteractive={true}
                    height="100%"
                  />
                </div>
              </Card.Body>
            </Card>
          ) : (
            <div className="vendor-results">
              <div className="vendor-grid">
                {vendors.map((vendor, index) => (
                  <div key={vendor.id} className="vendor-card-wrapper">
                    <VendorCard 
                      vendor={vendor} 
                      onViewDetails={handleViewDetails}
                      onGetDirections={handleGetDirections}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </Container>

      {/* Filters Offcanvas */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end" className="filters-offcanvas">
        <Offcanvas.Header closeButton className="offcanvas-header-custom">
          <Offcanvas.Title className="d-flex align-items-center">
            <SlidersHorizontal size={20} className="me-2" />
            Filters & Categories
            {activeFilters > 0 && (
              <Badge bg="primary" pill className="ms-2">
                {activeFilters}
              </Badge>
            )}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="filters-content">
            <div className="filters-sections">
              {/* Category Filter */}
              <div className="filter-section">
                <label className="filter-label">Category</label>
                <Form.Select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </div>

              {/* Location Filter */}
              <div className="filter-section">
                <label className="filter-label">Location Area</label>
                <Form.Control
                  type="text"
                  placeholder="Enter colony or neighborhood"
                  value={selectedColony}
                  onChange={(e) => setSelectedColony(e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Open Now Filter */}
              <div className="filter-section">
                <div className="filter-switch">
                  <Form.Check
                    type="switch"
                    label="Open Now Only"
                    checked={showOpenOnly}
                    onChange={(e) => setShowOpenOnly(e.target.checked)}
                    className="fw-medium"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="filter-section">
                <label className="filter-label">Minimum Rating</label>
                <Form.Select 
                  value={minRating} 
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="filter-select"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={1}>1+ Star</option>
                </Form.Select>
              </div>

              {/* Price Range Filter */}
              <div className="filter-section">
                <label className="filter-label">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="price-range-container">
                  <Form.Range
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="price-range-slider"
                  />
                  <div className="price-range-labels">
                    <span className="price-range-label">₹0</span>
                    <span className="price-range-label">₹1000+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="filter-actions">
              <div className="action-buttons">
                <Button variant="primary" onClick={() => setShowFilters(false)} className="apply-filters-btn">
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" onClick={handleClearFilters} className="clear-filters-btn">
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default VendorDiscoveryPage;