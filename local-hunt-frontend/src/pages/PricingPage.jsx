import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Check, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectFeaturesPage = () => {
  const navigate = useNavigate();

  const featuresList = [
    {
      icon: <Check size={20} className="text-success me-2" />,
      text: 'Search local businesses and services',
    },
    {
      icon: <Check size={20} className="text-success me-2" />,
      text: 'Read and submit user reviews and ratings',
    },
    {
      icon: <Check size={20} className="text-success me-2" />,
      text: 'Save your favorite spots for later',
    },
    {
      icon: <Check size={20} className="text-success me-2" />,
      text: 'Basic filtering options (e.g., category, rating)',
    },
    {
      icon: <Check size={20} className="text-success me-2" />,
      text: 'Community support and Q&A',
    },
    {
      icon: <Check size={20} className="text-success me-2" />,
      text: 'Mobile-friendly responsive design',
    }
  ];

  const faqs = [
    {
      question: 'What is the goal of this project?',
      answer: 'This is a college project developed to demonstrate skills in full-stack development, database management, and user interface design. We are building a functional prototype.'
    },
    {
      question: 'Is there any cost to use the platform?',
      answer: 'No, access to all features is currently **100% free**. As a student project, there are no plans for monetization or paid subscriptions.'
    },
    {
      question: 'How can I support the project?',
      answer: 'The best way to support us is by using the platform, testing its functions thoroughly, and providing honest feedback and bug reports to the development team.'
    },
    {
      question: 'What features are planned next?',
      answer: 'We are currently working on advanced search algorithms, user personalization, and adding more detailed business data fields.'
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      {/* Hero Section */}
      <Row className="text-center mb-5">
        <Col lg={8} className="mx-auto">
          <Badge bg="primary" className="mb-3 px-3 py-2 fs-6">College Project</Badge>
          <h1 className="display-4 fw-bold text-dark mb-4">Core Features & Project Scope</h1>
          <p className="lead text-muted mb-4">
            Welcome! This is a **free, non-commercial student project** built to demonstrate development skills. Start using the platform and help us improve with your feedback.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => navigate('/auth?tab=register')}
          >
            Start Exploring Now (It's Free!)
          </Button>
        </Col>
      </Row>

      {/* Main Features Section - Replaced Pricing Cards */}
      <Row className="g-4 justify-content-center mb-5 mt-5">
        <Col lg={6}>
            <Card className="border-0 shadow-lg h-100 p-4">
                <h3 className="fw-bold text-dark mb-4 text-center">What You Can Do</h3>
                <ul className="list-unstyled mb-0">
                    {featuresList.map((item, index) => (
                        <li key={index} className="d-flex align-items-start mb-3">
                            {item.icon}
                            <span>{item.text}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </Col>
      </Row>

      {/* --- */}

      {/* FAQ Section */}
      <Row className="g-5 mt-5">
        <Col lg={8} className="mx-auto">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-4">Frequently Asked Questions</h2>
          </div>
          <Row className="g-4">
            {faqs.map((faq, index) => (
              <Col key={index} md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold text-dark mb-3">{faq.question}</h6>
                    <p className="text-muted mb-0">{faq.answer}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* --- */}

      {/* CTA Section - Feedback Focused */}
      <Row className="text-center mt-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="p-5">
              <Users size={48} className="mb-3" />
              <h3 className="fw-bold mb-3">Your Feedback is Our Grade</h3>
              <p className="mb-4 opacity-75">
                Help us achieve success in our academic endeavor. Provide feedback on features, usability, or report any bugs you encounter.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button variant="light" size="lg" onClick={() => navigate('/contact')}>
                  Provide Feedback
                </Button>
                <Button variant="outline-light" size="lg" onClick={() => navigate('/support')}>
                  Report a Bug
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectFeaturesPage;