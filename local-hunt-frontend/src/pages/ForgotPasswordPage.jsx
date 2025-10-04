// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { forgotPassword } from '../services/authApi';

function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      addToast('warning', 'Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      // This now uses Firebase Client SDK directly
      await forgotPassword(email);
      setSuccess(true);
      addToast('success', 'Password reset email sent! Check your inbox and spam folder.');
    } catch (error) {
      addToast('danger', error.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-page-container py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="auth-card border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              {/* Back to Login */}
              <div className="mb-4">
                <Link to="/auth" className="text-decoration-none d-flex align-items-center text-muted">
                  <ArrowLeft size={18} className="me-2" />
                  Back to Login
                </Link>
              </div>

              {/* Header */}
              <div className="text-center mb-4">
                <div className="auth-icon-container bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                  <Mail size={32} className="text-primary" />
                </div>
                <h3 className="fw-bold text-dark mb-2">Reset Your Password</h3>
                <p className="text-muted mb-0">
                  {success 
                    ? 'Check your email for reset instructions'
                    : 'Enter your email to receive a password reset link'
                  }
                </p>
              </div>

              {success ? (
                <div className="text-center">
                  <Alert variant="success" className="mb-4">
                    <strong>Check your email!</strong>
                    <br />
                    We've sent a password reset link to <strong>{email}</strong>
                    <br />
                    <small className="text-muted">
                      Don't forget to check your spam folder if you don't see it.
                    </small>
                  </Alert>
                  
                  <div className="d-grid gap-3">
                    <Button 
                      variant="primary" 
                      as={Link} 
                      to="/auth"
                      className="py-2"
                    >
                      Return to Login
                    </Button>
                    
                    <Button 
                      variant="outline-primary" 
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                      }}
                      className="py-2"
                    >
                      Send Another Reset Link
                    </Button>
                  </div>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="py-3"
                    />
                    <Form.Text className="text-muted">
                      Enter the email address associated with your account.
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      className="py-3 fw-semibold"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Sending Reset Link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </div>
                </Form>
              )}

              {/* Additional Help */}
              <div className="text-center mt-4">
                <small className="text-muted">
                  Remember your password?{' '}
                  <Link to="/auth" className="text-primary text-decoration-none fw-semibold">
                    Back to Login
                  </Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPasswordPage;