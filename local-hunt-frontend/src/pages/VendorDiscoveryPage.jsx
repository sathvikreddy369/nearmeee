// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Container, 
//   Row, 
//   Col, 
//   Form, 
//   Button, 
//   Spinner, 
//   Alert, 
//   InputGroup, 
//   Card,
//   Badge,
//   Dropdown,
//   Offcanvas
// } from 'react-bootstrap';
// import { 
//   Search, 
//   MapPin, 
//   Filter, 
//   Grid, 
//   Map, 
//   Navigation, 
//   X,
//   Star,
//   Clock,
//   SlidersHorizontal,
//   TrendingUp
// } from 'lucide-react';
// import VendorCard from '../components/vendors/VendorCard';
// import MapDisplay from '../components/maps/MapDisplay';
// import * as vendorApi from '../services/vendorApi';
// import { useAuth } from '../contexts/AuthContext';
// import useGeolocation from '../hooks/useGeolocation';
// import { useLocation } from 'react-router-dom';

// function VendorDiscoveryPage() {
//   const { userProfile, loadingAuth } = useAuth();
//   const location = useLocation();
//   const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Search & Filter States
//   const [searchParams, setSearchParams] = useState({});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedColony, setSelectedColony] = useState('');
//   const [showOpenOnly, setShowOpenOnly] = useState(false);
//   const [sortBy, setSortBy] = useState('createdAt');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [priceRange, setPriceRange] = useState([0, 1000]);
//   const [minRating, setMinRating] = useState(0);

//   const [showMapView, setShowMapView] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [activeFilters, setActiveFilters] = useState(0);

//   // Categories for dropdown
//   const categories = [
//     'Food & Beverage', 'Retail', 'Services', 'Automotive', 
//     'Healthcare', 'Education', 'Home Services', 'Beauty & Wellness', 'Other'
//   ];

//   const sortOptions = [
//     { value: 'createdAt', label: 'Newest First', icon: Clock },
//     { value: 'averageRating', label: 'Highest Rated', icon: Star },
//     { value: 'businessName', label: 'Name (A-Z)', icon: TrendingUp },
//     { value: 'profileViews', label: 'Most Popular', icon: TrendingUp }
//   ];

//   const fetchVendors = useCallback(async (params) => {
//     setLoading(true);
//     setError('');
//     try {
//       const fetchedVendors = await vendorApi.getAllVendors(params);
//       setVendors(fetchedVendors);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch vendors.');
//       console.error('Error fetching vendors:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Calculate active filters count
//   useEffect(() => {
//     let count = 0;
//     if (searchTerm) count++;
//     if (selectedCategory) count++;
//     if (selectedColony) count++;
//     if (showOpenOnly) count++;
//     if (minRating > 0) count++;
//     if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
//     setActiveFilters(count);
//   }, [searchTerm, selectedCategory, selectedColony, showOpenOnly, minRating, priceRange]);

//   useEffect(() => {
//     if (!loadingAuth) {
//       const initialParams = {
//         search: searchTerm,
//         category: selectedCategory,
//         colony: selectedColony,
//         isOpen: showOpenOnly ? true : undefined,
//         minRating: minRating > 0 ? minRating : undefined,
//         minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
//         maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
//         sortBy,
//         sortOrder,
//         ...searchParams
//       };
//       fetchVendors(initialParams);
//     }
//   }, [
//     fetchVendors, loadingAuth, searchTerm, selectedCategory, selectedColony, 
//     showOpenOnly, sortBy, sortOrder, searchParams, minRating, priceRange
//   ]);

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setSearchParams({ lat: undefined, lon: undefined });
//   };

//   const handleNearbySearch = () => {
//     getPosition();
//   };

//   useEffect(() => {
//     if (geoLoc.latitude && geoLoc.longitude) {
//       setSearchTerm('Vendors near your location');
//       setSearchParams({ lat: geoLoc.latitude, lon: geoLoc.longitude });
//     }
//   }, [geoLoc]);

//   const handleClearFilters = () => {
//     setSearchTerm('');
//     setSelectedCategory('');
//     setSelectedColony('');
//     setShowOpenOnly(false);
//     setSortBy('createdAt');
//     setSortOrder('desc');
//     setMinRating(0);
//     setPriceRange([0, 1000]);
//     setSearchParams({});
//     setShowFilters(false);
//   };

//   const handleGeocoderResult = ({ latitude, longitude, address }) => {
//     setSearchTerm(address);
//     setSearchParams({ lat: latitude, lon: longitude });
//   };

//   const removeFilter = (filterType) => {
//     switch (filterType) {
//       case 'search':
//         setSearchTerm('');
//         break;
//       case 'category':
//         setSelectedCategory('');
//         break;
//       case 'colony':
//         setSelectedColony('');
//         break;
//       case 'openOnly':
//         setShowOpenOnly(false);
//         break;
//       case 'rating':
//         setMinRating(0);
//         break;
//       case 'price':
//         setPriceRange([0, 1000]);
//         break;
//       default:
//         break;
//     }
//   };

//   const renderActiveFilters = () => {
//     const filters = [];
    
//     if (searchTerm) {
//       filters.push(
//         <Badge key="search" bg="primary" className="me-2 mb-2 d-inline-flex align-items-center">
//           Search: {searchTerm}
//           <X size={12} className="ms-1 cursor-pointer" onClick={() => removeFilter('search')} />
//         </Badge>
//       );
//     }
    
//     if (selectedCategory) {
//       filters.push(
//         <Badge key="category" bg="secondary" className="me-2 mb-2 d-inline-flex align-items-center">
//           Category: {selectedCategory}
//           <X size={12} className="ms-1 cursor-pointer" onClick={() => removeFilter('category')} />
//         </Badge>
//       );
//     }
    
//     if (selectedColony) {
//       filters.push(
//         <Badge key="colony" bg="info" className="me-2 mb-2 d-inline-flex align-items-center">
//           Area: {selectedColony}
//           <X size={12} className="ms-1 cursor-pointer" onClick={() => removeFilter('colony')} />
//         </Badge>
//       );
//     }
    
//     if (showOpenOnly) {
//       filters.push(
//         <Badge key="open" bg="success" className="me-2 mb-2 d-inline-flex align-items-center">
//           Open Now
//           <X size={12} className="ms-1 cursor-pointer" onClick={() => removeFilter('openOnly')} />
//         </Badge>
//       );
//     }
    
//     if (minRating > 0) {
//       filters.push(
//         <Badge key="rating" bg="warning" className="me-2 mb-2 d-inline-flex align-items-center">
//           Rating: {minRating}+
//           <X size={12} className="ms-1 cursor-pointer" onClick={() => removeFilter('rating')} />
//         </Badge>
//       );
//     }
    
//     if (priceRange[0] > 0 || priceRange[1] < 1000) {
//       filters.push(
//         <Badge key="price" bg="dark" className="me-2 mb-2 d-inline-flex align-items-center">
//           Price: ₹{priceRange[0]} - ₹{priceRange[1]}
//           <X size={12} className="ms-1 cursor-pointer" onClick={() => removeFilter('price')} />
//         </Badge>
//       );
//     }

//     return filters;
//   };

//   if (loadingAuth) {
//     return (
//       <Container className="d-flex justify-content-center align-items-center min-vh-100">
//         <div className="text-center">
//           <Spinner animation="border" variant="primary" />
//           <p className="mt-2 text-muted">Loading...</p>
//         </div>
//       </Container>
//     );
//   }

//   return (
//     <>
//       <Container className="vendor-discovery-page py-4">
//         {/* Header Section */}
//         <Row className="mb-4">
//           <Col>
//             <div className="text-center">
//               <h1 className="display-5 fw-bold text-dark mb-3">
//                 Discover Local Businesses
//               </h1>
//               <p className="lead text-muted mb-0">
//                 Find the best services and vendors in your area
//               </p>
//             </div>
//           </Col>
//         </Row>

//         {/* Search Card */}
//         <Card className="border-0 shadow-sm mb-4">
//           <Card.Body className="p-4">
//             <Form onSubmit={handleSearchSubmit}>
//               <Row className="g-3 align-items-end">
//                 {/* Search Input */}
//                 <Col lg={6} md={8}>
//                   <Form.Label className="fw-medium mb-2">What are you looking for?</Form.Label>
//                   <InputGroup size="lg">
//                     <InputGroup.Text className="bg-white border-end-0">
//                       <Search size={20} className="text-muted" />
//                     </InputGroup.Text>
//                     <Form.Control
//                       type="text"
//                       placeholder="Search businesses, services, or categories..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="border-start-0"
//                     />
//                     <Button 
//                       variant="primary" 
//                       type="submit"
//                       className="d-flex align-items-center"
//                     >
//                       <Search size={18} className="me-1 d-none d-sm-inline" />
//                       Search
//                     </Button>
//                   </InputGroup>
//                 </Col>

//                 {/* Category Filter */}
//                 <Col lg={3} md={4}>
//                   <Form.Label className="fw-medium mb-2">Category</Form.Label>
//                   <Form.Select 
//                     value={selectedCategory} 
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     size="lg"
//                   >
//                     <option value="">All Categories</option>
//                     {categories.map(cat => (
//                       <option key={cat} value={cat}>{cat}</option>
//                     ))}
//                   </Form.Select>
//                 </Col>

//                 {/* Action Buttons */}
//                 <Col lg={3} className="d-flex gap-2">
//                   <Button
//                     variant="outline-primary"
//                     onClick={handleNearbySearch}
//                     disabled={geoLoading}
//                     className="d-flex align-items-center flex-grow-1"
//                     size="lg"
//                   >
//                     <Navigation size={18} className="me-2" />
//                     {geoLoading ? 'Locating...' : 'Nearby'}
//                   </Button>
                  
//                   <Button
//                     variant="outline-secondary"
//                     onClick={() => setShowFilters(true)}
//                     className="d-flex align-items-center"
//                     size="lg"
//                   >
//                     <Filter size={18} className="me-1" />
//                     {activeFilters > 0 && (
//                       <Badge bg="primary" pill className="ms-1">
//                         {activeFilters}
//                       </Badge>
//                     )}
//                   </Button>
//                 </Col>
//               </Row>

//               {/* Active Filters */}
//               {activeFilters > 0 && (
//                 <div className="mt-3 pt-3 border-top">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <small className="text-muted fw-medium">Active Filters:</small>
//                     <Button 
//                       variant="link" 
//                       size="sm" 
//                       onClick={handleClearFilters}
//                       className="text-decoration-none p-0"
//                     >
//                       Clear All
//                     </Button>
//                   </div>
//                   <div className="d-flex flex-wrap">
//                     {renderActiveFilters()}
//                   </div>
//                 </div>
//               )}
//             </Form>
//           </Card.Body>
//         </Card>

//         {/* Results Header */}
//         <Row className="mb-4 align-items-center">
//           <Col md={6}>
//             <h5 className="fw-bold text-dark mb-0">
//               {vendors.length} {vendors.length === 1 ? 'Business' : 'Businesses'} Found
//             </h5>
//             {searchTerm && (
//               <p className="text-muted mb-0 small">Search results for "{searchTerm}"</p>
//             )}
//           </Col>
          
//           <Col md={6} className="text-md-end">
//             <div className="d-flex align-items-center justify-content-md-end gap-3">
//               {/* Sort Dropdown */}
//               <Dropdown>
//                 <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center">
//                   <Clock size={16} className="me-2" />
//                   {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort By'}
//                 </Dropdown.Toggle>
//                 <Dropdown.Menu>
//                   {sortOptions.map(option => {
//                     const Icon = option.icon;
//                     return (
//                       <Dropdown.Item 
//                         key={option.value}
//                         onClick={() => setSortBy(option.value)}
//                         className="d-flex align-items-center"
//                       >
//                         <Icon size={16} className="me-2" />
//                         {option.label}
//                       </Dropdown.Item>
//                     );
//                   })}
//                 </Dropdown.Menu>
//               </Dropdown>

//               {/* View Toggle */}
//               <div className="btn-group" role="group">
//                 <Button
//                   variant={!showMapView ? 'primary' : 'outline-primary'}
//                   onClick={() => setShowMapView(false)}
//                   className="d-flex align-items-center"
//                 >
//                   <Grid size={16} className="me-1" />
//                   <span className="d-none d-sm-inline">Grid</span>
//                 </Button>
//                 <Button
//                   variant={showMapView ? 'primary' : 'outline-primary'}
//                   onClick={() => setShowMapView(true)}
//                   className="d-flex align-items-center"
//                 >
//                   <Map size={16} className="me-1" />
//                   <span className="d-none d-sm-inline">Map</span>
//                 </Button>
//               </div>
//             </div>
//           </Col>
//         </Row>

//         {/* Loading State */}
//         {loading && (
//           <div className="text-center py-5">
//             <Spinner animation="border" variant="primary" />
//             <p className="mt-2 text-muted">Finding the best businesses for you...</p>
//           </div>
//         )}

//         {/* Error State */}
//         {error && (
//           <Alert variant="danger" className="border-0 shadow-sm">
//             <div className="d-flex align-items-center">
//               <div className="flex-grow-1">{error}</div>
//               <Button variant="outline-danger" size="sm" onClick={() => fetchVendors(searchParams)}>
//                 Try Again
//               </Button>
//             </div>
//           </Alert>
//         )}

//         {/* Empty State */}
//         {!loading && vendors.length === 0 && !error && (
//           <Card className="border-0 shadow-sm text-center">
//             <Card.Body className="py-5">
//               <Search size={48} className="text-muted mb-3" />
//               <h5 className="text-muted">No businesses found</h5>
//               <p className="text-muted mb-3">
//                 Try adjusting your search criteria or explore different categories.
//               </p>
//               <Button variant="primary" onClick={handleClearFilters}>
//                 Clear All Filters
//               </Button>
//             </Card.Body>
//           </Card>
//         )}

//         {/* Results */}
//         {!loading && !error && vendors.length > 0 && (
//           showMapView ? (
//             <Card className="border-0 shadow-sm">
//               <Card.Body className="p-0">
//                 <div className="map-view-container" style={{ height: '60vh', minHeight: '500px' }}>
//                   <MapDisplay
//                     center={userProfile?.location ? 
//                       [userProfile.location.longitude, userProfile.location.latitude] : 
//                       [78.486671, 17.385044]
//                     }
//                     zoom={userProfile?.location ? 12 : 10}
//                     vendors={vendors}
//                     showGeocoder={true}
//                     onGeocoderResult={handleGeocoderResult}
//                     isInteractive={true}
//                     height="100%"
//                   />
//                 </div>
//               </Card.Body>
//             </Card>
//           ) : (
//             <Row xs={1} md={2} xl={3} className="g-4">
//               {vendors.map((vendor) => (
//                 <Col key={vendor.id}>
//                   <VendorCard vendor={vendor} />
//                 </Col>
//               ))}
//             </Row>
//           )
//         )}
//       </Container>

//       {/* Filters Offcanvas */}
//       <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end">
//         <Offcanvas.Header closeButton className="border-bottom">
//           <Offcanvas.Title className="d-flex align-items-center">
//             <SlidersHorizontal size={20} className="me-2" />
//             Filters
//             {activeFilters > 0 && (
//               <Badge bg="primary" pill className="ms-2">
//                 {activeFilters}
//               </Badge>
//             )}
//           </Offcanvas.Title>
//         </Offcanvas.Header>
//         <Offcanvas.Body>
//           <div className="d-flex flex-column h-100">
//             <div className="flex-grow-1">
//               {/* Location Filter */}
//               <Form.Group className="mb-4">
//                 <Form.Label className="fw-medium">Location Area</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter colony or neighborhood"
//                   value={selectedColony}
//                   onChange={(e) => setSelectedColony(e.target.value)}
//                 />
//               </Form.Group>

//               {/* Open Now Filter */}
//               <Form.Group className="mb-4">
//                 <Form.Check
//                   type="switch"
//                   label="Open Now Only"
//                   checked={showOpenOnly}
//                   onChange={(e) => setShowOpenOnly(e.target.checked)}
//                   className="fw-medium"
//                 />
//               </Form.Group>

//               {/* Rating Filter */}
//               <Form.Group className="mb-4">
//                 <Form.Label className="fw-medium">Minimum Rating</Form.Label>
//                 <Form.Select 
//                   value={minRating} 
//                   onChange={(e) => setMinRating(Number(e.target.value))}
//                 >
//                   <option value={0}>Any Rating</option>
//                   <option value={4}>4+ Stars</option>
//                   <option value={3}>3+ Stars</option>
//                   <option value={2}>2+ Stars</option>
//                   <option value={1}>1+ Star</option>
//                 </Form.Select>
//               </Form.Group>

//               {/* Price Range Filter */}
//               <Form.Group className="mb-4">
//                 <Form.Label className="fw-medium">
//                   Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
//                 </Form.Label>
//                 <Form.Range
//                   min={0}
//                   max={1000}
//                   step={10}
//                   value={priceRange[1]}
//                   onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
//                 />
//                 <div className="d-flex justify-content-between">
//                   <small className="text-muted">₹0</small>
//                   <small className="text-muted">₹1000+</small>
//                 </div>
//               </Form.Group>
//             </div>

//             {/* Action Buttons */}
//             <div className="border-top pt-3">
//               <div className="d-grid gap-2">
//                 <Button variant="primary" onClick={() => setShowFilters(false)}>
//                   Apply Filters
//                 </Button>
//                 <Button variant="outline-secondary" onClick={handleClearFilters}>
//                   Clear All Filters
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </Offcanvas.Body>
//       </Offcanvas>

//       <style jsx>{`
//         .vendor-discovery-page {
//           max-width: 1400px;
//         }
        
//         .map-view-container {
//           border-radius: 12px;
//           overflow: hidden;
//         }
        
//         .cursor-pointer {
//           cursor: pointer;
//         }
        
//         @media (max-width: 768px) {
//           .vendor-discovery-page {
//             padding-left: 12px;
//             padding-right: 12px;
//           }
//         }
//       `}</style>
//     </>
//   );
// }

// export default VendorDiscoveryPage;

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
  Navigation, 
  X,
  Star,
  Clock,
  SlidersHorizontal,
  TrendingUp,
  Locate,
  RotateCcw
} from 'lucide-react';
import VendorCard from '../components/vendors/VendorCard';
import MapDisplay from '../components/maps/MapDisplay';
import * as vendorApi from '../services/vendorApi';
import { useAuth } from '../contexts/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import { useLocation } from 'react-router-dom';
import '../styles/VendorDiscoveryPage.css';

function VendorDiscoveryPage() {
  const { userProfile, loadingAuth } = useAuth();
  const location = useLocation();
  const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [searchParams, setSearchParams] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
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
    'Food & Beverage', 'Retail', 'Services', 'Automotive', 
    'Healthcare', 'Education', 'Home Services', 'Beauty & Wellness', 'Other'
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
      setVendors(fetchedVendors);
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
    <>
      <Container className="vendor-discovery-page py-3 py-md-4">
        {/* Header Section */}
        <div className="discovery-header">
          <h1 className="discovery-title display-6 display-md-5 fw-bold">
            Discover Local Businesses
          </h1>
          <p className="lead text-muted mb-0 d-none d-md-block">
            Find the best services and vendors in your area
          </p>
          <p className="text-muted mb-0 d-md-none">
            Find local services near you
          </p>
        </div>

        {/* Search Card */}
        <Card className="search-card">
          <Card.Body className="search-card-body">
            <Form onSubmit={handleSearchSubmit}>
              <Row className="g-3 align-items-end">
                {/* Search Input */}
                <Col xs={12} lg={6} xl={5}>
                  <Form.Label className="fw-medium mb-2">What are you looking for?</Form.Label>
                  <InputGroup size="lg" className="search-input-group">
                    <InputGroup.Text className="bg-white border-end-0 search-icon">
                      <Search size={20} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search businesses, services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-start-0"
                    />
                    <Button 
                      variant="primary" 
                      type="submit"
                      className="search-button d-none d-sm-flex align-items-center"
                    >
                      <Search size={18} className="me-1" />
                      Search
                    </Button>
                  </InputGroup>
                  {/* Mobile Search Button */}
                  <Button 
                    variant="primary" 
                    type="submit"
                    className="w-100 mt-2 d-sm-none"
                  >
                    <Search size={18} className="me-2" />
                    Search
                  </Button>
                </Col>

                {/* Category Filter */}
                <Col xs={12} sm={6} lg={3} xl={3}>
                  <Form.Label className="fw-medium mb-2">Category</Form.Label>
                  <Form.Select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    size="lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Col>

                {/* Action Buttons */}
                <Col xs={12} sm={6} lg={3} xl={4}>
                  <div className="filter-controls h-100">
                    <Button
                      variant="outline-primary"
                      onClick={handleNearbySearch}
                      disabled={geoLoading}
                      className="filter-button flex-grow-1"
                      size="lg"
                    >
                      <Locate size={18} className="me-1" />
                      <span className="d-none d-md-inline">
                        {geoLoading ? 'Locating...' : 'Nearby'}
                      </span>
                      <span className="d-md-none">
                        {geoLoading ? '...' : 'Nearby'}
                      </span>
                    </Button>
                    
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowFilters(true)}
                      className="filter-button position-relative"
                      size="lg"
                    >
                      <Filter size={18} className="me-1" />
                      <span className="d-none d-md-inline">Filters</span>
                      {activeFilters > 0 && (
                        <Badge bg="primary" pill className="position-absolute top-0 start-100 translate-middle">
                          {activeFilters}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Active Filters */}
              {activeFilters > 0 && (
                <div className="active-filters-container">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted fw-medium">Active Filters:</small>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={handleClearFilters}
                      className="text-decoration-none p-0 d-flex align-items-center"
                    >
                      <RotateCcw size={14} className="me-1" />
                      Clear All
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap">
                    {renderActiveFilters()}
                  </div>
                </div>
              )}
            </Form>
          </Card.Body>
        </Card>

        {/* Results Header */}
        <div className="results-header">
          <div>
            <h5 className="results-count">
              {vendors.length} {vendors.length === 1 ? 'Business' : 'Businesses'} Found
            </h5>
            {searchTerm && (
              <p className="text-muted mb-0 small">Search results for "{searchTerm}"</p>
            )}
          </div>
          
          <div className="results-controls">
            {/* Sort Dropdown */}
            <Dropdown className="sort-dropdown">
              <Dropdown.Toggle variant="outline-secondary" className="w-100">
                <Clock size={16} className="me-2" />
                <span className="d-none d-sm-inline">
                  {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort By'}
                </span>
                <span className="d-sm-none">Sort</span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
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
            <div className="view-toggle-group" role="group">
              <Button
                variant={!showMapView ? 'primary' : 'outline-primary'}
                onClick={() => setShowMapView(false)}
                className={`view-toggle-button ${!showMapView ? 'active' : ''}`}
              >
                <Grid size={16} className="me-1" />
                <span className="d-none d-sm-inline">Grid</span>
              </Button>
              <Button
                variant={showMapView ? 'primary' : 'outline-primary'}
                onClick={() => setShowMapView(true)}
                className={`view-toggle-button ${showMapView ? 'active' : ''}`}
              >
                <Map size={16} className="me-1" />
                <span className="d-none d-sm-inline">Map</span>
              </Button>
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
          <Alert variant="danger" className="border-0 shadow-soft">
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
          <Card className="border-0 shadow-soft text-center">
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
            <Card className="border-0 shadow-soft">
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
            <div className="vendor-grid">
              {vendors.map((vendor, index) => (
                <div key={vendor.id} className="vendor-card-animation" style={{ animationDelay: `${index * 0.1}s` }}>
                  <VendorCard vendor={vendor} />
                </div>
              ))}
            </div>
          )
        )}
      </Container>

      {/* Filters Offcanvas */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end" className="filters-offcanvas">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="d-flex align-items-center">
            <SlidersHorizontal size={20} className="me-2" />
            Filters
            {activeFilters > 0 && (
              <Badge bg="primary" pill className="ms-2">
                {activeFilters}
              </Badge>
            )}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column h-100">
            <div className="flex-grow-1">
              {/* Location Filter */}
              <div className="filter-section">
                <label className="filter-label">Location Area</label>
                <Form.Control
                  type="text"
                  placeholder="Enter colony or neighborhood"
                  value={selectedColony}
                  onChange={(e) => setSelectedColony(e.target.value)}
                  size="lg"
                />
              </div>

              {/* Open Now Filter */}
              <div className="filter-section">
                <Form.Check
                  type="switch"
                  label="Open Now Only"
                  checked={showOpenOnly}
                  onChange={(e) => setShowOpenOnly(e.target.checked)}
                  className="fw-medium"
                />
              </div>

              {/* Rating Filter */}
              <div className="filter-section">
                <label className="filter-label">Minimum Rating</label>
                <Form.Select 
                  value={minRating} 
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  size="lg"
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
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={() => setShowFilters(false)} size="lg">
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" onClick={handleClearFilters} size="lg">
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default VendorDiscoveryPage;