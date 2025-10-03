import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Form, 
  Button, 
  Card, 
  Alert, 
  Spinner, 
  Row, 
  Col,
  ProgressBar,
  Badge,
  InputGroup,
  Modal
} from 'react-bootstrap';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Clock,
  Award,
  Image,
  Phone,
  Mail,
  Building,
  FileText,
  Navigation,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Zap,
  User 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import * as vendorApi from '../services/vendorApi';

const DEFAULT_HOURS = {
  monday: '9:00 AM - 5:00 PM',
  tuesday: '9:00 AM - 5:00 PM',
  wednesday: '9:00 AM - 5:00 PM',
  thursday: '9:00 AM - 5:00 PM',
  friday: '9:00 AM - 5:00 PM',
  saturday: '9:00 AM - 2:00 PM',
  sunday: 'Closed'
};

function VendorRegistrationPage() {
  const { userProfile, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerName: '', // <-- Owner Name
    businessName: '',
    description: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
    gstin: '', 
    address: {
      street: '',
      colony: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    location: {
      latitude: '',
      longitude: ''
    },
    services: [{ name: '', price: '', description: '' }],
    operatingHours: DEFAULT_HOURS,
    establishmentDate: '',
    awards: [''],
    profileImage: null,
    additionalImages: []
  });

  const [isGstRegistered, setIsGstRegistered] = useState(null);
  const [gstCheckValue, setGstCheckValue] = useState('');
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstVerificationError, setGstVerificationError] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('business');
  const [showPreview, setShowPreview] = useState(false);

  const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

  const categories = [
    'Food & Beverage', 'Retail', 'Services', 'Automotive', 
    'Healthcare', 'Education', 'Home Services', 'Beauty & Wellness', 'Other'
  ];

  const sections = [
    { id: 'business', title: 'Business Info', icon: Building, progress: 20 },
    { id: 'location', title: 'Location', icon: MapPin, progress: 40 },
    { id: 'services', title: 'Services', icon: FileText, progress: 60 },
    { id: 'hours', title: 'Operating Hours', icon: Clock, progress: 80 },
    { id: 'media', title: 'Media & Awards', icon: Image, progress: 100 }
  ];

  // Redirect if user is already a vendor or admin
  useEffect(() => {
    if (!loadingAuth && userProfile && (userProfile.role === 'vendor' || userProfile.role === 'admin')) {
      setMessage('You are already registered as a vendor. Redirecting to dashboard...');
      setTimeout(() => navigate('/vendor-dashboard'), 2000);
    }
  }, [userProfile, loadingAuth, navigate]);

  // Update location fields from geolocation
  useEffect(() => {
    if (geoLoc.latitude !== null && geoLoc.longitude !== null) {
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: geoLoc.latitude,
          longitude: geoLoc.longitude
        }
      }));
      setMessage('Location fetched successfully!');
    }
  }, [geoLoc]);

  // Calculate form completion progress
  useEffect(() => {
    let completed = 0;
    const total = 9; // Total required fields: +1 for ownerName

    if (formData.ownerName) completed++; 
    if (formData.businessName) completed++;
    if (formData.description) completed++;
    if (formData.category) completed++;
    if (formData.contactEmail) completed++;
    if (formData.address.street) completed++;
    if (formData.address.city) completed++;
    if (formData.location.latitude) completed++;
    if (formData.profileImage) completed++;
    
    setProgress(Math.min(100, Math.round((completed / total) * 100)));
  }, [formData, isGstRegistered]);

  const handleInputChange = (section, field, value) => {
    if (section === 'address') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (section === 'location') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleGSTCheck = async () => {
    if (!gstCheckValue.trim()) {
        setGstVerificationError('Please enter a GSTIN.');
        return;
    }
    setGstVerifying(true);
    setGstVerificationError('');
    setError('');

    try {
        const trimmedGstin = gstCheckValue.trim();
        const result = await vendorApi.checkGstin(trimmedGstin);
        
        const verifiedDetails = result.verifiedDetails;

        setFormData(prev => ({
            ...prev,
            // Autofill both names from API response
            businessName: verifiedDetails.businessName || prev.businessName,
            ownerName: verifiedDetails.ownerName || prev.ownerName, 
            gstin: trimmedGstin,
            // Address mapping logic would go here:
            // address: mapApiAddress(verifiedDetails.address) 
        }));
        
        setMessage(result.message || 'Business details autofilled successfully!');
        setIsGstRegistered(true);
    } catch (err) {
        setGstVerificationError(err.message || 'Verification failed. Check the GSTIN.');
    } finally {
        setGstVerifying(false);
    }
  };
  
  const handleGstRegistrationChoice = (choice) => {
    setIsGstRegistered(choice);
    if (!choice) {
        setFormData(prev => ({ ...prev, gstin: '' }));
        setGstVerificationError('');
    }
    if (!choice && activeSection === 'business') {
        nextSection(); 
    }
  };

  const handleAddService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', price: '', description: '' }]
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleAddAward = () => {
    setFormData(prev => ({
      ...prev,
      awards: [...prev.awards, '']
    }));
  };

  const handleAwardChange = (index, value) => {
    const newAwards = [...formData.awards];
    newAwards[index] = value;
    setFormData(prev => ({ ...prev, awards: newAwards }));
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
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile image must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      setError('Some images were too large (max 5MB each)');
    }
    setFormData(prev => ({ ...prev, additionalImages: validFiles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!formData.profileImage) {
      setError('A profile image is required');
      setLoading(false);
      return;
    }
    // Check both required names
    if (!formData.ownerName || !formData.businessName) {
      setError('Both Owner Name and Business Name are required.');
      setActiveSection('business');
      setLoading(false);
      return;
    }
    if (isGstRegistered === true && !formData.gstin) {
      setError('You selected GST registration, but the GSTIN is missing.');
      setLoading(false);
      return;
    }
    if (isGstRegistered === null) {
      setError('Please specify whether you are GST registered.');
      setActiveSection('business');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'address' || key === 'location' || key === 'services' || 
            key === 'operatingHours' || key === 'awards') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'profileImage' && key !== 'additionalImages') {
          submitData.append(key, formData[key]);
        }
      });
      // Append files
      submitData.append('profileImage', formData.profileImage);
      formData.additionalImages.forEach(file => {
        submitData.append('additionalImages', file);
      });

      await vendorApi.registerVendor(submitData);
      setMessage('Business registered successfully! Your listing is now public but marked for verification. Redirecting...');
      setTimeout(() => navigate('/vendor-dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const prevSection = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };
  
  // Render based on Auth/Role status (unmodified)
  if (loadingAuth || (userProfile && (userProfile.role === 'vendor' || userProfile.role === 'admin'))) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">
            {userProfile && (userProfile.role === 'vendor' || userProfile.role === 'admin')
              ? 'Redirecting to dashboard...'
              : 'Loading...'}
          </p>
        </div>
      </Container>
    );
  }

  if (!userProfile || userProfile.role !== 'user') {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center border-0 shadow-sm">
          <div className="py-4">
            <AlertCircle size={48} className="text-danger mb-3" />
            <h4>Access Restricted</h4>
            <p className="mb-3">You must be a regular user to register as a vendor.</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Return Home
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }
  
  // --- RENDER CONTENT ---
  const renderGSTSection = () => {
    if (isGstRegistered === null) {
        return (
            <Card className="text-center p-4 shadow-sm mb-4 bg-light border-0">
                <h5 className="mb-3 fw-bold">Are you a GST Registered Business?</h5>
                <p className="text-muted">This helps verify your business identity instantly (highest trust tier).</p>
                <div className="d-flex justify-content-center gap-3">
                    <Button variant="success" onClick={() => handleGstRegistrationChoice(true)}>
                        Yes, I am GST Registered
                    </Button>
                    <Button variant="outline-dark" onClick={() => handleGstRegistrationChoice(false)}>
                        No, I am a Small Vendor
                    </Button>
                </div>
            </Card>
        );
    }

    if (isGstRegistered === true) {
        return (
            <Card className="p-4 shadow-sm mb-4 border-primary border-3">
                <h5 className="fw-bold d-flex align-items-center mb-3 text-primary">
                    <FileCheck size={20} className="me-2" /> GST Verification
                </h5>
                <Row>
                    <Col md={8}>
                        <Form.Group>
                            <Form.Label className="fw-medium">GST Identification Number (GSTIN) *</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    value={gstCheckValue} 
                                    onChange={(e) => {
                                        setGstCheckValue(e.target.value);
                                        setFormData(prev => ({ ...prev, gstin: e.target.value })); 
                                        setGstVerificationError('');
                                    }}
                                    placeholder="e.g., 22AAAAA0000A1Z5"
                                    required
                                    size="lg"
                                    disabled={gstVerifying}
                                />
                                <Button 
                                    variant="primary" 
                                    onClick={handleGSTCheck} 
                                    disabled={gstVerifying || !gstCheckValue.trim()}
                                >
                                    {gstVerifying ? <Spinner animation="border" size="sm" /> : <Zap size={18} />}
                                </Button>
                            </InputGroup>
                            <Form.Text className="text-muted">
                                Click the Zap icon to auto-fill business name and owner details.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-center pt-md-4">
                        <Badge bg={formData.gstin ? "success" : "secondary"} className="fs-6 mt-3 mt-md-0">
                            {formData.gstin ? 'Checked' : 'Pending Check'}
                        </Badge>
                        <Button variant="link" size="sm" onClick={() => handleGstRegistrationChoice(null)}>
                            (Change)
                        </Button>
                    </Col>
                </Row>
                {gstVerificationError && <Alert variant="warning" className="mt-3">{gstVerificationError}</Alert>}
            </Card>
        );
    }
    
    // isGstRegistered === false
    return (
        <Card className="p-3 shadow-sm mb-4 border-info border-3 bg-light">
            <div className="d-flex justify-content-between align-items-center">
                <p className="mb-0 text-muted">Proceeding as **Small/Unregistered Vendor**. Both owner and business name are required.</p>
                <Button variant="link" size="sm" onClick={() => handleGstRegistrationChoice(null)}>
                    (Change)
                </Button>
            </div>
        </Card>
    );
  };
  
  
  // --- MAIN RENDER ---
  return (
    <>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xl={10}>
            {/* Header and Progress Bar */}
            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold text-dark mb-3">Register Your Business</h1>
              <p className="lead text-muted mb-4">
                Join our platform and reach more customers in your area
              </p>
              
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-medium text-dark">Registration Progress</span>
                    <Badge bg="primary" className="fs-6">{progress}%</Badge>
                  </div>
                  <ProgressBar 
                    now={progress} 
                    variant={progress < 50 ? "warning" : progress < 80 ? "info" : "success"}
                    className="mb-3"
                    style={{ height: '8px' }}
                  />
                  <div className="d-flex justify-content-between">
                    {sections.map((section, index) => (
                      <div 
                        key={section.id}
                        className={`text-center ${activeSection === section.id ? 'text-primary fw-bold' : 'text-muted'}`}
                        style={{ cursor: 'pointer', flex: 1 }}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <section.icon size={20} className="mb-1 d-block mx-auto" />
                        <small className="d-none d-md-block">{section.title}</small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <Card.Body className="p-0">
                <Form onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="danger" className="border-0 rounded-0 m-0">
                      <div className="d-flex align-items-center">
                        <AlertCircle size={20} className="me-2" />
                        {error}
                      </div>
                    </Alert>
                  )}
                  
                  {message && (
                    <Alert variant="success" className="border-0 rounded-0 m-0">
                      <div className="d-flex align-items-center">
                        <CheckCircle size={20} className="me-2" />
                        {message}
                      </div>
                    </Alert>
                  )}

                  {/* Business Information Section */}
                  {activeSection === 'business' && (
                    <div className="p-4">
                      <h4 className="fw-bold text-dark mb-4 d-flex align-items-center">
                        <Building size={24} className="me-2 text-primary" />
                        Business Information
                      </h4>
                      
                      {renderGSTSection()} 
                      
                      {isGstRegistered !== null && (
                      <Row className="g-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">**Owner/Proprietor Name** *</Form.Label>
                            <InputGroup size="lg">
                              <InputGroup.Text><User size={18} /></InputGroup.Text>
                              <Form.Control
                                type="text"
                                value={formData.ownerName}
                                onChange={(e) => handleInputChange('business', 'ownerName', e.target.value)}
                                placeholder="Legal Owner Name"
                                required
                              />
                            </InputGroup>
                            {isGstRegistered && formData.gstin && <Form.Text className="text-success">Autofilled from GST records. Please confirm.</Form.Text>}
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Business/Trade Name *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.businessName}
                              onChange={(e) => handleInputChange('business', 'businessName', e.target.value)}
                              placeholder="Enter your business name"
                              required
                              size="lg"
                            />
                            {isGstRegistered && formData.gstin && <Form.Text className="text-success">Autofilled from GST records. Please confirm.</Form.Text>}
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Category *</Form.Label>
                            <Form.Select
                              value={formData.category}
                              onChange={(e) => handleInputChange('business', 'category', e.target.value)}
                              required
                              size="lg"
                            >
                              <option value="">Select a category</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      )}
                      
                      {isGstRegistered !== null && (
                      <>
                      <Form.Group className="mt-4">
                        <Form.Label className="fw-medium">Business Description *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => handleInputChange('business', 'description', e.target.value)}
                          placeholder="Describe your business, services, and what makes you unique..."
                          required
                        />
                      </Form.Group>

                      <Row className="g-4 mt-2">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Contact Email *</Form.Label>
                            <InputGroup size="lg">
                              <InputGroup.Text>
                                <Mail size={18} />
                              </InputGroup.Text>
                              <Form.Control
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => handleInputChange('business', 'contactEmail', e.target.value)}
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Contact Phone</Form.Label>
                            <InputGroup size="lg">
                              <InputGroup.Text>
                                <Phone size={18} />
                              </InputGroup.Text>
                              <Form.Control
                                type="tel"
                                value={formData.contactPhone}
                                onChange={(e) => handleInputChange('business', 'contactPhone', e.target.value)}
                                placeholder="+91 (555) 123-4567"
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                      </>
                      )}
                    </div>
                  )}

                  {/* Location Section */}
                  {activeSection === 'location' && isGstRegistered !== null && (
                    <div className="p-4">
                      <h4 className="fw-bold text-dark mb-4 d-flex align-items-center">
                        <MapPin size={24} className="me-2 text-primary" />
                        Location Information
                      </h4>

                      <Row className="g-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Street Address *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.address.street}
                              onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                              required
                              size="lg"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-medium">Neighborhood/Colony</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.address.colony}
                              onChange={(e) => handleInputChange('address', 'colony', e.target.value)}
                              size="lg"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row className="g-4 mt-2">
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-medium">City *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.address.city}
                              onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-medium">State *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.address.state}
                              onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-medium">ZIP Code *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.address.zipCode}
                              onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="mt-4">
                        <Form.Label className="fw-medium d-flex justify-content-between align-items-center">
                          <span>GPS Coordinates *</span>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={getPosition}
                            disabled={geoLoading}
                            className="d-flex align-items-center"
                          >
                            <Navigation size={16} className="me-1" />
                            {geoLoading ? 'Locating...' : 'Auto-fill'}
                          </Button>
                        </Form.Label>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Control
                              type="number"
                              step="any"
                              placeholder="Latitude"
                              value={formData.location.latitude}
                              onChange={(e) => handleInputChange('location', 'latitude', e.target.value)}
                              required
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Control
                              type="number"
                              step="any"
                              placeholder="Longitude"
                              value={formData.location.longitude}
                              onChange={(e) => handleInputChange('location', 'longitude', e.target.value)}
                              required
                            />
                          </Col>
                        </Row>
                        <Form.Text className="text-muted">
                          Accurate coordinates help customers find your business easily.
                        </Form.Text>
                      </div>
                    </div>
                  )}

                  {/* Services Section */}
                  {activeSection === 'services' && isGstRegistered !== null && (
                    <div className="p-4">
                      <h4 className="fw-bold text-dark mb-4 d-flex align-items-center">
                        <FileText size={24} className="me-2 text-primary" />
                        Services Offered
                      </h4>

                      {formData.services.map((service, index) => (
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
                                  className="w-100 mt-4"
                                  title="Remove service"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}

                      <Button
                        variant="outline-primary"
                        onClick={handleAddService}
                        className="d-flex align-items-center"
                      >
                        <Plus size={18} className="me-2" />
                        Add Another Service
                      </Button>
                    </div>
                  )}

                  {/* Hours Section */}
                  {activeSection === 'hours' && isGstRegistered !== null && (
                      <div className="p-4">
                          <h4 className="fw-bold text-dark mb-4 d-flex align-items-center">
                            <Clock size={24} className="me-2 text-primary" />
                            Operating Hours
                          </h4>
                          {Object.keys(formData.operatingHours).map(day => (
                              <Form.Group as={Row} className="mb-3" key={day}>
                                  <Form.Label column sm="3" className="text-capitalize fw-medium">
                                      {day}
                                  </Form.Label>
                                  <Col sm="9">
                                      <Form.Control
                                          type="text"
                                          value={formData.operatingHours[day]}
                                          onChange={(e) => handleOperatingHoursChange(day, e.target.value)}
                                          placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                                      />
                                  </Col>
                              </Form.Group>
                          ))}
                      </div>
                  )}

                  {/* Media Section */}
                  {activeSection === 'media' && isGstRegistered !== null && (
                      <div className="p-4">
                          <h4 className="fw-bold text-dark mb-4 d-flex align-items-center">
                            <Image size={24} className="me-2 text-primary" />
                            Media & Awards
                          </h4>
                          
                          <Row className="g-4">
                              <Col md={6}>
                                  <Form.Group>
                                      <Form.Label className="fw-medium">Profile Image *</Form.Label>
                                      <Form.Control type="file" onChange={handleProfileImageChange} required={!formData.profileImage} />
                                      {formData.profileImage && <small className="text-success d-block mt-1">File selected: {formData.profileImage.name}</small>}
                                  </Form.Group>
                              </Col>
                              <Col md={6}>
                                  <Form.Group>
                                      <Form.Label className="fw-medium">Additional Images (Max 3)</Form.Label>
                                      <Form.Control type="file" multiple onChange={handleAdditionalImagesChange} />
                                      {formData.additionalImages.length > 0 && <small className="text-success d-block mt-1">{formData.additionalImages.length} file(s) selected.</small>}
                                  </Form.Group>
                              </Col>
                          </Row>
                          
                          <h5 className="fw-bold text-dark mt-5 mb-3 d-flex align-items-center">
                            <Award size={20} className="me-2 text-primary" />
                            Awards & Recognition
                          </h5>
                          {formData.awards.map((award, index) => (
                              <InputGroup className="mb-3" key={index}>
                                  <Form.Control
                                      type="text"
                                      value={award}
                                      onChange={(e) => handleAwardChange(index, e.target.value)}
                                      placeholder="e.g., Best Local Tailor 2023"
                                  />
                                  <Button 
                                      variant="outline-danger" 
                                      onClick={() => handleRemoveAward(index)}
                                      disabled={formData.awards.length === 1 && index === 0}
                                  >
                                      <Trash2 size={16} />
                                  </Button>
                              </InputGroup>
                          ))}
                          <Button variant="outline-primary" size="sm" onClick={handleAddAward}>
                              <Plus size={16} /> Add Award
                          </Button>
                      </div>
                  )}


                  {/* Navigation Buttons */}
                  <div className="border-top p-4 bg-light">
                    <Row className="g-3">
                      <Col>
                        {activeSection !== 'business' && (
                          <Button variant="outline-secondary" onClick={prevSection}>
                            Previous
                          </Button>
                        )}
                      </Col>
                      <Col className="text-end">
                        {activeSection !== 'media' && isGstRegistered !== null ? (
                          <Button variant="primary" onClick={nextSection}>
                            Next
                          </Button>
                        ) : activeSection === 'media' && isGstRegistered !== null ? (
                          <div className="d-flex gap-2 justify-content-end">
                            <Button 
                              variant="outline-primary" 
                              onClick={() => setShowPreview(true)}
                            >
                              Preview
                            </Button>
                            <Button 
                              variant="success" 
                              type="submit"
                              disabled={loading}
                              className="d-flex align-items-center"
                            >
                              {loading ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-2" />
                                  Registering...
                                </>
                              ) : (
                                'Register Business'
                              )}
                            </Button>
                          </div>
                        ) : (
                            <Button 
                                variant="primary" 
                                onClick={nextSection}
                                disabled={isGstRegistered === null}
                            >
                                Continue
                            </Button>
                        )}
                      </Col>
                    </Row>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Business Registration Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="fw-bold">{formData.businessName || 'Your Business Name'}</h5>
          <p className="text-muted">{formData.description || 'No description provided.'}</p>
          <p><strong>Proprietor/Owner:</strong> {formData.ownerName || 'N/A'}</p>
          <p><strong>GSTIN:</strong> {formData.gstin || 'N/A'}</p>
          <p><strong>Address:</strong> {formData.address.street}, {formData.address.city}, {formData.address.zipCode}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowPreview(false)}>
            Edit Details
          </Button>
          <Button variant="success" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Registering...' : 'Confirm Registration'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default VendorRegistrationPage;