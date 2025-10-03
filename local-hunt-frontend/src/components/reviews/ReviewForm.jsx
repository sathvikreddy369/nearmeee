import React, { useState } from 'react';
import { Form, Button, Card, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { Star } from 'lucide-react';
import { submitReview } from '../../services/reviewApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './review.css';

// Interactive Star Rating Component
const InteractiveStarRating = ({ rating, onRatingChange, size = 32, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getRatingText = (rating) => {
    const ratings = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratings[rating] || 'Select Rating';
  };

  return (
    <div className="text-center">
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
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.2s ease'
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
      <div className="rating-text">
        <span className={`fw-semibold ${rating ? 'text-warning' : 'text-muted'}`}>
          {getRatingText(hoverRating || rating)}
        </span>
      </div>
    </div>
  );
};

function ReviewForm({ vendorId, onReviewSubmitted, vendorName }) {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleCommentChange = (e) => {
    const text = e.target.value;
    setComment(text);
    setCharacterCount(text.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!currentUser) {
      addToast('info', 'You must be logged in to submit a review.');
      setLoading(false);
      return;
    }
    if (rating === 0) {
      addToast('warning', 'Please select a rating.');
      setLoading(false);
      return;
    }
    if (!comment.trim()) {
      addToast('warning', 'Please enter a comment for your review.');
      setLoading(false);
      return;
    }
    if (comment.length < 10) {
      addToast('warning', 'Please write a more detailed review (minimum 10 characters).');
      setLoading(false);
      return;
    }

    try {
      await submitReview(vendorId, rating, comment);
      addToast('success', 'Review submitted successfully! Thank you for your feedback.');
      setRating(0);
      setComment('');
      setCharacterCount(0);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      addToast('danger', err?.message || 'Failed to submit review. Please try again.');
      console.error('Review submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="review-form-premium shadow-sm border-0">
      <Card.Body className="p-3 p-md-4">
        <div className="text-center mb-3 mb-md-4">
          <h5 className="fw-bold text-dark mb-2">Share Your Experience</h5>
          <p className="text-muted mb-0">
            {vendorName ? `How was your experience with ${vendorName}?` : 'Tell us about your experience'}
          </p>
        </div>

        {!currentUser ? (
          <Alert variant="info" className="text-center">
            Please <strong>log in</strong> to submit a review and help other customers.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* Rating Section */}
            <Form.Group className="mb-3 mb-md-4">
              <Form.Label className="fw-semibold text-dark mb-3 d-block text-center">
                Overall Rating <span className="text-danger">*</span>
              </Form.Label>
              
              <InteractiveStarRating 
                rating={rating}
                onRatingChange={handleRatingChange}
                disabled={loading}
              />
            </Form.Group>

            {/* Comment Section */}
            <Form.Group className="mb-3 mb-md-4">
              <Form.Label className="fw-semibold text-dark">
                Your Review <span className="text-danger">*</span>
              </Form.Label>
              
              <Form.Control
                as="textarea"
                rows={4}
                value={comment}
                onChange={handleCommentChange}
                placeholder={`Share details about your experience... What did you like? What could be improved?`}
                className="review-textarea"
                disabled={loading}
                maxLength={500}
              />
              
              <div className="d-flex justify-content-between align-items-center mt-2">
                <small className={`text-muted ${characterCount < 10 ? 'text-warning' : ''}`}>
                  {characterCount < 10 
                    ? `Minimum ${10 - characterCount} more characters required`
                    : `${characterCount}/500 characters`
                  }
                </small>
                <small className="text-muted">
                  {characterCount}/500
                </small>
              </div>
            </Form.Group>

            {/* Submit Button */}
            <div className="text-center">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading || !currentUser || rating === 0 || comment.length < 10}
                className="submit-review-btn px-4 px-md-5 py-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Spinner 
                      as="span" 
                      animation="border" 
                      size="sm" 
                      className="me-2" 
                    />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    Submit Review
                  </>
                )}
              </Button>
              
              {!currentUser && (
                <div className="mt-3">
                  <small className="text-muted">
                    Your review helps other customers make better decisions
                  </small>
                </div>
              )}
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
}

export default ReviewForm;