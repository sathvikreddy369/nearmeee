import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Users, Target, Award, Heart, MapPin, TrendingUp } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { icon: <Users size={32} />, value: '10,000+', label: 'Happy Customers' },
    { icon: <MapPin size={32} />, value: '5,000+', label: 'Local Businesses' },
    { icon: <Award size={32} />, value: '50,000+', label: 'Reviews' },
    { icon: <TrendingUp size={32} />, value: '100+', label: 'Cities' }
  ];

  const values = [
    {
      icon: <Heart size={32} />,
      title: 'Community First',
      description: 'We believe in strengthening local communities by connecting people with trusted local businesses.'
    },
    {
      icon: <Target size={32} />,
      title: 'Quality Focus',
      description: 'Every business on our platform is verified to ensure you receive the best service possible.'
    },
    {
      icon: <Award size={32} />,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from user experience to customer support.'
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      {/* Hero Section */}
      <Row className="text-center mb-5">
        <Col lg={8} className="mx-auto">
          <Badge bg="primary" className="mb-3 px-3 py-2 fs-6">Our Story</Badge>
          <h1 className="display-4 fw-bold text-dark mb-4">About LocalHunt</h1>
          <p className="lead text-muted mb-4">
            We're on a mission to transform how people discover and connect with local businesses. 
            Founded in 2020, LocalHunt has grown from a simple idea into a thriving platform 
            that supports thousands of local businesses and serves millions of customers.
          </p>
        </Col>
      </Row>

      {/* Stats Section */}
      <Row className="g-4 mb-5">
        {stats.map((stat, index) => (
          <Col key={index} lg={3} md={6}>
            <Card className="border-0 shadow-sm text-center h-100">
              <Card.Body className="p-4">
                <div className="text-primary mb-3">
                  {stat.icon}
                </div>
                <h3 className="fw-bold text-dark">{stat.value}</h3>
                <p className="text-muted mb-0">{stat.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Mission & Vision */}
      <Row className="g-5 mb-5">
        <Col lg={6}>
          <div className="pe-lg-4">
            <h2 className="fw-bold text-dark mb-4">Our Mission</h2>
            <p className="text-muted mb-4">
              To create vibrant local economies by making it easy for people to discover 
              and support amazing local businesses in their communities.
            </p>
            <p className="text-muted">
              We believe that strong local businesses create strong communities, 
              and we're committed to providing the tools and platform to make that happen.
            </p>
          </div>
        </Col>
        <Col lg={6}>
          <div className="ps-lg-4">
            <h2 className="fw-bold text-dark mb-4">Our Vision</h2>
            <p className="text-muted mb-4">
              We envision a world where every local business has the opportunity to thrive, 
              and every customer can easily find the perfect service right in their neighborhood.
            </p>
            <p className="text-muted">
              Through technology, community, and innovation, we're building the future 
              of local commerce—one connection at a time.
            </p>
          </div>
        </Col>
      </Row>

      {/* Values Section */}
      <Row className="g-4">
        <Col className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-4">Our Values</h2>
        </Col>
      </Row>
      <Row className="g-4">
        {values.map((value, index) => (
          <Col key={index} lg={4} md={6}>
            <Card className="border-0 shadow-sm h-100 text-center">
              <Card.Body className="p-4">
                <div className="text-primary mb-3">
                  {value.icon}
                </div>
                <h5 className="fw-bold mb-3">{value.title}</h5>
                <p className="text-muted mb-0">{value.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AboutPage;