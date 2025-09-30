import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Nav, 
  Spinner, 
  Alert, 
  Button, 
  Modal,
  Badge,
  Dropdown
} from 'react-bootstrap';
import { 
  Star, 
  Heart, 
  User, 
  Trash2, 
  Edit, 
  MoreVertical,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as reviewApi from '../services/reviewApi';
import * as vendorApi from '../services/vendorApi';
import VendorCard from '../components/vendors/VendorCard';

function UserProfilePage() {
  const { userProfile, loadingAuth, refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, review: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    setError('');
    try {
      let result;
      if (activeTab === 'reviews') {
        result = await reviewApi.getReviewsByUser();
      } else { // favorites
        if (userProfile.favorites && userProfile.favorites.length > 0) {
          const vendorPromises = userProfile.favorites.map(id => vendorApi.getVendorById(id));
          result = (await Promise.all(vendorPromises)).filter(Boolean);
        } else {
          result = [];
        }
      }
      setData(result);
    } catch (err) {
      setError(err.message || `Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, userProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteReview = async (reviewId) => {
    setActionLoading(true);
    try {
      await reviewApi.deleteReview(reviewId);
      // Remove from local state
      setData(prev => prev.filter(review => review.id !== reviewId));
      // Refresh user profile to update review count if needed
      await refreshUserProfile();
      setDeleteModal({ show: false, review: null });
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFavorite = async (vendorId) => {
    setActionLoading(true);
    try {
      await vendorApi.toggleFavorite(vendorId);
      // Refresh data
      await fetchData();
      await refreshUserProfile();
    } catch (err) {
      setError(err.message || 'Failed to remove from favorites');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="d-flex align-items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? "text-warning fill-warning" : "text-muted"}
            fill={i < rating ? "currentColor" : "none"}
          />
        ))}
        <span className="ms-2 fw-medium text-dark">{rating}.0</span>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading {activeTab}...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="d-flex align-items-center">
          <div className="flex-grow-1">{error}</div>
          <Button variant="outline-danger" size="sm" onClick={fetchData}>
            Retry
          </Button>
        </Alert>
      );
    }

    if (data.length === 0) {
      return (
        <Card className="text-center border-0 shadow-sm">
          <Card.Body className="py-5">
            {activeTab === 'favorites' ? (
              <>
                <Heart size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No favorites yet</h5>
                <p className="text-muted mb-0">
                  Start exploring vendors and add them to your favorites!
                </p>
              </>
            ) : (
              <>
                <Star size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No reviews yet</h5>
                <p className="text-muted mb-0">
                  Share your experience by reviewing vendors you've used!
                </p>
              </>
            )}
          </Card.Body>
        </Card>
      );
    }

    if (activeTab === 'reviews') {
      return (
        <div className="reviews-list">
          {data.map(review => (
            <Card key={review.id} className="mb-4 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <h5 className="mb-0 fw-bold text-dark me-3">{review.vendorName}</h5>
                      <Badge bg="light" text="dark" className="d-flex align-items-center">
                        <MapPin size={12} className="me-1" />
                        {review.vendorLocation || 'Unknown Location'}
                      </Badge>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="outline-secondary" 
                      size="sm" 
                      className="border-0"
                    >
                      <MoreVertical size={16} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                      <Dropdown.Item 
                        onClick={() => {/* Add edit functionality */}}
                        className="d-flex align-items-center"
                      >
                        <Edit size={16} className="me-2" />
                        Edit Review
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item 
                        onClick={() => setDeleteModal({ show: true, review })}
                        className="d-flex align-items-center text-danger"
                      >
                        <Trash2 size={16} className="me-2" />
                        Delete Review
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <p className="text-dark mb-3 fs-6">"{review.comment}"</p>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center text-muted">
                    <Calendar size={14} className="me-1" />
                    <small>Reviewed on {formatDate(review.createdAt)}</small>
                  </div>
                  
                  {review.updatedAt && review.updatedAt !== review.createdAt && (
                    <small className="text-muted">
                      Edited on {formatDate(review.updatedAt)}
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      );
    }

    if (activeTab === 'favorites') {
      return (
        <Row xs={1} md={2} lg={3} className="g-4">
          {data.map(vendor => (
            <Col key={vendor.id}>
              <div className="position-relative">
                <VendorCard vendor={vendor} />
                <Button
                  variant="danger"
                  size="sm"
                  className="position-absolute top-0 end-0 m-2 rounded-circle"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => handleRemoveFavorite(vendor.id)}
                  disabled={actionLoading}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      );
    }

    return null;
  };

  if (loadingAuth) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading profile...</p>
        </div>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="info" className="border-0 shadow-sm">
          <User size={24} className="mb-2" />
          <h5>Please log in to view your profile</h5>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-5">
        <Row className="g-4">
          {/* Sidebar */}
          <Col md={4} lg={3}>
            <Card className="shadow-sm border-0 position-sticky" style={{ top: '2rem' }}>
              <Card.Body className="text-center p-4">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '80px', height: '80px' }}>
                  <User size={32} className="text-white" />
                </div>
                <h4 className="fw-bold text-dark mb-2">{userProfile.name}</h4>
                <p className="text-muted mb-3">{userProfile.email}</p>
                
                {/* Stats */}
                <div className="d-flex justify-content-around text-center border-top pt-3">
                  <div>
                    <div className="fw-bold text-dark">{userProfile.favorites?.length || 0}</div>
                    <small className="text-muted">Favorites</small>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{data.length}</div>
                    <small className="text-muted">{activeTab === 'reviews' ? 'Reviews' : 'Items'}</small>
                  </div>
                </div>
              </Card.Body>

              <Nav variant="pills" className="flex-column p-3" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="favorites" 
                    className="d-flex align-items-center py-3 border-bottom"
                  >
                    <Heart size={18} className="me-3" />
                    <div className="flex-grow-1 text-start">
                      <div className="fw-medium">My Favorites</div>
                      <small className="text-muted">Saved vendors and services</small>
                    </div>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey="reviews" 
                    className="d-flex align-items-center py-3"
                  >
                    <Star size={18} className="me-3" />
                    <div className="flex-grow-1 text-start">
                      <div className="fw-medium">My Reviews</div>
                      <small className="text-muted">Ratings and feedback</small>
                    </div>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card>
          </Col>

          {/* Main Content */}
          <Col md={8} lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="h3 fw-bold text-dark mb-1">
                  {activeTab === 'favorites' ? 'My Favorite Vendors' : 'My Reviews'}
                </h2>
                <p className="text-muted mb-0">
                  {activeTab === 'favorites' 
                    ? 'Your saved vendors and services' 
                    : 'Your ratings and feedback history'
                  }
                </p>
              </div>
              
              {data.length > 0 && (
                <Badge bg="primary" pill className="fs-6">
                  {data.length} {data.length === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </div>

            {renderContent()}
          </Col>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, review: null })} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <Trash2 size={24} className="me-2" />
            Delete Review
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-0">
            Are you sure you want to delete your review for <strong>"{deleteModal.review?.vendorName}"</strong>? 
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setDeleteModal({ show: false, review: null })}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleDeleteReview(deleteModal.review?.id)}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="me-2" />
                Delete Review
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserProfilePage;