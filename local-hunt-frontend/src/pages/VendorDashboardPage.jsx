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
  Form, 
  ListGroup, 
  Badge, 
  InputGroup,
  Modal,
  Dropdown
} from 'react-bootstrap';
import { 
  BarChart3, 
  Star, 
  Users, 
  Eye, 
  MessageSquare, 
  Edit3, 
  MapPin,
  Clock,
  Award,
  Image,
  Phone,
  Mail,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Send,
  Navigation
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import useGeolocation from '../hooks/useGeolocation';
import * as vendorApi from '../services/vendorApi';
import * as reviewApi from '../services/reviewApi';

// Main Dashboard Component
function VendorDashboardPage() {
  const { userProfile, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [vendorData, setVendorData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllData = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    setError('');
    try {
      const fetchedVendor = await vendorApi.getVendorProfileForOwner();
      setVendorData(fetchedVendor);
      const fetchedReviews = await reviewApi.getReviewsForVendor(fetchedVendor.id);
      setReviews(fetchedReviews);
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch vendor data.';
      setError(errorMsg);
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        addToast('info', 'Please complete your vendor registration.');
        navigate('/register-vendor');
      }
    } finally {
      setLoading(false);
    }
  }, [userProfile, navigate, addToast]);

  useEffect(() => {
    if (!loadingAuth) {
      if (!userProfile) {
        navigate('/auth');
      } else if (userProfile.role === 'vendor') {
        fetchAllData();
      }
    }
  }, [loadingAuth, userProfile, fetchAllData, navigate]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="d-flex align-items-center">
          <div className="flex-grow-1">{error}</div>
          <Button variant="outline-danger" size="sm" onClick={fetchAllData}>
            Retry
          </Button>
        </Alert>
      );
    }

    if (!vendorData) {
      return (
        <Alert variant="info" className="text-center">
          <div className="py-4">
            <Users size={48} className="text-primary mb-3" />
            <h5>No vendor profile found</h5>
            <p className="mb-3">You need to register your business to access the vendor dashboard.</p>
            <Button variant="primary" onClick={() => navigate('/register-vendor')}>
              Register Your Business
            </Button>
          </div>
        </Alert>
      );
    }

    switch (activeTab) {
      case 'analytics': 
        return <VendorAnalytics vendor={vendorData} reviews={reviews} />;
      case 'reviews': 
        return <VendorReviews reviews={reviews} onReplySubmitted={fetchAllData} />;
      case 'profile': 
        return <VendorProfileForm vendor={vendorData} onProfileUpdate={fetchAllData} />;
      default: 
        return null;
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
    <Container fluid className="vendor-dashboard py-4">
      <Row className="g-4">
        <Col lg={3}>
          {/* Sidebar */}
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-4">
              <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '80px', height: '80px' }}>
                <Users size={32} className="text-white" />
              </div>
              <h4 className="fw-bold text-dark mb-2">{vendorData?.businessName || 'Your Business'}</h4>
              <Badge bg={vendorData?.isOpen ? 'success' : 'danger'} className="mb-3">
                {vendorData?.isOpen ? 'Open' : 'Closed'}
              </Badge>
              <p className="text-muted small">{vendorData?.category || 'No category set'}</p>
              
              {/* Quick Stats */}
              <div className="border-top pt-3">
                <Row className="g-2 text-center">
                  <Col xs={4}>
                    <div className="fw-bold text-primary">{vendorData?.profileViews || 0}</div>
                    <small className="text-muted">Views</small>
                  </Col>
                  <Col xs={4}>
                    <div className="fw-bold text-primary">{reviews.length}</div>
                    <small className="text-muted">Reviews</small>
                  </Col>
                  <Col xs={4}>
                    <div className="fw-bold text-primary">{vendorData?.averageRating?.toFixed(1) || '0.0'}</div>
                    <small className="text-muted">Rating</small>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          {/* Main Content */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 py-3">
              <Nav variant="pills" className="flex-nowrap overflow-auto" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="analytics" className="d-flex align-items-center">
                    <BarChart3 size={18} className="me-2" />
                    <span className="d-none d-sm-inline">Analytics</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reviews" className="d-flex align-items-center">
                    <Star size={18} className="me-2" />
                    <span className="d-none d-sm-inline">Reviews</span>
                    {reviews.length > 0 && (
                      <Badge bg="primary" pill className="ms-2">
                        {reviews.length}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="profile" className="d-flex align-items-center">
                    <Edit3 size={18} className="me-2" />
                    <span className="d-none d-sm-inline">Edit Profile</span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body className="p-4">
              {renderContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// Analytics Component
const VendorAnalytics = ({ vendor, reviews }) => {
  const stats = [
    {
      title: "Profile Views",
      value: vendor.profileViews || 0,
      icon: <Eye size={24} />,
      color: "primary",
      change: "+12%"
    },
    {
      title: "Total Reviews",
      value: reviews.length,
      icon: <Star size={24} />,
      color: "warning",
      change: "+5%"
    },
    {
      title: "Average Rating",
      value: vendor.averageRating?.toFixed(1) || '0.0',
      icon: <BarChart3 size={24} />,
      color: "success",
      change: "+0.2"
    },
    {
      title: "Response Rate",
      value: `${Math.round((reviews.filter(r => r.vendorReply).length / reviews.length) * 100) || 0}%`,
      icon: <MessageSquare size={24} />,
      color: "info",
      change: "+8%"
    }
  ];

  const recentReviews = reviews.slice(0, 3);

  return (
    <div>
      <Row className="g-4 mb-5">
        {stats.map((stat, index) => (
          <Col md={6} lg={3} key={index}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`bg-${stat.color} bg-opacity-10 rounded-circle p-3`}>
                    <div className={`text-${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <Badge bg="light" text="success" className="fw-medium">
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="fw-bold text-dark mb-1">{stat.value}</h3>
                <p className="text-muted mb-0">{stat.title}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Reviews Preview */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <Star size={20} className="me-2 text-warning" />
            Recent Reviews
          </h5>
        </Card.Header>
        <Card.Body>
          {recentReviews.length === 0 ? (
            <div className="text-center py-4">
              <Star size={48} className="text-muted mb-3" />
              <h6 className="text-muted">No reviews yet</h6>
              <p className="text-muted mb-0">Customer reviews will appear here</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {recentReviews.map((review, index) => (
                <ListGroup.Item key={review.id} className="px-0 py-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1">{review.reviewerName}</h6>
                      <div className="d-flex align-items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? "text-warning fill-warning" : "text-muted"}
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                        <span className="ms-2 text-muted small">
                          {new Date(review.createdAt?._seconds * 1000 || review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {review.vendorReply && (
                      <Badge bg="success" className="d-flex align-items-center">
                        <CheckCircle size={12} className="me-1" />
                        Replied
                      </Badge>
                    )}
                  </div>
                  <p className="text-dark mb-0">"{review.comment}"</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

// Reviews Component
const VendorReviews = ({ reviews, onReplySubmitted }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) {
      addToast('warning', 'Please enter a reply message.');
      return;
    }

    setLoading(true);
    try {
      await reviewApi.addVendorReply(reviewId, replyText.trim());
      addToast('success', 'Reply submitted successfully!');
      setReplyingTo(null);
      setReplyText('');
      onReplySubmitted();
    } catch (error) {
      addToast('danger', error.message || 'Failed to submit reply.');
    } finally {
      setLoading(false);
    }
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
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-5">
        <Star size={48} className="text-muted mb-3" />
        <h5 className="text-muted">No reviews yet</h5>
        <p className="text-muted">Customer reviews will appear here once they start reviewing your business.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Customer Reviews ({reviews.length})</h5>
        <Badge bg="light" text="dark" className="fw-medium">
          {Math.round((reviews.filter(r => r.vendorReply).length / reviews.length) * 100)}% Response Rate
        </Badge>
      </div>

      <ListGroup variant="flush">
        {reviews.map((review) => (
          <ListGroup.Item key={review.id} className="px-0 py-4 border-bottom">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-2">
                  <h6 className="fw-bold mb-0 me-3">{review.reviewerName}</h6>
                  {renderStars(review.rating)}
                  <span className="ms-2 text-muted small">
                    {new Date(review.createdAt?._seconds * 1000 || review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-dark mb-0 fs-6">"{review.comment}"</p>
              </div>
            </div>

            {review.vendorReply ? (
              <Card className="border-0 bg-light mt-3">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <strong className="text-primary">Your Response</strong>
                    <Badge bg="success" className="d-flex align-items-center">
                      <CheckCircle size={12} className="me-1" />
                      Replied
                    </Badge>
                  </div>
                  <p className="text-dark mb-0">{review.vendorReply.text}</p>
                  <small className="text-muted">
                    {new Date(review.vendorReply.timestamp?._seconds * 1000 || review.vendorReply.timestamp).toLocaleDateString()}
                  </small>
                </Card.Body>
              </Card>
            ) : (
              replyingTo === review.id ? (
                <div className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Your Response</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a professional response to this review..."
                      className="border-2"
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleReplySubmit(review.id)}
                      disabled={loading || !replyText.trim()}
                      className="d-flex align-items-center"
                    >
                      {loading ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <Send size={14} className="me-2" />
                      )}
                      Submit Response
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setReplyingTo(review.id)}
                  className="d-flex align-items-center"
                >
                  <MessageSquare size={14} className="me-2" />
                  Respond to Review
                </Button>
              )
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

// Profile Form Component
const VendorProfileForm = ({ vendor, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      colony: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    location: {
      latitude: '',
      longitude: ''
    },
    services: [],
    operatingHours: {},
    awards: [],
    establishmentDate: '',
    isOpen: true,
    profileImageFile: null,
    additionalImageFiles: []
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

  const categories = [
    'Food & Beverage', 'Retail', 'Services', 'Automotive', 'Healthcare', 
    'Education', 'Home Services', 'Beauty & Wellness', 'Other'
  ];

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  // Initialize form data when vendor prop changes
  useEffect(() => {
    if (vendor) {
      setFormData({
        businessName: vendor.businessName || '',
        description: vendor.description || '',
        category: vendor.category || '',
        contactEmail: vendor.contactEmail || '',
        contactPhone: vendor.contactPhone || '',
        address: {
          street: vendor.address?.street || '',
          colony: vendor.address?.colony || '',
          city: vendor.address?.city || '',
          state: vendor.address?.state || '',
          zipCode: vendor.address?.zipCode || '',
          country: vendor.address?.country || ''
        },
        location: {
          latitude: vendor.location?.latitude || '',
          longitude: vendor.location?.longitude || ''
        },
        services: vendor.services || [],
        operatingHours: vendor.operatingHours || daysOfWeek.reduce((acc, day) => {
          acc[day] = '9:00 AM - 5:00 PM';
          return acc;
        }, {}),
        awards: vendor.awards || [],
        establishmentDate: vendor.establishmentDate || '',
        isOpen: vendor.isOpen !== undefined ? vendor.isOpen : true,
        profileImageFile: null,
        additionalImageFiles: []
      });
    }
  }, [vendor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      address: { ...prev.address, [name]: value } 
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      location: { ...prev.location, [name]: value } 
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const handleAddService = () => {
    setFormData(prev => ({ 
      ...prev, 
      services: [...prev.services, { name: '', price: '', description: '' }] 
    }));
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      services: prev.services.filter((_, i) => i !== index) 
    }));
  };

  const handleAwardChange = (index, value) => {
    const newAwards = [...formData.awards];
    newAwards[index] = value;
    setFormData(prev => ({ ...prev, awards: newAwards }));
  };

  const handleAddAward = () => {
    setFormData(prev => ({ ...prev, awards: [...prev.awards, ''] }));
  };

  const handleRemoveAward = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      awards: prev.awards.filter((_, i) => i !== index) 
    }));
  };

  const handleOperatingHoursChange = (day, value) => {
    setFormData(prev => ({ 
      ...prev, 
      operatingHours: { ...prev.operatingHours, [day]: value } 
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImageFile: file }));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setFormData(prev => ({ ...prev, additionalImageFiles: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append basic fields
      data.append('businessName', formData.businessName);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('contactEmail', formData.contactEmail);
      data.append('contactPhone', formData.contactPhone);
      data.append('isOpen', formData.isOpen);
      data.append('establishmentDate', formData.establishmentDate);

      // Append complex objects as JSON
      data.append('address', JSON.stringify(formData.address));
      data.append('location', JSON.stringify(formData.location));
      data.append('services', JSON.stringify(formData.services));
      data.append('operatingHours', JSON.stringify(formData.operatingHours));
      data.append('awards', JSON.stringify(formData.awards));

      // Handle file uploads
      if (formData.profileImageFile) {
        data.append('profileImage', formData.profileImageFile);
      }
      
      formData.additionalImageFiles.forEach(file => {
        data.append('additionalImages', file);
      });

      await vendorApi.updateVendorProfile(data);
      addToast('success', 'Profile updated successfully!');
      onProfileUpdate();
    } catch (error) {
      addToast('danger', error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (geoLoc.latitude && geoLoc.longitude) {
      setFormData(prev => ({ 
        ...prev, 
        location: { 
          latitude: geoLoc.latitude, 
          longitude: geoLoc.longitude 
        } 
      }));
      addToast('success', 'Location fetched successfully!');
    }
  }, [geoLoc, addToast]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className="row g-4">
        {/* Basic Information */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h6 className="fw-bold mb-0 d-flex align-items-center">
                <Edit3 size={18} className="me-2 text-primary" />
                Basic Information
              </h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Business Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your business name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe your business"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Contact Email *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Mail size={16} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Contact Phone</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Phone size={16} />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Location Information */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h6 className="fw-bold mb-0 d-flex align-items-center">
                <MapPin size={18} className="me-2 text-primary" />
                Location Information
              </h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Street Address *</Form.Label>
                <Form.Control
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">City *</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.address.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">State *</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.address.state}
                      onChange={handleAddressChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">ZIP Code *</Form.Label>
                    <Form.Control
                      type="text"
                      name="zipCode"
                      value={formData.address.zipCode}
                      onChange={handleAddressChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Country *</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={formData.address.country}
                      onChange={handleAddressChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Label className="fw-medium d-flex align-items-center justify-content-between">
                  <span>GPS Coordinates</span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={getPosition}
                    disabled={geoLoading}
                    className="d-flex align-items-center"
                  >
                    <Navigation size={14} className="me-1" />
                    {geoLoading ? 'Getting...' : 'Auto-fill'}
                  </Button>
                </Form.Label>
                <Row>
                  <Col md={6}>
                    <Form.Control
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.location.latitude}
                      onChange={handleLocationChange}
                      required
                      placeholder="Latitude"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.location.longitude}
                      onChange={handleLocationChange}
                      required
                      placeholder="Longitude"
                    />
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Services Section */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 d-flex align-items-center">
                <Award size={18} className="me-2 text-primary" />
                Services Offered
              </h6>
              <Button variant="outline-primary" size="sm" onClick={handleAddService}>
                Add Service
              </Button>
            </Card.Header>
            <Card.Body>
              {formData.services.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <Award size={32} className="mb-2" />
                  <p>No services added yet</p>
                </div>
              ) : (
                formData.services.map((service, index) => (
                  <Card key={index} className="mb-3 border">
                    <Card.Body>
                      <Row className="g-3 align-items-center">
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Service Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={service.name}
                              onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                              placeholder="Service name"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Price ($)</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              value={service.price}
                              onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                              placeholder="0.00"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Description</Form.Label>
                            <Form.Control
                              type="text"
                              value={service.description}
                              onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                              placeholder="Service description"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={1}>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleRemoveService(index)}
                            className="w-100"
                            title="Remove service"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Submit Button */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                disabled={loading || geoLoading}
                className="px-5"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile Changes'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </div>
    </Form>
  );
};

export default VendorDashboardPage;