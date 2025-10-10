import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Cookie, Shield, Settings, Eye } from 'lucide-react';

const CookiePolicyPage = () => {
  const lastUpdated = "October 10, 2025";

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      purpose: 'They are usually only set in response to actions made by you such as logging in or filling in forms.',
      examples: ['Session management', 'Security features', 'Load balancing']
    },
    {
      name: 'Performance Cookies',
      description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
      purpose: 'They help us to know which pages are the most and least popular and see how visitors move around the site.',
      examples: ['Google Analytics', 'Page load times', 'Error tracking']
    },
    {
      name: 'Functional Cookies',
      description: 'These cookies enable the website to provide enhanced functionality and personalization.',
      purpose: 'They may be set by us or by third party providers whose services we have added to our pages.',
      examples: ['Language preferences', 'Region settings', 'Customized content']
    },
    {
      name: 'Targeting Cookies',
      description: 'These cookies may be set through our site by our advertising partners.',
      purpose: 'They may be used by those companies to build a profile of your interests and show you relevant ads on other sites.',
      examples: ['Social media cookies', 'Advertising networks', 'Retargeting']
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Header */}
          <div className="text-center mb-5">
            <Cookie size={48} className="text-primary mb-3" />
            <h1 className="display-4 fw-bold text-dark mb-3">Cookie Policy</h1>
            <p className="text-muted lead mb-3">
              Last updated: {lastUpdated}
            </p>
            <p className="text-muted">
              This Cookie Policy explains how Nearమీ uses cookies and similar technologies to recognize you when you visit our website.
            </p>
          </div>

          {/* Introduction */}
          <Card className="border-0 shadow-sm mb-5">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">What Are Cookies?</h3>
              <p className="text-muted mb-0">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
                Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
                as well as to provide reporting information.
              </p>
            </Card.Body>
          </Card>

          {/* Cookie Types */}
          <div className="mb-5">
            <h3 className="fw-bold text-dark mb-4">Types of Cookies We Use</h3>
            <Row className="g-4">
              {cookieTypes.map((cookie, index) => (
                <Col key={index} lg={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-start mb-3">
                        <Shield size={20} className="text-primary me-3 mt-1" />
                        <h5 className="fw-bold text-dark mb-2">{cookie.name}</h5>
                      </div>
                      <p className="text-muted mb-3">{cookie.description}</p>
                      <h6 className="fw-semibold text-dark mb-2">Purpose:</h6>
                      <p className="text-muted mb-3">{cookie.purpose}</p>
                      <h6 className="fw-semibold text-dark mb-2">Examples:</h6>
                      <ul className="text-muted mb-0">
                        {cookie.examples.map((example, idx) => (
                          <li key={idx}>{example}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Cookie Management */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start mb-3">
                <Settings size={24} className="text-primary me-3" />
                <h3 className="fw-bold text-dark">Managing Cookies</h3>
              </div>
              <p className="text-muted mb-3">
                Most web browsers allow you to control cookies through their settings preferences. However, 
                limiting cookies may impact your experience and the functionality of our website.
              </p>
              <div className="row g-3">
                <Col md={6}>
                  <h6 className="fw-semibold text-dark mb-2">Browser Settings</h6>
                  <p className="text-muted mb-0">
                    You can usually find cookie settings in the "Options" or "Preferences" menu of your browser.
                  </p>
                </Col>
                <Col md={6}>
                  <h6 className="fw-semibold text-dark mb-2">Opt-out Tools</h6>
                  <p className="text-muted mb-0">
                    Various third parties offer browser plug-ins and apps that can help manage cookies.
                  </p>
                </Col>
              </div>
            </Card.Body>
          </Card>

          {/* Your Choices */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start mb-3">
                <Eye size={24} className="text-primary me-3" />
                <h3 className="fw-bold text-dark">Your Cookie Choices</h3>
              </div>
              <p className="text-muted mb-3">
                When you first visit our website, you will be presented with a cookie banner where you can 
                choose which types of cookies you accept. You can change your preferences at any time.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button variant="primary" onClick={() => {
                  // This would typically open your cookie preference center
                  console.log('Open cookie settings');
                }}>
                  Manage Cookie Preferences
                </Button>
                <Button variant="outline-primary" onClick={() => {
                  // This would typically reject all non-essential cookies
                  console.log('Reject all cookies');
                }}>
                  Reject Non-Essential Cookies
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Contact */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">Contact Us</h3>
              <p className="text-muted mb-0">
                If you have any questions about our use of cookies, please contact us through our contact page.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CookiePolicyPage;