// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { resetPassword } from '../services/authApi';

function ResetPasswordPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Firebase reset links use 'oobCode' parameter
  const oobCode = searchParams.get('oobCode');
  const apiKey = searchParams.get('apiKey');
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing reset code. Please request a new password reset.');
    }
  }, [oobCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!oobCode) {
      setError('Invalid reset code. Please request a new password reset.');
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Both password fields are required.');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(oobCode, formData.newPassword);
      
      setSuccess(true);
      addToast('success', 'Password reset successfully! You can now log in.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // If this is a Firebase reset link, show appropriate message
  const isFirebaseLink = mode === 'resetPassword' && apiKey;

  if (!oobCode && !isFirebaseLink) {
    return (
      <Container className="auth-page-container py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="auth-card border-0 shadow-lg">
              <Card.Body className="p-4 p-md-5 text-center">
                <Alert variant="danger" className="mb-4">
                  <strong>Invalid Reset Link</strong>
                  <br />
                  This password reset link is invalid or has expired.
                </Alert>
                
                <Button 
                  as={Link} 
                  to="/forgot-password" 
                  variant="primary"
                  className="me-3"
                >
                  Request New Reset Link
                </Button>
                
                <Button 
                  as={Link} 
                  to="/auth" 
                  variant="outline-primary"
                >
                  Back to Login
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

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
                  <Lock size={32} className="text-primary" />
                </div>
                <h3 className="fw-bold text-dark mb-2">Create New Password</h3>
                <p className="text-muted mb-0">
                  {success 
                    ? 'Password reset successful! Redirecting to login...'
                    : 'Enter your new password below'
                  }
                </p>
                
                {isFirebaseLink && (
                  <Alert variant="info" className="mt-3 small">
                    <strong>Firebase Reset Link Detected</strong>
                    <br />
                    Please enter your new password to complete the reset process.
                  </Alert>
                )}
              </div>

              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              
              {success ? (
                <div className="text-center">
                  <Alert variant="success" className="mb-4">
                    <strong>Success!</strong>
                    <br />
                    Your password has been reset successfully.
                  </Alert>
                  
                  <div className="d-grid">
                    <Button 
                      as={Link} 
                      to="/auth"
                      variant="primary"
                      className="py-2"
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        required
                        className="py-3 pe-5"
                      />
                      <Button
                        variant="link"
                        className="position-absolute top-50 end-0 translate-middle-y text-muted p-1"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">Confirm New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        required
                        className="py-3 pe-5"
                      />
                      <Button
                        variant="link"
                        className="position-absolute top-50 end-0 translate-middle-y text-muted p-1"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
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
                          Resetting Password...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPasswordPage;