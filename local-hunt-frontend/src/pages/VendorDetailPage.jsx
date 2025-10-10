import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Spinner, 
  Alert, 
  ListGroup, 
  Badge, 
  Carousel, 
  Button, 
  Modal,
  Dropdown
} from 'react-bootstrap';
import { 
  Star, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Navigation, 
  MessageCircle,
  Share2,
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import * as vendorApi from '../services/vendorApi';
import * as reviewApi from '../services/reviewApi';
import * as userApi from '../services/userApi';
import { getDirections, getDistanceMatrix } from '../services/mapService';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewItem from '../components/reviews/ReviewItem';
import MapDisplay from '../components/maps/MapDisplay';
import DirectionsMap from '../components/maps/DirectionsMap';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import useGeolocation from '../hooks/useGeolocation';

// Enhanced Star Rating Component
const StarRating = ({ rating, size = 20, showNumber = false, className = '' }) => {
  return (
    <div className={`d-flex align-items-center ${className}`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "text-warning fill-warning" : "text-muted"}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
      {showNumber && (
        <span className="ms-2 text-dark fw-medium">
          {rating?.toFixed(1) || '0.0'}
        </span>
      )}
    </div>
  );
};

// Interactive Star Rating Component for Reviews
const InteractiveStarRating = ({ rating, onRatingChange, size = 28, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="d-flex justify-content-center gap-1 mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`btn btn-link p-1 ${disabled ? 'pe-none' : ''}`}
          onClick={() => !disabled && onRatingChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          style={{ 
            border: 'none', 
            background: 'none', 
            cursor: disabled ? 'default' : 'pointer' 
          }}
        >
          <Star
            size={size}
            className={star <= (hoverRating || rating) ? "text-warning fill-warning" : "text-muted"}
            fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

function VendorDetailPage() {
  const { id: vendorId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const { location: userLocation, error: geoError, getPosition, loading: geoLoading } = useGeolocation();

  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchVendorAndReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [fetchedVendor, fetchedReviews] = await Promise.all([
        vendorApi.getVendorById(vendorId),
        reviewApi.getReviewsForVendor(vendorId)
      ]);
      
      setVendor(fetchedVendor);
      setReviews(fetchedReviews);
      
      // Check if vendor is favorited
      if (userProfile?.favorites?.includes(fetchedVendor.id)) {
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Error fetching vendor details:', err);
      setError(err.message || 'Failed to load vendor details.');
      addToast('danger', 'Failed to load vendor details.');
    } finally {
      setLoading(false);
    }
  }, [vendorId, userProfile, addToast]);

  useEffect(() => {
    fetchVendorAndReviews();
  }, [fetchVendorAndReviews]);

  // Calculate approximate distance when vendor and user location are available
  useEffect(() => {
    const calculateDistance = async () => {
      if (!vendor?.location || !userLocation.latitude || geoLoading) return;

      try {
        const startCoords = userLocation.longitude && userLocation.latitude ? 
          [userLocation.longitude, userLocation.latitude] : null;
        const endCoords = [vendor.location.longitude, vendor.location.latitude];
        
        const distanceData = await getDistanceMatrix(startCoords, endCoords);
        setDistanceInfo(distanceData);
      } catch (error) {
        console.warn('Could not calculate distance:', error);
      }
    };

    calculateDistance();
  }, [vendor, userLocation, geoLoading]);

  const handleReviewSubmitted = useCallback(() => {
    fetchVendorAndReviews();
    addToast('success', 'Review submitted successfully!');
  }, [fetchVendorAndReviews, addToast]);

  const handleGetDirections = async () => {
    if (!vendor?.location?.latitude || !vendor.location.longitude) {
      addToast('warning', 'Vendor location is not available.');
      return;
    }

    setIsFetchingRoute(true);
    setRouteGeoJSON(null);

    try {
      await getPosition();
      
      if (userLocation.latitude && userLocation.longitude) {
        const startCoords = [userLocation.longitude, userLocation.latitude];
        const endCoords = [vendor.location.longitude, vendor.location.latitude];
        
        const route = await getDirections(startCoords, endCoords);
        setRouteGeoJSON({
          type: 'Feature',
          geometry: route.geometry
        });
        
        setShowDirectionsModal(true);
      } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.location.latitude},${vendor.location.longitude}`);
      }
    } catch (err) {
      console.error('Directions error:', err);
      addToast('warning', 'Opening Google Maps instead...');
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.location.latitude},${vendor.location.longitude}`);
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const handleQuickDirections = () => {
    if (!vendor?.location) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.location.latitude},${vendor.location.longitude}`);
  };

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      addToast('info', 'Please log in to favorite vendors.');
      return;
    }
    
    try {
      if (isFavorited) {
        await userApi.removeFavoriteVendor(vendorId);
        addToast('success', 'Removed from favorites!');
      } else {
        await userApi.addFavoriteVendor(vendorId);
        addToast('success', 'Added to favorites!');
      }
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error('Favorite toggle error:', err);
      addToast('danger', `Failed to update favorites: ${err.message}`);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${vendor.businessName} on our platform!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor.businessName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('success', 'Link copied to clipboard!');
    setShowShareModal(false);
  };

  const formatDistance = (distance) => {
    if (!distance || distance === 'Unknown') return 'Distance unknown';
    return `${distance} away`;
  };

  const formatDuration = (duration) => {
    if (!duration || duration === 'Unknown') return '';
    if (duration < 60) return `• ${duration} min`;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `• ${hours}h ${mins}m` : `• ${hours}h`;
  };

  const allImages = [vendor?.profileImageUrl, ...(vendor?.additionalImages || [])].filter(img => img);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading vendor details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="border-0 shadow-sm">
          <div className="text-center py-4">
            <XCircle size={48} className="text-danger mb-3" />
            <h4 className="text-danger">Error Loading Vendor</h4>
            <p className="mb-4">{error}</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Button variant="primary" onClick={fetchVendorAndReviews}>
                Try Again
              </Button>
              <Button variant="outline-secondary" as={Link} to="/vendors">
                Back to Vendors
              </Button>
            </div>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!vendor) {
    return (
      <Container className="my-5">
        <Alert variant="info" className="border-0 shadow-sm text-center">
          <div className="py-4">
            <Users size={48} className="text-primary mb-3" />
            <h5>Vendor not found</h5>
            <p className="mb-3">The vendor you're looking for doesn't exist or has been removed.</p>
            <Button as={Link} to="/vendors" variant="primary">
              Browse Vendors
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container className="vendor-detail-page py-4">
        {/* Back Navigation */}
        <div className="mb-4">
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/vendors"
            className="d-flex align-items-center"
          >
            <ArrowLeft size={18} className="me-2" />
            Back to Vendors
          </Button>
        </div>

        <Row className="g-4">
          {/* Main Content */}
          <Col xl={8} lg={7}>
            {/* Header Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-start mb-3 mb-md-4">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center flex-wrap mb-2">
                      <Badge bg="primary" className="me-2 mb-2">
                        {vendor.category}
                      </Badge>
                      <Badge bg={vendor.isOpen ? 'success' : 'danger'} className="mb-2">
                        <div className="d-flex align-items-center">
                          {vendor.isOpen ? <CheckCircle size={12} className="me-1" /> : <XCircle size={12} className="me-1" />}
                          {vendor.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                      </Badge>
                    </div>
                    
                    <h1 className="h3 h2-md fw-bold text-dark mb-2 mb-md-3">{vendor.businessName}</h1>
                    
                    <div className="d-flex align-items-center mb-3">
                      <StarRating 
                        rating={vendor.averageRating || 0} 
                        size={20} 
                        showNumber={true}
                      />
                      <span className="ms-3 text-dark fw-medium d-none d-sm-block">
                        <span className="text-muted">({vendor.totalReviews || 0} reviews)</span>
                      </span>
                    </div>

                    <p className="text-dark fs-6 mb-0">{vendor.description}</p>
                  </div>
                  
                  {/* Desktop Action Buttons */}
                  <div className="d-none d-lg-flex flex-column gap-2 ms-3 ms-md-4">
                    <Button 
                      variant={isFavorited ? "warning" : "outline-warning"} 
                      onClick={handleFavoriteToggle}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '44px', height: '44px' }}
                    >
                      <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                    </Button>
                    <Button 
                      variant="outline-primary"
                      onClick={handleShare}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: '44px', height: '44px' }}
                    >
                      <Share2 size={20} />
                    </Button>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="d-flex d-lg-none gap-2 mb-3">
                  <Button 
                    variant={isFavorited ? "warning" : "outline-warning"} 
                    onClick={handleFavoriteToggle}
                    className="d-flex align-items-center flex-grow-1"
                  >
                    <Heart size={18} fill={isFavorited ? "currentColor" : "none"} className="me-2" />
                    {isFavorited ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button 
                    variant="outline-primary"
                    onClick={handleShare}
                    className="d-flex align-items-center"
                    style={{ width: '44px' }}
                  >
                    <Share2 size={18} />
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-0">
                  <Carousel 
                    activeIndex={activeImageIndex}
                    onSelect={setActiveImageIndex}
                    controls={allImages.length > 1}
                    indicators={allImages.length > 1}
                    className="vendor-gallery"
                  >
                    {allImages.map((imgUrl, index) => (
                      <Carousel.Item key={index}>
                        <div className="carousel-image-container">
                          <img 
                            src={imgUrl} 
                            alt={`${vendor.businessName} - ${index + 1}`}
                            className="carousel-image"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/800x400?text=Image+Not+Available';
                            }}
                          />
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                  
                  {/* Image Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="p-2 p-md-3">
                      <div className="image-thumbnails">
                        {allImages.map((imgUrl, index) => (
                          <button
                            key={index}
                            className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                            onClick={() => setActiveImageIndex(index)}
                          >
                            <img 
                              src={imgUrl} 
                              alt={`Thumbnail ${index + 1}`}
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/80x60?text=Image';
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Services Section */}
            {vendor.services && vendor.services.length > 0 && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 py-3">
                  <h4 className="fw-bold mb-0 d-flex align-items-center">
                    <Award size={20} className="me-2 text-primary" />
                    Services & Pricing
                  </h4>
                </Card.Header>
                <Card.Body className="p-0">
                  <ListGroup variant="flush">
                    {vendor.services.map((service, index) => (
                      <ListGroup.Item key={index} className="p-3 p-md-4 border-bottom">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="fw-bold text-dark mb-2">{service.name}</h6>
                            {service.description && (
                              <p className="text-muted mb-0 fs-6">{service.description}</p>
                            )}
                          </div>
                          {service.price && (
                            <Badge bg="primary" className="fs-6 px-3 py-2 ms-3">
                              ${service.price}
                            </Badge>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h4 className="fw-bold mb-0 d-flex align-items-center">
                  <Star size={20} className="me-2 text-warning" />
                  Customer Reviews
                  {reviews.length > 0 && (
                    <Badge bg="light" text="dark" className="ms-2 fs-6">
                      {reviews.length}
                    </Badge>
                  )}
                </h4>
              </Card.Header>
              <Card.Body className="p-3 p-md-4">
                {/* Review Form */}
                {currentUser ? (
                  <ReviewForm 
                    vendorId={vendorId} 
                    vendorName={vendor.businessName}
                    onReviewSubmitted={handleReviewSubmitted} 
                    className="mb-4"
                  />
                ) : (
                  <Alert variant="info" className="border-0 bg-light mb-4">
                    <div className="d-flex align-items-center">
                      <MessageCircle size={20} className="me-3 text-primary" />
                      <div>
                        <Link to="/auth" className="fw-medium text-primary text-decoration-none">
                          Log in
                        </Link>{' '}
                        to share your experience with this business.
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <ReviewItem key={review.id} review={review} />
                    ))
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <Star size={48} className="mb-3 opacity-50" />
                      <h6 className="text-muted">No reviews yet</h6>
                      <p className="mb-0">Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xl={4} lg={5}>
            <div className="sticky-sidebar">
              {/* Contact & Location Card */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-3 p-md-4">
                  <h5 className="fw-bold mb-3 mb-md-4 text-dark">Contact & Location</h5>
                  
                  <ListGroup variant="flush" className="vendor-info-list">
                    <ListGroup.Item className="d-flex align-items-start px-0 py-2 py-md-3 border-bottom">
                      <MapPin size={20} className="text-primary mt-1 me-3 flex-shrink-0" />
                      <div>
                        <div className="fw-medium text-dark">{vendor.address?.street}</div>
                        <small className="text-muted">
                          {vendor.address?.city}, {vendor.address?.state} {vendor.address?.zipCode}
                        </small>
                      </div>
                    </ListGroup.Item>
                    
                    {vendor.contactPhone && (
                      <ListGroup.Item className="d-flex align-items-center px-0 py-2 py-md-3 border-bottom">
                        <Phone size={20} className="text-primary me-3 flex-shrink-0" />
                        <div className="fw-medium text-dark">{vendor.contactPhone}</div>
                      </ListGroup.Item>
                    )}
                    
                    {vendor.contactEmail && (
                      <ListGroup.Item className="d-flex align-items-center px-0 py-2 py-md-3 border-bottom">
                        <Mail size={20} className="text-primary me-3 flex-shrink-0" />
                        <div className="fw-medium text-dark">{vendor.contactEmail}</div>
                      </ListGroup.Item>
                    )}

                    {/* Distance Information */}
                    {distanceInfo && (
                      <ListGroup.Item className="d-flex align-items-center px-0 py-2 py-md-3 border-bottom">
                        <Navigation size={20} className="text-primary me-3 flex-shrink-0" />
                        <div>
                          <div className="fw-medium text-dark">
                            {formatDistance(distanceInfo.distance)}
                          </div>
                          <small className="text-muted">
                            {formatDuration(distanceInfo.duration)}
                          </small>
                        </div>
                      </ListGroup.Item>
                    )}
                  </ListGroup>

                  {/* Action Buttons */}
                  <div className="d-grid gap-2 mt-3 mt-md-4">
                    <Button
                      variant="primary"
                      as={Link}
                      to={`/messages/${vendor.id}`}
                      state={{ vendor }}
                      className="d-flex align-items-center justify-content-center py-2"
                    >
                      <MessageCircle size={18} className="me-2" />
                      Message Business
                    </Button>
                    
                    <Button
                      variant="success"
                      onClick={handleGetDirections}
                      disabled={isFetchingRoute}
                      className="d-flex align-items-center justify-content-center py-2"
                    >
                      {isFetchingRoute ? (
                        <>
                          <Spinner as="span" size="sm" animation="border" className="me-2" />
                          Getting Route...
                        </>
                      ) : (
                        <>
                          <Navigation size={18} className="me-2" />
                          Get Directions
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline-primary"
                      onClick={handleQuickDirections}
                      className="d-flex align-items-center justify-content-center py-2"
                    >
                      <ExternalLink size={18} className="me-2" />
                      Open in Maps
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Map Preview */}
              {vendor.location && (
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <div className="map-preview-container">
                      <MapDisplay 
                        vendors={[vendor]}
                        center={[vendor.location.longitude, vendor.location.latitude]}
                        zoom={14}
                        isInteractive={true}
                        showPopup={true}
                        height="200px"
                      />
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Directions Modal */}
      <DirectionsMap
        show={showDirectionsModal}
        onClose={() => setShowDirectionsModal(false)}
        userLocation={userLocation}
        vendorLocation={vendor.location}
        vendorName={vendor.businessName}
        travelMode="driving"
      />

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="d-flex align-items-center">
            <Share2 size={20} className="me-2" />
            Share Business
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <h6 className="fw-bold mb-3">{vendor.businessName}</h6>
          <p className="text-muted mb-4">Share this business with others</p>
          <Button variant="primary" onClick={copyToClipboard} className="px-4">
            Copy Link
          </Button>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .vendor-detail-page {
          max-width: 1400px;
        }
        
        .sticky-sidebar {
          position: sticky;
          top: 2rem;
        }
        
        .carousel-image-container {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          overflow: hidden;
          background: #f8f9fa;
        }
        
        .carousel-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-thumbnails {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        
        .thumbnail {
          flex: 0 0 auto;
          width: 60px;
          height: 60px;
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          padding: 0;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .thumbnail.active {
          border-color: #0d6efd;
        }
        
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .map-preview-container {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .vendor-info-list .list-group-item {
          border-color: #f1f3f4;
        }
        
        @media (max-width: 768px) {
          .vendor-detail-page {
            padding-left: 12px;
            padding-right: 12px;
          }
          
          .carousel-image-container {
            padding-bottom: 75%; /* 4:3 aspect ratio on mobile */
          }
          
          .sticky-sidebar {
            position: static;
          }
        }
        
        @media (max-width: 576px) {
          .carousel-image-container {
            padding-bottom: 100%; /* 1:1 aspect ratio on small mobile */
          }
        }
      `}</style>
    </>
  );
}

export default VendorDetailPage;