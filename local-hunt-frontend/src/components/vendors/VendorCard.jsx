import React, { useState } from 'react';
import { Card, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './VendorCard.css'; // Assuming you have a CSS file for custom styles
function VendorCard({ vendor }) {
  const {
    id,
    businessName,
    description,
    category,
    profileImageUrl,
    averageRating,
    totalReviews,
    isOpen,
    location,
    services,
    contactPhone
  } = vendor;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = profileImageUrl || 'https://placehold.co/400x200/667eea/764ba2?text=Local+Business';
  const fallbackImage = 'https://placehold.co/400x200/667eea/764ba2?text=Local+Business';

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
        <span
          key={i}
          className={i <= numericRating ? 'text-warning' : 'text-light'}
          style={{ fontSize: '0.9rem' }}
        >
          <i className={`bi ${i <= numericRating ? 'bi-star-fill' : 'bi-star'}`}></i>
        </span>
      );
    }
    return stars;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Beverage': 'bi-egg-fried',
      'Services': 'bi-tools',
      'Healthcare': 'bi-heart-pulse',
      'Retail': 'bi-bag',
      'Automotive': 'bi-car-front',
      'Education': 'bi-book',
      'default': 'bi-shop'
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

  return (
    <Card className="vendor-card-premium h-100 border-0 shadow-sm">
      {/* Image Section */}
      <div className="vendor-card-image-container position-relative">
        <Card.Img
          variant="top"
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

        {/* Category Badge */}
        <Badge 
          bg="dark" 
          className="category-badge position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill"
        >
          <i className={`bi ${getCategoryIcon(category)} me-1`}></i>
          {category}
        </Badge>

        {/* Status Badge */}
        <OverlayTrigger placement="top" overlay={getStatusTooltip(isOpen)}>
          <Badge 
            bg={isOpen ? "success" : "danger"} 
            className="status-badge position-absolute top-0 end-0 m-3 px-2 py-2 rounded-circle"
          >
            <i className={`bi ${isOpen ? 'bi-check-lg' : 'bi-x-lg'}`}></i>
          </Badge>
        </OverlayTrigger>

        {/* Gradient Overlay */}
        <div className="image-gradient-overlay"></div>
      </div>

      <Card.Body className="d-flex flex-column p-4">
        {/* Header Section */}
        <div className="vendor-card-header mb-3">
          <Card.Title className="vendor-name mb-2 fw-bold text-dark">
            {businessName}
          </Card.Title>
          
          {/* Location & Distance */}
          <div className="vendor-location mb-2">
            <div className="d-flex align-items-center text-muted small">
              <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
              <span>
                {location?.colony && `${location.colony}, `}{location?.city}
                {distanceInfo && (
                  <span className="text-primary fw-semibold ms-2">
                    • {distanceInfo}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="vendor-rating-section mb-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="rating-stars me-2">
                {renderStars(averageRating)}
              </div>
              <span className="rating-value fw-semibold text-dark">
                {averageRating ? averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
            
            <Badge bg="light" text="dark" className="reviews-count px-2 py-1">
              <i className="bi bi-chat-square-text me-1"></i>
              {totalReviews || 0}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <Card.Text className="vendor-description text-muted small mb-3 flex-grow-1">
          {truncateDescription(description)}
        </Card.Text>

        {/* Services Preview */}
        {primaryService && (
          <div className="services-preview mb-3">
            <div className="d-flex align-items-center text-primary small">
              <i className="bi bi-tags me-2"></i>
              <span className="fw-medium">{primaryService.name}</span>
              {primaryService.price && (
                <Badge bg="primary" className="ms-2 px-2 py-1">
                  ₹{primaryService.price}
                </Badge>
              )}
            </div>
            {hasServices && services.length > 1 && (
              <small className="text-muted">
                +{services.length - 1} more service{services.length > 2 ? 's' : ''}
              </small>
            )}
          </div>
        )}

        {/* Contact Info */}
        {contactPhone && (
          <div className="contact-info mb-3">
            <div className="d-flex align-items-center text-muted small">
              <i className="bi bi-telephone-fill me-2 text-success"></i>
              <span>{contactPhone}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="vendor-actions mt-auto pt-2">
          <Button 
            as={Link} 
            to={`/vendors/${id}`}
            variant="primary" 
            className="view-details-btn w-100 py-2 rounded-pill fw-semibold"
            size="lg"
          >
            <i className="bi bi-eye me-2"></i>
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default VendorCard;