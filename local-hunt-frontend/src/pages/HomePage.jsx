import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Filter,
  Shield,
  CheckCircle,
  Users,
  Star,
  TrendingUp,
  FileCheck,
  UserCheck,
  ArrowRight,
  Zap,
  Users as UsersIcon,
  BarChart3,
  MessageCircle,
  Award,
  Clock,
  ThumbsUp
} from 'lucide-react';
import VendorCard from '../components/vendors/VendorCard';
import * as vendorApi from '../services/vendorApi';
import * as reviewApi from '../services/reviewApi';
import useGeolocation from '../hooks/useGeolocation';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { location: userLocation, getPosition, loading: geoLoading } = useGeolocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Categories with enhanced data
  const categories = [
    { name: 'Electricians', icon: '⚡', query: 'Electricians' },
    { name: 'Mobile Repair', icon: '📱', query: 'Mobile Repair' },
    { name: 'Tailors', icon: '🧵', query: 'Tailors' },
    { name: 'Plumbers', icon: '🔧', query: 'Plumbers' },
    { name: 'Carpenters', icon: '🪚', query: 'Carpenters' },
    { name: 'Kirana Stores', icon: '🛒', query: 'Kirana Stores' },
    { name: 'AC Repair', icon: '❄️', query: 'AC Repair' },
    { name: 'Home Cleaning', icon: '🧹', query: 'Home Cleaning' }
  ];

  // Trust indicators
  const trustIndicators = [
    {
      icon: <FileCheck size={32} />,
      title: 'Government ID Verified',
      description: 'Every professional verifies their identity with government-approved documents'
    },
    {
      icon: <UserCheck size={32} />,
      title: 'Background Checked',
      description: 'Comprehensive background verification for your safety and peace of mind'
    },
    {
      icon: <Star size={32} />,
      title: 'Customer Rated',
      description: 'Real ratings and reviews from thousands of satisfied customers'
    },
    {
      icon: <Shield size={32} />,
      title: 'Service Guarantee',
      description: 'Quality assured services with customer satisfaction guarantee'
    }
  ];

  // Business growth features
  const growthFeatures = [
    {
      icon: <UsersIcon size={32} />,
      title: 'Perfect for Home Makers',
      description: 'Start your home-based business and serve your local community'
    },
    {
      icon: <Zap size={32} />,
      title: 'Small Business Growth',
      description: 'Expand your customer base and grow your local business'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Cloud Workspaces',
      description: 'Manage your business online and reach more customers digitally'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Business Expansion',
      description: 'Scale your services across multiple locations with our platform'
    }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [featured, reviews] = await Promise.all([
          vendorApi.getAllVendors({ 
            limit: 6, 
            sortBy: 'averageRating',
            minRating: 4.0 
          }),
          reviewApi.getRecentReviews({ limit: 3 })
        ]);
        setFeaturedVendors(featured);
        setRecentReviews(reviews);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/vendors', { 
        state: { searchTerm, location } 
      });
    }
  };

  const handleCategoryClick = (category) => {
    navigate('/vendors', { 
      state: { searchTerm: category.query } 
    });
  };

  const handleUseMyLocation = async () => {
    try {
      await getPosition();
      if (userLocation.latitude && userLocation.longitude) {
        setLocation('Current Location');
        navigate('/vendors', { 
          state: { useCurrentLocation: true } 
        });
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleMoreFilters = () => {
    navigate('/vendors');
  };

  const handleDiscoverAll = () => {
    navigate('/vendors');
  };

  const handleVendorGuide = () => {
    navigate('/vendor-guide');
  };

  // Mock reviews if API doesn't return any
  const displayReviews = recentReviews.length > 0 ? recentReviews : [
    {
      id: 1,
      userName: 'Priya Sharma',
      serviceType: 'Electrician',
      rating: 5,
      comment: 'Excellent service! The electrician was professional and completed the work quickly. Highly recommended!',
      createdAt: new Date().toISOString(),
      userAvatar: '/woman1.jpeg'
    },
    {
      id: 2,
      userName: 'Rahul Verma', 
      serviceType: 'Mobile Repair',
      rating: 4,
      comment: 'Good service at reasonable prices. My phone was fixed within an hour. Will use again.',
      createdAt: new Date().toISOString(),
      userAvatar: '/man1.jpg'
    },
    {
      id: 3,
      userName: 'Anita Patel',
      serviceType: 'Tailor',
      rating: 5,
      comment: 'Perfect stitching and on-time delivery. The tailor understood exactly what I wanted.',
      createdAt: new Date().toISOString(),
      userAvatar: '/woman2.jpg'
    }
  ];

  return (
    <div className="homepage-modern">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="hero-content text-center fade-in-up">
                <h1 className="hero-title">
                  Find Trusted Local Services<br />in Your Neighborhood
                </h1>
                {/* <p className="hero-subtitle">
                  Connect with government ID verified, background checked professionals<br />
                  for all your home service needs. Safety and quality guaranteed.
                </p> */}

                <Card className="search-main-card floating-element">
                  <Card.Body className="p-4">
                    <Form onSubmit={handleSearch}>
                      <Row className="g-3 align-items-end">
                        <Col md={5}>
                          <InputGroup className="search-input-main">
                            <InputGroup.Text className="search-icon">
                              <Search size={20} />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Electrician, Plumber, Tailor..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="search-input"
                            />
                          </InputGroup>
                        </Col>
                        <Col md={4}>
                          <InputGroup className="search-input-main">
                            <InputGroup.Text className="location-icon">
                              <MapPin size={20} />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Enter your colony or area..."
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className="search-input"
                            />
                          </InputGroup>
                        </Col>
                        <Col md={3}>
                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="search-btn-main"
                          >
                            <Search size={20} className="me-2" />
                            Find Services
                          </Button>
                        </Col>
                      </Row>
                      <Row className="mt-3">
                        <Col>
                          <div className="d-flex gap-2 flex-wrap">
                            <Button
                              variant="outline-primary"
                              onClick={handleUseMyLocation}
                              disabled={geoLoading}
                              className="location-btn"
                              size="sm"
                            >
                              {geoLoading ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                                  Locating...
                                </>
                              ) : (
                                <>
                                  <MapPin size={16} className="me-2" />
                                  Use Current Location
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline-primary"
                              onClick={handleMoreFilters}
                              className="more-filters-btn"
                              size="sm"
                            >
                              <Filter size={16} className="me-2" />
                              More Filters
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>

                <div className="quick-actions">
                  <Button 
                    variant="outline-light" 
                    onClick={handleDiscoverAll}
                    className="discover-all-btn"
                  >
                    <ArrowRight size={18} className="me-2" />
                    Discover All Services
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Popular Services */}
      <section className="categories-section">
        <Container>
          <div className="section-header fade-in-up">
            <h2>Popular Services in Your City</h2>
            <p>Choose from our most requested and trusted services</p>
          </div>

          <Row className="g-4">
            {categories.map((category, index) => (
              <Col key={category.name} xs={6} sm={4} md={3} lg={2}>
                <div 
                  className="category-card fade-in-up"
                  onClick={() => handleCategoryClick(category)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>
                  <div className="category-name">
                    {category.name}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Trust Indicators */}
      <section className="trust-section">
        <Container>
          <div className="section-header fade-in-up">
            <h2>Why Choose Verified Professionals?</h2>
            <p>Your safety and satisfaction are our top priorities</p>
          </div>

          <div className="trust-grid">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="trust-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="trust-icon">
                  {indicator.icon}
                </div>
                <h4>{indicator.title}</h4>
                <p>{indicator.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      

      {/* Recent Reviews */}
      <section className="reviews-section">
        <Container>
          <div className="section-header fade-in-up">
            <h2>What Our Customers Say</h2>
            <p>Real reviews from satisfied customers across India</p>
          </div>

          <Row className="g-4">
            {displayReviews.map((review, index) => (
              <Col key={review.id} lg={4} md={6}>
                <div className="review-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="review-header">
                    <img 
                      src={review.userAvatar} 
                      alt={review.userName}
                      className="review-avatar"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${review.userName}&background=667eea&color=fff`;
                      }}
                    />
                    <div className="reviewer-info">
                      <h5>{review.userName}</h5>
                      <div className="reviewer-service">{review.serviceType}</div>
                    </div>
                  </div>
                  <div className="review-content">
                    "{review.comment}"
                  </div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        size={16}
                        fill={i < review.rating ? "#ffc107" : "none"}
                        color={i < review.rating ? "#ffc107" : "#ddd"}
                      />
                    ))}
                    <span className="ms-2 text-muted">{review.rating}.0</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Business Growth Section */}
      <section className="business-growth-section">
        <Container>
          <div className="section-header fade-in-up">
            <h2>Perfect Platform for Local Businesses</h2>
            <p>Grow your business and reach more customers in your area</p>
          </div>

          <div className="growth-features">
            {growthFeatures.map((feature, index) => (
              <div key={index} className="growth-feature fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="growth-icon">
                  {feature.icon}
                </div>
                <h5>{feature.title}</h5>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Vendors */}
      {featuredVendors.length > 0 && (
        <section className="categories-section">
          <Container>
            <div className="section-header with-action d-flex justify-content-between align-items-center">
              <div>
                <h2>Top Rated Local Services</h2>
                <p>Highly recommended by customers in your area</p>
              </div>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/vendors')}
                className="view-all-btn"
              >
                View All
                <ArrowRight size={16} className="ms-2" />
              </Button>
            </div>

            <Row className="g-4">
              {featuredVendors.slice(0, 6).map((vendor, index) => (
                <Col key={vendor.id} xs={12} sm={6} lg={4}>
                  <div className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <VendorCard vendor={vendor} />
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* Vendor Guide CTA */}
      <section className="vendor-guide-cta">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="guide-card fade-in-up">
                <h3>Want to List Your Business?</h3>
                <p>
                  Not sure how to get started? We'll guide you through the entire process - 
                  from registration to verification and getting your first customers.
                </p>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleVendorGuide}
                  className="guide-btn"
                >
                  <Users size={20} className="me-2" />
                  Learn How to Get Listed
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <Container>
          <div className="cta-content fade-in-up">
            <h2>Ready to Find Your Perfect Service Professional?</h2>
            <p>Join millions of satisfied customers who trust us for their home service needs</p>
            <div className="cta-buttons">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/vendors')}
                className="cta-btn-primary"
              >
                <Search size={20} className="me-2" />
                Explore All Services
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/register-vendor')}
                className="cta-btn-outline growbusiness"
              >
                <Users size={20} className="me-2 growbusiness" />
                Grow Your Business
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default HomePage;