import React, { useState } from 'react';
import { Card, Button, Collapse, Badge } from 'react-bootstrap';
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp, MessageSquareQuote, Store } from 'lucide-react';
import './review.css';

// Static Star Rating Display Component
const StaticStarRating = ({ rating, size = 16 }) => {
  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "text-warning fill-warning" : "text-light"}
          fill={star <= rating ? "currentColor" : "none"}
        />
      ))}
      <span className="fw-semibold text-dark ms-1">{rating}.0</span>
    </div>
  );
};

function ReviewItem({ review }) {
  const { reviewerName, rating, comment, createdAt, vendorReply, reviewerPhoto } = review;
  const [showFullComment, setShowFullComment] = useState(false);
  const [showVendorReply, setShowVendorReply] = useState(false);

  const reviewDate = createdAt 
    ? new Date(createdAt._seconds ? createdAt._seconds * 1000 : createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Date not available';

  const isLongComment = comment.length > 200;
  const displayComment = showFullComment ? comment : comment.substring(0, 200) + (isLongComment ? '...' : '');

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating] || 'Rated';
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(word => word[0]).join('').toUpperCase()
      : 'U';
  };

  return (
    <Card className="review-item-premium border-0 shadow-sm mb-3">
      <Card.Body className="p-3 p-md-4">
        {/* Review Header */}
        <div className="d-flex align-items-start mb-3">
          {/* Reviewer Avatar */}
          <div className="reviewer-avatar me-3">
            {reviewerPhoto ? (
              <img 
                src={reviewerPhoto} 
                alt={reviewerName}
                className="avatar-image rounded-circle"
                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px', fontSize: '16px', fontWeight: '600' }}
              >
                {getInitials(reviewerName)}
              </div>
            )}
          </div>

          {/* Review Info */}
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="fw-bold text-dark mb-1">
                  {reviewerName || 'Anonymous User'}
                </h6>
                <div className="d-flex align-items-center gap-2">
                  {/* Rating Stars */}
                  <StaticStarRating rating={rating} />
                  
                  {/* Rating Label */}
                  <Badge 
                    bg="outline-warning" 
                    text="dark"
                    className="border border-warning"
                    style={{ fontSize: '12px', fontWeight: '500' }}
                  >
                    {getRatingLabel(rating)}
                  </Badge>
                </div>
              </div>
              
              {/* Review Date */}
              <small className="text-muted text-nowrap">
                {reviewDate}
              </small>
            </div>
          </div>
        </div>

        {/* Review Comment */}
        <div className="review-comment mb-3">
          <p className="text-dark mb-2" style={{ lineHeight: '1.6', fontSize: '15px' }}>
            {displayComment}
          </p>
          
          {isLongComment && (
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 fw-semibold d-flex align-items-center"
              onClick={() => setShowFullComment(!showFullComment)}
              style={{ fontSize: '14px' }}
            >
              {showFullComment ? 'Show less' : 'Read more'}
              {showFullComment ? <ChevronUp size={16} className="ms-1" /> : <ChevronDown size={16} className="ms-1" />}
            </Button>
          )}
        </div>

        {/* Vendor Reply */}
        {vendorReply && (
          <div className="vendor-reply-premium">
            <div className="d-flex align-items-center mb-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowVendorReply(!showVendorReply)}
                className="vendor-reply-toggle d-flex align-items-center"
                style={{ fontSize: '14px' }}
              >
                <MessageSquareQuote size={16} className="me-2" />
                Vendor Response
                {showVendorReply ? <ChevronUp size={16} className="ms-2" /> : <ChevronDown size={16} className="ms-2" />}
              </Button>
            </div>
            
            <Collapse in={showVendorReply}>
              <div>
                <Card className="vendor-reply-card border-start-4 border-primary bg-light">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="vendor-avatar me-2">
                        <Store size={20} className="text-primary" />
                      </div>
                      <div className="d-flex align-items-center">
                        <strong className="text-primary" style={{ fontSize: '14px' }}>Business Response</strong>
                        {vendorReply.repliedAt && (
                          <small className="text-muted ms-2" style={{ fontSize: '12px' }}>
                            {new Date(vendorReply.repliedAt._seconds * 1000).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    </div>
                    <p className="text-dark mb-0" style={{ lineHeight: '1.5', fontSize: '14px' }}>
                      {vendorReply.text}
                    </p>
                  </Card.Body>
                </Card>
              </div>
            </Collapse>
          </div>
        )}

        {/* Review Actions */}
        <div className="review-actions d-flex gap-3 pt-3 border-top">
          <Button 
            variant="link" 
            size="sm" 
            className="text-muted p-0 d-flex align-items-center"
            style={{ fontSize: '14px' }}
          >
            <ThumbsUp size={16} className="me-1" />
            Helpful
          </Button>
          <Button 
            variant="link" 
            size="sm" 
            className="text-muted p-0 d-flex align-items-center"
            style={{ fontSize: '14px' }}
          >
            <Flag size={16} className="me-1" />
            Report
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ReviewItem;