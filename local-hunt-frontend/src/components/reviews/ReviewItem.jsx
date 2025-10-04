import React, { useState } from 'react';
import { Card, Button, Collapse, Badge, Alert } from 'react-bootstrap';
import { Star, Flag, ChevronDown, ChevronUp, MessageSquareQuote, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { reportReview } from '../../services/reviewApi';
import './review.css';

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

function ReviewItem({ review, onReviewUpdated }) {
  const { reviewerName, rating, comment, createdAt, vendorReply } = review;
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [showFullComment, setShowFullComment] = useState(false);
  const [showVendorReply, setShowVendorReply] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userActions, setUserActions] = useState({
    reported: false
  });

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

  const handleReport = async () => {
    if (!currentUser) {
      addToast('info', 'Please log in to report reviews.');
      return;
    }

    if (userActions.reported) {
      addToast('info', 'You have already reported this review.');
      return;
    }

    // Confirm before reporting
    if (!window.confirm('Are you sure you want to report this review? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    
    try {
      await reportReview(review.id);
      setUserActions(prev => ({ ...prev, reported: true }));
      addToast('success', 'Review reported successfully. Our team will review it shortly.');
      
      // Update the review data if parent component provided callback
      if (onReviewUpdated) {
        onReviewUpdated({
          ...review,
          reportCount: (review.reportCount || 0) + 1
        });
      }
    } catch (error) {
      addToast('danger', error.message || 'Failed to report review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="review-item-premium border-0 shadow-sm mb-3">
      <Card.Body className="p-3 p-md-4">
        {/* Review Header */}
        <div className="d-flex align-items-start mb-3">
          {/* Reviewer Avatar */}
          <div className="reviewer-avatar me-3">
            <div 
              className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', fontSize: '16px', fontWeight: '600' }}
            >
              {getInitials(reviewerName)}
            </div>
          </div>

          {/* Review Info */}
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="fw-bold text-dark mb-1">
                  {reviewerName || 'Anonymous User'}
                </h6>
                <div className="d-flex align-items-center gap-2">
                  <StaticStarRating rating={rating} />
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
                        {vendorReply.createdAt && (
                          <small className="text-muted ms-2" style={{ fontSize: '12px' }}>
                            {new Date(
                              vendorReply.createdAt._seconds ? 
                              vendorReply.createdAt._seconds * 1000 : 
                              vendorReply.createdAt
                            ).toLocaleDateString()}
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
            className={`p-0 d-flex align-items-center ${
              userActions.reported ? 'text-danger' : 'text-muted'
            }`}
            style={{ fontSize: '14px' }}
            onClick={handleReport}
            disabled={loading || userActions.reported}
          >
            <Flag size={16} className="me-1" />
            {loading ? '...' : (userActions.reported ? 'Reported' : 'Report')}
          </Button>
        </div>

        {/* Report Count Badge */}
        {review.reportCount > 0 && (
          <div className="mt-2">
            <Badge bg="warning" text="dark" className="small">
              <Flag size={12} className="me-1" />
              {review.reportCount} report{review.reportCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}

        {/* User Action Feedback */}
        {userActions.reported && (
          <Alert variant="warning" className="mt-2 py-2 small mb-0">
            <i className="bi bi-flag-fill me-2"></i>
            Review reported. Our team will review it.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default ReviewItem;