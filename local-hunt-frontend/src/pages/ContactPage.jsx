import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import emailjs from 'emailjs-com';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replace with your EmailJS service details
      await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: 'your-email@gmail.com' // Your Gmail address
        },
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      setAlert({
        show: true,
        type: 'success',
        message: 'Message sent successfully! We\'ll get back to you within 24 hours.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to send message. Please try again or email us directly.'
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail size={24} />,
      title: 'Email Us',
      details: 'support@localhunt.com',
      description: 'Send us an email anytime'
    },
    {
      icon: <Phone size={24} />,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri from 9am to 6pm'
    },
    {
      icon: <MapPin size={24} />,
      title: 'Visit Us',
      details: '123 Business District, City, State 12345',
      description: 'Come say hello at our office'
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      <Row className="text-center mb-5">
        <Col lg={8} className="mx-auto">
          <h1 className="display-4 fw-bold text-dark mb-4">Get In Touch</h1>
          <p className="lead text-muted">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </Col>
      </Row>

      <Row className="g-5">
        {/* Contact Information */}
        <Col lg={4}>
          <div className="sticky-top" style={{ top: '120px' }}>
            <h3 className="fw-bold text-dark mb-4">Contact Information</h3>
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-0 shadow-sm mb-3">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start">
                    <div className="text-primary me-3">
                      {info.icon}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">{info.title}</h6>
                      <p className="text-dark mb-1">{info.details}</p>
                      <small className="text-muted">{info.description}</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
            
            <Card className="border-0 bg-light">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <Clock size={20} className="text-primary me-2" />
                  <div>
                    <h6 className="fw-bold mb-1">Response Time</h6>
                    <p className="text-muted mb-0">Typically within 24 hours</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>

        {/* Contact Form */}
        <Col lg={8}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <h3 className="fw-bold text-dark mb-4">Send us a Message</h3>
              
              {alert.show && (
                <Alert variant={alert.type} dismissible onClose={() => setAlert({ ...alert, show: false })}>
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mt-3">
                  <Form.Label className="fw-medium">Subject *</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this regarding?"
                  />
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="fw-medium">Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us how we can help you..."
                  />
                </Form.Group>

                <div className="mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="d-flex align-items-center"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="me-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;