import React, { useState } from 'react';
import { Card, Button, Collapse, Badge } from 'react-bootstrap';
import './review.css';
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
      <Card.Body className="p-4">
        {/* Review Header */}
        <div className="d-flex align-items-start mb-3">
          {/* Reviewer Avatar */}
          <div className="reviewer-avatar me-3">
            {reviewerPhoto ? (
              <img 
                src={reviewerPhoto} 
                alt={reviewerName}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder bg-primary text-white">
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
                <div className="d-flex align-items-center">
                  {/* Rating Stars */}
                  <div className="rating-display me-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= rating ? 'text-warning' : 'text-light'}
                        style={{ fontSize: '1rem' }}
                      >
                        <i className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                      </span>
                    ))}
                  </div>
                  
                  {/* Rating Badge */}
                  <Badge 
                    bg="warning" 
                    text="dark" 
                    className="rating-badge"
                  >
                    <i className="bi bi-star-fill me-1"></i>
                    {rating}.0
                  </Badge>
                  
                  {/* Rating Label */}
                  <span className="text-muted ms-2 small">
                    {getRatingLabel(rating)}
                  </span>
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
          <p className="text-dark mb-2" style={{ lineHeight: '1.6' }}>
            {displayComment}
          </p>
          
          {isLongComment && (
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 fw-semibold"
              onClick={() => setShowFullComment(!showFullComment)}
            >
              {showFullComment ? 'Show less' : 'Read more'}
              <i className={`bi bi-chevron-${showFullComment ? 'up' : 'down'} ms-1`}></i>
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
                className="vendor-reply-toggle"
              >
                <i className="bi bi-chat-square-quote me-2"></i>
                Vendor Response
                <i className={`bi bi-chevron-${showVendorReply ? 'up' : 'down'} ms-2`}></i>
              </Button>
            </div>
            
            <Collapse in={showVendorReply}>
              <div>
                <Card className="vendor-reply-card border-start-4 border-primary">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="vendor-avatar me-2">
                        <i className="bi bi-shop text-primary"></i>
                      </div>
                      <div>
                        <strong className="text-primary">Business Response</strong>
                        {vendorReply.repliedAt && (
                          <small className="text-muted ms-2">
                            {new Date(vendorReply.repliedAt._seconds * 1000).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    </div>
                    <p className="text-dark mb-0" style={{ lineHeight: '1.5' }}>
                      {vendorReply.text}
                    </p>
                  </Card.Body>
                </Card>
              </div>
            </Collapse>
          </div>
        )}

        {/* Review Actions */}
        <div className="review-actions d-flex gap-3 pt-2 border-top">
          <Button variant="link" size="sm" className="text-muted p-0">
            <i className="bi bi-hand-thumbs-up me-1"></i>
            Helpful
          </Button>
          <Button variant="link" size="sm" className="text-muted p-0">
            <i className="bi bi-flag me-1"></i>
            Report
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ReviewItem;