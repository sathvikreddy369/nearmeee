import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Clock,
  Shield,
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Heart,
  ShieldCheck,
  FileText,
  Handshake,
  Calendar,
  ThumbsUp
} from 'lucide-react';
import VendorCard from '../components/vendors/VendorCard';
import * as vendorApi from '../services/vendorApi';
import useGeolocation from '../hooks/useGeolocation';
import '../styles/HomePage.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function HomePage() {
  const navigate = useNavigate();
  const { location: userLocation, getPosition, loading: geoLoading } = useGeolocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [vendors, setVendors] = useState([]);
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Categories with fixed images
  const categories = [
    { 
      name: 'Electricians', 
      icon: '⚡', 
      query: 'Electricians',
      image: 'electrician.webp'
    },
    { 
      name: 'Mobile Repair', 
      icon: '📱', 
      query: 'Mobile Repair',
      image: '/mobilerepair1.jpg'
    },
    { 
      name: 'Tailors', 
      icon: '🧵', 
      query: 'Tailors',
      image: '/tailor.png'
    },
    { 
      name: 'Carpenters', 
      icon: '🪚', 
      query: 'Carpenters',
      image: 'carpentry.jpeg'
    },
    { 
      name: 'Plumbers', 
      icon: '🔧', 
      query: 'Plumbers',
      image: 'plumber.webp'
    },
    { 
      name: 'Kirana Stores', 
      icon: '🛒', 
      query: 'Kirana Stores',
      image: 'kirana.jpg'
    }
  ];

  // Floating Reviews Data
  const floatingReviews = [
    {
      id: 1,
      name: 'Priya Sharma',
      service: 'Electrician',
      rating: 5,
      time: '2 hours ago',
      avatar: '/woman1.jpeg'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      service: 'Mobile Repair',
      rating: 4,
      time: '1 hour ago',
      avatar: '/man1.jpg'
    },
    {
      id: 3,
      name: 'Anita Patel',
      service: 'Tailor',
      rating: 5,
      time: '30 minutes ago',
      avatar: '/woman2.jpg'
    }
  ];

  // Verification Badges Explanation
  const verificationBadges = [
    {
      icon: <ShieldCheck size={24} />,
      title: 'ID Verified',
      description: 'Government ID verification completed'
    },
    {
      icon: <FileText size={24} />,
      title: 'Background Check',
      description: 'Criminal background verification done'
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Skill Verified',
      description: 'Professional skills and experience verified'
    },
    {
      icon: <Award size={24} />,
      title: 'Top Rated',
      description: 'Consistently high customer ratings'
    }
  ];

  // Safety Guidelines
  const safetyGuidelines = [
    'Always verify vendor credentials before hiring',
    'Check customer reviews and ratings',
    'Discuss pricing and scope clearly upfront',
    'Prefer digital payments for safety',
    'Keep family informed about service visits',
    'Report any suspicious behavior immediately'
  ];

  // Privacy Features
  const privacyFeatures = [
    'Your personal data is encrypted and secure',
    'We never share your contact without permission',
    'Secure payment processing',
    'Anonymous rating system',
    'Data deletion on request'
  ];

  // Small Business Success Stories
  const successStories = [
    {
      name: 'Raj Electric Works',
      owner: 'Raj Kumar',
      story: 'Increased customer base by 300% in 6 months',
      image: '/electricwork.webp'
    },
    {
      name: 'CPR-Cell Phone repair',
      owner: 'Sunil Patel',
      story: 'Now serving 50+ customers daily',
      image: '/mobilerepairstore.jpg'
    },
    {
      name: 'Perfect Stitch Tailors',
      owner: 'Meena Sharma',
      story: 'Expanded to 3 locations across city',
      image: '/tailorservice.jpg'
    }
  ];

  // Community Partnerships
  const communityPartners = [
    { name: 'Local Trade Association', logo: '🏛️' },
    { name: 'Women Entrepreneur Network', logo: '👩‍💼' },
    { name: 'Skill Development Council', logo: '🎓' },
    { name: 'Consumer Protection Group', logo: '🛡️' }
  ];

  // Vendor Selection Tips
  const vendorTips = [
    'Check ratings and read recent reviews',
    'Verify experience and specialization',
    'Compare multiple quotes',
    'Ask for references or portfolio',
    'Ensure proper licensing and insurance',
    'Discuss warranty and after-service support'
  ];

  // Seasonal Services
  const seasonalServices = [
    {
      season: 'Monsoon',
      services: ['Waterproofing', 'Electrical Checkup', 'Plumbing Repair'],
      icon: '🌧️'
    },
    {
      season: 'Summer',
      services: ['AC Service', 'Cooler Repair', 'Refrigerator Maintenance'],
      icon: '☀️'
    },
    {
      season: 'Winter',
      services: ['Heater Repair', 'Geyser Service', 'Home Insulation'],
      icon: '❄️'
    },
    {
      season: 'Festive',
      services: ['Home Cleaning', 'Painting', 'Electrical Decoration'],
      icon: '🎉'
    }
  ];

  const fetchVendors = useCallback(async (params) => {
    setLoading(true);
    setError('');
    setSearchPerformed(true);
    try {
      const fetchedVendors = await vendorApi.getAllVendors(params);
      setVendors(fetchedVendors);
    } catch (err) {
      setError(err.message || 'Failed to fetch vendors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const featured = await vendorApi.getAllVendors({ 
          limit: 6, 
          sortBy: 'averageRating',
          minRating: 4.0 
        });
        setFeaturedVendors(featured);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchVendors({ search: searchTerm, colony: location });
    }
  };

  const handleCategoryClick = (category) => {
    setSearchTerm(category.name);
    fetchVendors({ category: category.query });
  };

  const handleUseMyLocation = async () => {
    try {
      await getPosition();
      if (userLocation.latitude && userLocation.longitude) {
        setLocation('Current Location');
        fetchVendors({ lat: userLocation.latitude, lon: userLocation.longitude });
      }
    } catch (error) {
      setError('Unable to access your location. Please enable location services.');
    }
  };

  return (
    <div className="homepage-comprehensive">
      {/* Header Banner */}
      <div className="header-banner">
        <Container>
          <div className="banner-content">
            <div className="app-badge">
              <span className="badge-text">India's Most Trusted Local Services Platform</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Search Section */}
      <section className="hero-search-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="hero-content text-center">
                <h1 className="hero-title">
                  Find Trusted Local Services Near You
                </h1>
                <p className="hero-subtitle">
                  Connect with verified electricians, plumbers, tailors, and more in your neighborhood
                </p>

                <Card className="search-main-card">
                  <Card.Body className="p-4">
                    <Form onSubmit={handleSearch}>
                      <Row className="g-2 align-items-center">
                        <Col md={5}>
                          <InputGroup className="search-input-main">
                            <InputGroup.Text className="search-icon">
                              <Search size={20} />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="What service are you looking for?"
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
                              placeholder="Enter your location"
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
                            className="search-btn-main w-100"
                          >
                            <Search size={20} className="me-2" />
                            Search
                          </Button>
                        </Col>
                      </Row>
                    </Form>

                    <div className="location-quick-actions mt-3">
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
                            Use My Current Location
                          </>
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <Container>
          <div className="section-header">
            <h2>Popular Services</h2>
            <p>Find trusted local professionals for all your needs</p>
          </div>

          <Row className="g-3">
            {categories.map((category, index) => (
              <Col key={category.name} xs={6} sm={4} md={3} lg={2}>
                <div 
                  className="category-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-image">
                    <img src={category.image} alt={category.name} />
                    <div className="category-overlay">
                      <span className="category-emoji">{category.icon}</span>
                    </div>
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

      {/* Trust & Safety Section */}
      <section className="trust-safety-section">
        <Container>
          <div className="section-header">
            <h2>Your Safety is Our Priority</h2>
            <p>We ensure every service provider meets our strict verification standards</p>
          </div>

          <Row className="g-4">
            <Col lg={6}>
              <div className="verification-section">
                <h4>Verification Badges</h4>
                <Row className="g-3">
                  {verificationBadges.map((badge, index) => (
                    <Col key={index} sm={6}>
                      <div className="verification-badge">
                        <div className="badge-icon">
                          {badge.icon}
                        </div>
                        <div className="badge-content">
                          <h6>{badge.title}</h6>
                          <p>{badge.description}</p>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>

            <Col lg={6}>
              <div className="safety-guidelines">
                <h4>Safety Guidelines</h4>
                <div className="guidelines-list">
                  {safetyGuidelines.map((guideline, index) => (
                    <div key={index} className="guideline-item">
                      <CheckCircle size={16} className="text-success me-2" />
                      <span>{guideline}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="privacy-features mt-4">
                <h4>Privacy Protection</h4>
                <div className="privacy-list">
                  {privacyFeatures.map((feature, index) => (
                    <div key={index} className="privacy-item">
                      <Shield size={16} className="text-primary me-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Success Stories */}
      <section className="success-stories-section">
        <Container>
          <div className="section-header">
            <h2>Small Business Success Stories</h2>
            <p>Helping local entrepreneurs grow their businesses</p>
          </div>

          <Row className="g-4">
            {successStories.map((story, index) => (
              <Col key={index} lg={4} md={6}>
                <Card className="success-story-card">
                  <div className="story-image">
                    <img src={story.image} alt={story.name} />
                  </div>
                  <Card.Body>
                    <h5>{story.name}</h5>
                    <p className="story-owner">By {story.owner}</p>
                    <p className="story-text">{story.story}</p>
                    <div className="success-badge">
                      <TrendingUp size={16} className="me-1" />
                      Success Story
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Community & Vendor Tips */}
      <section className="community-tips-section">
        <Container>
          <Row className="g-5">
            <Col lg={6}>
              <div className="community-partners">
                <h4>Community Partnerships</h4>
                <p className="section-subtitle">Working together to build stronger local communities</p>
                <div className="partners-grid">
                  {communityPartners.map((partner, index) => (
                    <div key={index} className="partner-item">
                      <span className="partner-logo">{partner.logo}</span>
                      <span className="partner-name">{partner.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <div className="vendor-tips">
                <h4>How to Choose the Right Vendor</h4>
                <div className="tips-list">
                  {vendorTips.map((tip, index) => (
                    <div key={index} className="tip-item">
                      <div className="tip-number">{index + 1}</div>
                      <div className="tip-content">
                        <span>{tip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Seasonal Services */}
      <section className="seasonal-services-section">
        <Container>
          <div className="section-header">
            <h2>Seasonal Service Recommendations</h2>
            <p>Right services at the right time for your needs</p>
          </div>

          <Row className="g-4">
            {seasonalServices.map((season, index) => (
              <Col key={index} lg={3} md={6}>
                <Card className="seasonal-card">
                  <Card.Body>
                    <div className="season-icon">
                      <span className="season-emoji">{season.icon}</span>
                    </div>
                    <h5>{season.season} Season</h5>
                    <div className="season-services">
                      {season.services.map((service, sIndex) => (
                        <div key={sIndex} className="service-item">
                          <CheckCircle size={14} className="text-success me-2" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Vendors */}
      {featuredVendors.length > 0 && (
        <section className="featured-vendors-section">
          <Container>
            <div className="section-header with-action">
              <div>
                <h2>Featured Local Businesses</h2>
                <p>Highly rated and trusted by customers</p>
              </div>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/discover')}
                className="view-all-btn"
              >
                View All
                <ArrowRight size={16} className="ms-2" />
              </Button>
            </div>

            <Row className="g-4">
              {featuredVendors.map((vendor) => (
                <Col key={vendor.id} xs={12} sm={6} lg={4}>
                  <VendorCard vendor={vendor} />
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* Search Results */}
      {searchPerformed && (
        <section className="search-results-section">
          <Container>
            <div className="section-header">
              <h2>Search Results</h2>
              {vendors.length > 0 && (
                <p>Found {vendors.length} businesses for "{searchTerm}"</p>
              )}
            </div>

            {loading && (
              <div className="loading-state">
                <Spinner animation="border" variant="primary" />
                <p>Searching for local businesses...</p>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="error-alert">
                {error}
              </Alert>
            )}

            {!loading && !error && vendors.length === 0 && (
              <div className="no-results">
                <Search size={48} className="no-results-icon" />
                <h4>No businesses found</h4>
                <p>Try different keywords or browse categories</p>
              </div>
            )}

            {!loading && vendors.length > 0 && (
              <Row className="g-4">
                {vendors.map((vendor) => (
                  <Col key={vendor.id} xs={12} sm={6} lg={4}>
                    <VendorCard vendor={vendor} />
                  </Col>
                ))}
              </Row>
            )}
          </Container>
        </section>
      )}

      {/* Floating Reviews */}
      <div className="floating-reviews-container">
        {floatingReviews.map((review, index) => (
          <div 
            key={review.id} 
            className="floating-review"
            style={{ animationDelay: `${index * 2}s` }}
          >
            <div className="floating-review-content">
              <img src={review.avatar} alt={review.name} className="floating-avatar" />
              <div className="floating-review-text">
                <div className="floating-reviewer">
                  <strong>{review.name}</strong>
                  <Badge bg="success" className="verified-floating">
                    Verified
                  </Badge>
                </div>
                <div className="floating-service">Found a {review.service}</div>
                <div className="floating-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      fill={i < review.rating ? "#ffc107" : "none"} 
                      color={i < review.rating ? "#ffc107" : "#ddd"} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <section className="footer-cta-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h3>Ready to Find Your Perfect Service Provider?</h3>
              <p>Join thousands of satisfied customers who found trusted local services</p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/discover')}
              >
                <Search size={20} className="me-2" />
                Explore All Services
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default HomePage;