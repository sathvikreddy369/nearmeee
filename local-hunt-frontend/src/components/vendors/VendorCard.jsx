import React, { useState } from 'react';
import { Card, Badge, Button, OverlayTrigger, Tooltip, Row, Col } from 'react-bootstrap';
import { Eye, Navigation, Star, MapPin, Award } from 'lucide-react';
import './VendorCard.css';

function VendorCard({ vendor, onViewDetails, onGetDirections }) {
  const {
    id,
    businessName,
    description,
    category,
    profileImageUrl,
    averageRating,
    totalReviews,
    isOpen,
    address,
    services,
    contactPhone,
    openingHours,
    awards
  } = vendor;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = profileImageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop';
  const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop';

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const numericRating = typeof rating === 'number' ? rating : 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= numericRating ? "#ffc107" : "none"}
          color={i <= numericRating ? "#ffc107" : "#ddd"}
        />
      );
    }
    return stars;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Beverage': '🍔',
      'Services': '🔧',
      'Healthcare': '🏥',
      'Retail': '🛒',
      'Automotive': '🚗',
      'Education': '📚',
      'Home Services': '🏠',
      'Beauty & Wellness': '💅',
      'default': '🏪'
    };
    return icons[category] || icons.default;
  };

  const formatDistance = (distance) => {
    if (!distance || distance === 'Unknown') return null;
    return `${distance} km away`;
  };

  const getStatusTooltip = (isOpen) => (
    <Tooltip>
      {isOpen ? 'Currently Open - Visit Now!' : 'Currently Closed - Check Back Later'}
    </Tooltip>
  );

  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const hasServices = services && services.length > 0;
  const primaryService = hasServices ? services[0] : null;
  const distanceInfo = formatDistance(vendor.distance);

  const handleDetailsClick = (e) => {
    e.preventDefault();
    if (onViewDetails) {
      onViewDetails(id);
    }
  };

  const handleDirectionsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onGetDirections) {
      onGetDirections(vendor);
    }
  };

  return (
    <Card className="vendor-card-horizontal">
      <Row className="g-0">
        <Col xs={4} className="vendor-card-image-col">
          <div className="vendor-card-image-container">
            <img
              src={imageError ? fallbackImage : imageUrl}
              alt={`${businessName} - ${category} business`}
              className="vendor-card-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {/* Loading Overlay */}
            {!imageLoaded && (
              <div className="image-loading-overlay">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <OverlayTrigger placement="top" overlay={getStatusTooltip(isOpen)}>
              <Badge className={`status-badge ${isOpen ? 'open' : 'closed'}`}>
                {isOpen ? '✓' : '✕'}
              </Badge>
            </OverlayTrigger>

            {/* Award Icon */}
            {awards && awards.length > 0 && (
              <div className="award-icon" title={`${awards.length} award(s)`}><Award size={16} /></div>
            )}
          </div>
        </Col>
        <Col xs={8}>
          <div className="vendor-card-content">
            {/* Header Section */}
            <div className="vendor-card-header">
              <h3 className="vendor-name">{businessName}</h3>
              
              {/* Location & Distance */}
              <div className="vendor-location">
                <MapPin size={14} className="location-icon" />
                <span>
                  {address?.colony && `${address.colony}, `}{address?.city}
                  {distanceInfo && (
                    <span className="distance-info"> • {distanceInfo}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Rating Section */}
            <div className="vendor-rating-section">
              <div className="rating-content">
                <div className="rating-stars">
                  {renderStars(averageRating)}
                </div>
                <span className="rating-value">
                  {averageRating ? averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="vendor-actions">
              <Button 
                variant="primary" 
                onClick={handleDetailsClick}
                className="view-details-btn"
              >
                <Eye size={16} className="me-2" />
                Details
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDirectionsClick}
                className="directions-btn"
              >
                <Navigation size={16} className="me-2" />
                Directions
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default VendorCard;