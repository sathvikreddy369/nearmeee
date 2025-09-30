import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { Search, Mail, MessageCircle, Book, Video, Phone } from 'lucide-react';

const SupportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const helpCategories = [
    {
      icon: <Book size={24} />,
      title: 'Knowledge Base',
      description: 'Browse our comprehensive documentation and guides',
      link: '#knowledge-base'
    },
    {
      icon: <Video size={24} />,
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides and tutorials',
      link: '#tutorials'
    },
    {
      icon: <MessageCircle size={24} />,
      title: 'Community Forum',
      description: 'Get help from our community of users and experts',
      link: '#forum'
    },
    {
      icon: <Mail size={24} />,
      title: 'Contact Support',
      description: 'Reach out to our support team for personalized help',
      link: '/contact'
    }
  ];

  const popularArticles = [
    {
      title: 'How to create a business account',
      category: 'Getting Started',
      readTime: '5 min read'
    },
    {
      title: 'Managing your business profile',
      category: 'Business Tools',
      readTime: '8 min read'
    },
    {
      title: 'Understanding analytics and insights',
      category: 'Analytics',
      readTime: '10 min read'
    },
    {
      title: 'Troubleshooting common issues',
      category: 'Troubleshooting',
      readTime: '6 min read'
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      {/* Hero Section */}
      <Row className="text-center mb-5">
        <Col lg={8} className="mx-auto">
          <h1 className="display-4 fw-bold text-dark mb-4">How can we help you?</h1>
          <p className="lead text-muted mb-4">
            Find answers to common questions, browse documentation, or contact our support team.
          </p>
          
          {/* Search Bar */}
          <div className="mb-5">
            <InputGroup size="lg" className="shadow-sm">
              <InputGroup.Text className="bg-white border-end-0">
                <Search size={20} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search for help articles, tutorials, or guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
              <Button variant="primary">Search</Button>
            </InputGroup>
          </div>
        </Col>
      </Row>

      {/* Help Categories */}
      <Row className="g-4 mb-5">
        {helpCategories.map((category, index) => (
          <Col key={index} lg={3} md={6}>
            <Card 
              className="border-0 shadow-sm h-100 text-center cursor-pointer"
              onClick={() => window.location.href = category.link}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body className="p-4">
                <div className="text-primary mb-3">
                  {category.icon}
                </div>
                <h5 className="fw-bold mb-3">{category.title}</h5>
                <p className="text-muted mb-0">{category.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Popular Articles */}
      <Row className="g-5">
        <Col lg={8}>
          <h3 className="fw-bold text-dark mb-4">Popular Help Articles</h3>
          <Row className="g-3">
            {popularArticles.map((article, index) => (
              <Col key={index} md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <Badge bg="light" text="dark" className="mb-2">{article.category}</Badge>
                    <h6 className="fw-bold text-dark mb-2">{article.title}</h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{article.readTime}</small>
                      <Button variant="link" size="sm" className="p-0 text-primary">
                        Read more →
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Support Options */}
        <Col lg={4}>
          <Card className="border-0 shadow-lg sticky-top" style={{ top: '120px' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold text-dark mb-4">Need Immediate Help?</h5>
              
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <Mail size={20} className="text-primary me-3" />
                  <div>
                    <h6 className="fw-bold mb-1">Email Support</h6>
                    <p className="text-muted mb-0">support@localhunt.com</p>
                    <small className="text-muted">Typically responds within 2 hours</small>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <Phone size={20} className="text-primary me-3" />
                  <div>
                    <h6 className="fw-bold mb-1">Phone Support</h6>
                    <p className="text-muted mb-0">+1 (555) 123-4567</p>
                    <small className="text-muted">Mon-Fri, 9AM-6PM EST</small>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <MessageCircle size={20} className="text-primary me-3" />
                  <div>
                    <h6 className="fw-bold mb-1">Live Chat</h6>
                    <p className="text-muted mb-0">Available 24/7</p>
                    <small className="text-muted">Click the chat icon in the corner</small>
                  </div>
                </div>
              </div>

              <Button variant="primary" className="w-100 mt-3" onClick={() => window.location.href = '/contact'}>
                Contact Support Team
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SupportPage;