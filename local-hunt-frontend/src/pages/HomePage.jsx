import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Filter,
  Shield,
  Star,
  FileCheck,
  UserCheck,
  ArrowRight,
  Users,
  Zap,
  BarChart3,
  TrendingUp,
  Sun,
  Thermometer,
  CloudRain
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
  const [locationInput, setLocationInput] = useState('');
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Enhanced categories with images and seasonal tags
  const categories = [
    { 
      name: 'AC Repair', 
      image: '/ac-repair.jpg?w=200&h=200&fit=crop',
      query: 'AC Repair',
      seasonal: 'summer',
      description: 'Stay cool this summer'
    },
    { 
      name: 'Electricians', 
      image: '/electricwork.webp',
      query: 'Electricians',
      description: 'Power solutions anytime'
    },
    { 
      name: 'Plumbers', 
      image: 'plumber.webp',
      query: 'Plumbers',
      description: 'Fix leaks & installations'
    },
    { 
      name: 'Home Cleaning', 
      image: 'home-service.jpeg?w=200&h=200&fit=crop',
      query: 'Home Cleaning',
      description: 'Sparkling clean homes'
    },
    { 
      name: 'Mobile Repair', 
      image: 'mobile-repair.jpeg?w=200&h=200&fit=crop',
      query: 'Mobile Repair',
      description: 'Quick phone fixes'
    },
    { 
      name: 'Carpenters', 
      image: '/carpentry.jpeg',
      query: 'Carpenters',
      description: 'Custom furniture & repairs'
    },
    { 
      name: 'Geyser Repair', 
      image: 'geyserservice.jpeg?w=200&h=200&fit=crop',
      query: 'Geyser Repair',
      seasonal: 'winter',
      description: 'Hot water all winter'
    },
    { 
      name: 'Kirana Stores', 
      image: 'kirana.jpg?w=200&h=200&fit=crop',
      query: 'Kirana Stores',
      description: 'Daily essentials'
    },
    { 
      name: 'Tailor Service', 
      image: 'tailorservice.jpg?w=200&h=200&fit=crop',
      query: 'Tailor Service',
      description: 'Tailoring & alterations'
    },
    { 
      name: 'Computer Peripherals', 
      image: 'computer.jpeg?w=200&h=200&fit=crop',
      query: 'Computer and laptops',
      description: 'Computer repairs & sales'
    },
    { 
      name: 'Pet Care', 
      image: 'petcare.webp?w=200&h=200&fit=crop',
      query: 'Pet Care',
      description: 'Pet Care & grooming'
    },
    { 
      name: 'Medical Stores', 
      image: 'medicalstore.avif?w=200&h=200&fit=crop',
      query: 'Medical Stores',
      description: 'Medicines & health supplies'
    },
  ];

  // Seasonal categories
  const seasonalCategories = [
    {
      season: 'Summer',
      icon: <Sun size={24} />,
      image: 'summerseason.jpeg?w=600&auto=format&fit=crop',
      services: ['AC Repair', 'Cooler Services', 'Cold Drinks', 'Swimming Pools'],
      description: 'Beat the heat with essential summer services'
    },
    {
      season: 'Winter',
      icon: <Thermometer size={24} />,
      image: 'winterseason.webp?w=600&auto=format&fit=crop',
      services: ['Geyser Repair', 'Heater Services', 'Woolen Clothing', 'Hot Food'],
      description: 'Stay warm and comfortable this winter'
    },
    {
      season: 'Monsoon',
      icon: <CloudRain size={24} />,
      image: 'rainy.jpeg?w=600&auto=format&fit=crop',
      services: ['Waterproofing', 'Umbrella Repair', 'Car Cleaning', 'Pest Control'],
      description: 'Rain-ready services for the monsoon'
    }
  ];

  // Trending services
  const trendingServices = [
    { 
      name: 'Salon at Home', 
      image: 'serviceathome.jpg?w=400&h=600&fit=crop',
      query: 'Salon at Home'
    },
    { 
      name: 'Appliance Repair', 
      image: 'appliancerepair.jpg?w=400&h=600&fit=crop',
      query: 'Appliance Repair'
    },
    { 
      name: 'Birthday Party', 
      image: 'birthdayparty.jpg?w=400&h=600&fit=crop',
      query: 'Birthday Party Organizers'
    },
    { 
      name: 'Pest Control', 
      image: 'pestcontrol.jpg?w=400&h=600&fit=crop',
      query: 'Pest Control'
    },
    { 
      name: 'House Painting', 
      image: 'housepainting.webp?w=400&h=600&fit=crop',
      query: 'House Painting'
    },
    { 
      name: 'Geyser Service', 
      image: 'geyserservice.webp?w=400&h=600&fit=crop',
      query: 'Geyser Service'
    },
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
      icon: <Users size={32} />,
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
        setLoading(true);
        const [featured, reviews] = await Promise.all([
          vendorApi.getAllVendors({ 
            limit: 6, 
            sortBy: 'averageRating',
            minRating: 4.0 
          }),
          //reviewApi.getRecentReviews({ limit: 3 })
        ]);
        setFeaturedVendors(featured || []);
        //setRecentReviews(reviews || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setFeaturedVendors([]);
        setRecentReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() || locationInput.trim()) {
      navigate('/vendors', { 
        state: { 
          searchTerm: searchTerm.trim(),
          location: locationInput.trim()
        } 
      });
    }
  };

  const handleCategoryClick = (category) => {
    navigate('/vendors', { 
      state: { searchTerm: category.query } 
    });
  };

  const handleSeasonalServiceClick = (service) => {
    navigate('/vendors', { 
      state: { searchTerm: service } 
    });
  };

  const handleUseMyLocation = async () => {
    try {
      await getPosition();
      if (userLocation.latitude && userLocation.longitude) {
        setLocationInput('Current Location');
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
    navigate('/vendor-success-hub');
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
      userAvatar: 'woman1.jpeg?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 2,
      userName: 'Rahul Verma', 
      serviceType: 'Mobile Repair',
      rating: 4,
      comment: 'Good service at reasonable prices. My phone was fixed within an hour. Will use again.',
      createdAt: new Date().toISOString(),
      userAvatar: 'man1.jpg?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 3,
      userName: 'Anita Patel',
      serviceType: 'Tailor',
      rating: 5,
      comment: 'Perfect stitching and on-time delivery. The tailor understood exactly what I wanted.',
      createdAt: new Date().toISOString(),
      userAvatar: 'woman2.jpg?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return (
    <div className="homepage-modern">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="hero-content text-center">
                <p className="hero-subtitle">Find Trusted Local Services on <span className="brand-name-hero">Nearమీ</span></p>
                <Card className="search-main-card">
                  <Card.Body className="p-3 p-md-4">
                    <Form onSubmit={handleSearch}>
                      <Row className="g-2 g-md-3 align-items-end">
                        <Col md={5}>
                          <Form.Label className="form-label-small">What service do you need?</Form.Label>
                          <InputGroup className="search-input-main">
                            <InputGroup.Text className="search-icon">
                              <Search size={20} />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Electrician, Plumber, AC Repair..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="search-input"
                            />
                          </InputGroup>
                        </Col>
                        <Col md={4}>
                          <Form.Label className="form-label-small">Where?</Form.Label>
                          <InputGroup className="search-input-main">
                            <InputGroup.Text className="location-icon">
                              <MapPin size={20} />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Enter your area or colony..."
                              value={locationInput}
                              onChange={(e) => setLocationInput(e.target.value)}
                              className="search-input"
                            />
                          </InputGroup>
                        </Col>
                        <Col md={3}>
                          <Button 
                            variant="primary" 
                            type="submit" 
                            className="search-btn-main w-100 mt-3 mt-md-0"
                            disabled={!searchTerm.trim() && !locationInput.trim()}
                          >
                            <Search size={20} className="me-2" />
                            Find Services
                          </Button>
                        </Col>
                      </Row>
                      <Row className="mt-3">
                        <Col>
                          <div className="d-flex gap-2 flex-wrap justify-content-center">
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
                                  Use My Location
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

                <div className="quick-actions mt-4">
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
          <div className="section-header">
            <h2>Popular Services in Your City</h2>
            <p>Choose from our most requested and trusted services</p>
          </div>

          <Row className="g-3">
            {categories.slice(0, 12).map((category, index) => (
              <Col key={category.name} xs={6} sm={4} md={3} lg={3} xl={2}>
                <div 
                  className="category-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-image-container">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="category-image"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/200x200/667eea/ffffff?text=${category.name}`;
                      }}
                    />
                    {category.seasonal && (
                      <div className={`seasonal-badge ${category.seasonal}`}>
                        {category.seasonal === 'summer' ? 'Summer' : 'Winter'}
                      </div>
                    )}
                  </div>
                  <div className="category-content">
                    <div className="category-name">{category.name}</div>
                    <div className="category-description">{category.description}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Trending Services */}
      <section className="trending-section">
        <Container>
          <div className="section-header">
            <h2>Trending Now</h2>
            <p>Check out what's popular with our users this week</p>
          </div>
          <Row className="g-4">
            {trendingServices.map((service, index) => (
              <Col key={index} lg={2} md={4} xs={6}>
                <div 
                  className="trending-card"
                  onClick={() => navigate(`/vendors?search=${service.query}`)}
                >
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="trending-card-image"
                  />
                  <div className="trending-card-overlay">
                    <h5 className="trending-card-title">{service.name}</h5>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Seasonal Services */}
      <section className="seasonal-section">
        <Container>
          <div className="section-header">
            <h2>Seasonal Services</h2>
            <p>Right services for the right season</p>
          </div>

          <Row className="g-4">
            {seasonalCategories.map((season, index) => (
              <Col key={season.season} md={4}>
                <div className="seasonal-card" style={{ backgroundImage: `url(${season.image})` }}>
                  <div className="seasonal-card-overlay">
                  <div className="seasonal-header">
                    <div className="seasonal-icon">
                      {season.icon}
                    </div>
                    <h4 className="text-white">{season.season}</h4>
                  </div>
                  <p className="seasonal-description">{season.description}</p>
                  <div className="seasonal-services">
                    {season.services.map((service, serviceIndex) => (
                      <span 
                        key={serviceIndex}
                        className="service-tag"
                        onClick={() => handleSeasonalServiceClick(service)}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
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
          <div className="section-header">
            <h2>Why Choose Verified Professionals?</h2>
            <p>Your safety and satisfaction are our top priorities</p>
          </div>

          <Row className="g-4">
            {trustIndicators.map((indicator, index) => (
              <Col key={index} md={6} lg={3}>
                <div className="trust-card">
                  <div className="trust-icon">
                    {indicator.icon}
                  </div>
                  <h4>{indicator.title}</h4>
                  <p>{indicator.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Recent Reviews */}
      <section className="reviews-section">
        <Container>
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Real reviews from satisfied customers across India</p>
          </div>

          <Row className="g-3">
            {displayReviews.map((review, index) => (
              <Col key={review.id} lg={4} md={6}>
                <div className="review-card">
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
          <div className="section-header">
            <h2>Perfect Platform for Local Businesses</h2>
            <p>Grow your business and reach more customers in your area</p>
          </div>

          <Row className="g-4">
            {growthFeatures.map((feature, index) => (
              <Col key={index} md={6} lg={3}>
                <div className="growth-feature">
                  <div className="growth-icon">
                    {feature.icon}
                  </div>
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                </div>
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
                <h2>Top Rated Local Services</h2>
                <p>Highly recommended by customers in your area</p>
              </div>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/vendors')}
                className="view-all-btn d-none d-md-flex"
              >
                View All
                <ArrowRight size={16} className="ms-2" />
              </Button>
            </div>

            <Row className="g-3">
              {featuredVendors.slice(0, 6).map((vendor, index) => (
                <Col key={vendor.id} xs={12} sm={6} lg={4}>
                  <VendorCard vendor={vendor} />
                </Col>
              ))}
            </Row>
            
            <div className="text-center mt-4 d-md-none">
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/vendors')}
                className="view-all-btn"
              >
                View All Services
                <ArrowRight size={16} className="ms-2" />
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* Vendor Guide CTA */}
      <section className="vendor-guide-cta">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="guide-card">
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
          <div className="cta-content">
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
                variant="outline-light" 
                size="lg"
                onClick={() => navigate('/register-vendor')}
                className="cta-btn-outline"
              >
                <Users size={20} className="me-2" />
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