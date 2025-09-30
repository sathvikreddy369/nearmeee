import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { BarChart3, Users, Target, Shield, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessSolutionsPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users size={32} />,
      title: 'Increased Visibility',
      description: 'Get discovered by thousands of potential customers in your area searching for your services.'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Business Insights',
      description: 'Access detailed analytics about your customers, reviews, and business performance.'
    },
    {
      icon: <Target size={32} />,
      title: 'Targeted Marketing',
      description: 'Reach the right customers with our advanced targeting and promotion tools.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Verified Trust',
      description: 'Build credibility with verified badges and authentic customer reviews.'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Growth Tools',
      description: 'Everything you need to grow your business, from booking systems to customer management.'
    },
    {
      icon: <Award size={32} />,
      title: 'Competitive Edge',
      description: 'Stand out from competitors with premium listings and featured placements.'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small businesses getting started',
      features: ['Basic Listing', 'Up to 5 Services', 'Customer Reviews', 'Basic Analytics'],
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: ['Enhanced Listing', 'Unlimited Services', 'Advanced Analytics', 'Promoted Listings', 'Priority Support'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For established businesses wanting maximum exposure',
      features: ['Premium Listing', 'Featured Placement', 'Custom Integrations', 'Dedicated Account Manager', 'API Access'],
      popular: false
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      {/* Hero Section */}
      <Row className="text-center mb-5">
        <Col lg={8} className="mx-auto">
          <Badge bg="primary" className="mb-3 px-3 py-2 fs-6">For Businesses</Badge>
          <h1 className="display-4 fw-bold text-dark mb-4">Grow Your Business with LocalHunt</h1>
          <p className="lead text-muted mb-4">
            Join thousands of successful local businesses using our platform to attract more customers, 
            increase revenue, and build lasting relationships with their community.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => navigate('/register-vendor')}
            className="px-5 py-3"
          >
            Get Started Today
          </Button>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="g-4 mb-5">
        <Col className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-4">Everything You Need to Succeed</h2>
        </Col>
      </Row>
      <Row className="g-4">
        {features.map((feature, index) => (
          <Col key={index} lg={4} md={6}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body className="p-4">
                <div className="text-primary mb-3">
                  {feature.icon}
                </div>
                <h5 className="fw-bold mb-3">{feature.title}</h5>
                <p className="text-muted mb-0">{feature.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pricing Section */}
      <Row className="g-5 mt-5">
        <Col className="text-center">
          <h2 className="fw-bold text-dark mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted lead mb-5">Choose the plan that works best for your business</p>
        </Col>
      </Row>
      <Row className="g-4 justify-content-center">
        {plans.map((plan, index) => (
          <Col key={index} lg={4} md={6}>
            <Card className={`border-0 shadow-lg h-100 ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="bg-primary text-white text-center py-2">
                  <small className="fw-bold">MOST POPULAR</small>
                </div>
              )}
              <Card.Body className="p-4 text-center">
                <h4 className="fw-bold text-dark mb-2">{plan.name}</h4>
                <div className="my-4">
                  <span className="h1 fw-bold text-dark">{plan.price}</span>
                  <span className="text-muted">{plan.period}</span>
                </div>
                <p className="text-muted mb-4">{plan.description}</p>
                <ul className="list-unstyled mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="mb-2">
                      <span className="text-success me-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.popular ? "primary" : "outline-primary"} 
                  className="w-100"
                  onClick={() => navigate('/register-vendor')}
                >
                  Get Started
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BusinessSolutionsPage;