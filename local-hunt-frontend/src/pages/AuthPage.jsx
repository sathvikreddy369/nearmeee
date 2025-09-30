import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Nav, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  signupWithEmailAndPassword, 
  loginWithEmailAndPassword, 
  registerUserProfileInBackend,
  signInWithGoogle,
  deleteUserAccount
} from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Shield,
  MapPin
} from 'lucide-react';

import '../styles/AuthPage.css';

function AuthPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Calculate password strength
    if (password) {
      let strength = 0;
      if (password.length >= 6) strength += 1;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const validateForm = () => {
    if (activeTab === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!name.trim()) {
        setError('Please enter your full name');
        return false;
      }
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    let tempUser = null;

    try {
      if (activeTab === 'login') {
        await loginWithEmailAndPassword(email, password);
        addToast('success', 'Welcome back! Login successful.');
        navigate('/dashboard');
      } else {
        tempUser = await signupWithEmailAndPassword(email, password);
        
        try {
          await registerUserProfileInBackend(tempUser.uid, email, name.trim(), 'user');
          addToast('success', 'Welcome to Nearమీ! Your account has been created.');
          navigate('/dashboard');
        } catch (profileError) {
          console.error('Profile creation failed, deleting auth user:', profileError);
          await deleteUserAccount();
          throw new Error('Account creation failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      let errorMessage = err.message || 'An unexpected error occurred.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
        setActiveTab('login');
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up.';
        setActiveTab('signup');
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      addToast('danger', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      addToast('success', 'Successfully signed in with Google!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google sign-in error:', err);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google sign-in was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      addToast('danger', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordStrength(0);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearForm();
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#e9ecef';
    if (passwordStrength <= 2) return '#dc3545';
    if (passwordStrength <= 3) return '#fd7e14';
    if (passwordStrength <= 4) return '#20c997';
    return '#198754';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const renderForm = () => (
    <Form onSubmit={handleFormSubmit} className="auth-form">
      {activeTab === 'signup' && (
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label className="form-label">Full Name</Form.Label>
          <div className="input-group-auth">
            <User size={20} className="input-icon" />
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="auth-input"
              disabled={loading}
            />
          </div>
        </Form.Group>
      )}
      
      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label className="form-label">Email Address</Form.Label>
        <div className="input-group-auth">
          <Mail size={20} className="input-icon" />
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
            disabled={loading}
          />
        </div>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label className="form-label">
          Password
          {activeTab === 'signup' && (
            <span className="text-muted ms-1">(min. 6 characters)</span>
          )}
        </Form.Label>
        <div className="input-group-auth">
          <Lock size={20} className="input-icon" />
          <Form.Control
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
            disabled={loading}
            minLength={6}
          />
          <Button
            variant="link"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>

        {activeTab === 'signup' && password && (
          <div className="password-strength mt-2">
            <div className="strength-bar">
              <div 
                className="strength-progress"
                style={{
                  width: `${(passwordStrength / 5) * 100}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}
              ></div>
            </div>
            <div className="strength-text">
              <small style={{ color: getPasswordStrengthColor() }}>
                {getPasswordStrengthText()}
              </small>
            </div>
          </div>
        )}
      </Form.Group>

      {activeTab === 'signup' && (
        <Form.Group className="mb-4" controlId="formConfirmPassword">
          <Form.Label className="form-label">Confirm Password</Form.Label>
          <div className="input-group-auth">
            <Lock size={20} className="input-icon" />
            <Form.Control
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="auth-input"
              disabled={loading}
              minLength={6}
            />
            <Button
              variant="link"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              type="button"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>
          
          {password && confirmPassword && (
            <div className="password-match mt-2">
              {password === confirmPassword ? (
                <div className="match-success">
                  <CheckCircle size={16} className="me-1" />
                  <small>Passwords match</small>
                </div>
              ) : (
                <div className="match-error">
                  <XCircle size={16} className="me-1" />
                  <small>Passwords don't match</small>
                </div>
              )}
            </div>
          )}
        </Form.Group>
      )}

      {error && (
        <Alert variant="danger" className="auth-alert">
          <div className="d-flex align-items-center">
            <XCircle size={18} className="me-2" />
            {error}
          </div>
        </Alert>
      )}

      <Button 
        variant="primary" 
        type="submit" 
        className="w-100 auth-submit-btn py-3 mb-3" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" className="me-2" />
            {activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}
          </>
        ) : (
          <>
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight size={18} className="ms-2" />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="divider my-4">
        <span className="divider-text">or continue with</span>
      </div>

      {/* Google Sign In */}
      <Button
        variant="outline-primary"
        className="w-100 google-signin-btn py-3 mb-3"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
      >
        {googleLoading ? (
          <Spinner as="span" animation="border" size="sm" className="me-2" />
        ) : (
          <img 
            src="/google-icon.svg" 
            alt="Google" 
            className="google-icon me-2"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        {googleLoading ? 'Connecting...' : 'Continue with Google'}
      </Button>

      {/* Switch Auth Mode */}
      <div className="text-center switch-auth">
        {activeTab === 'login' ? (
          <p className="text-muted mb-0">
            Don't have an account?{' '}
            <Button 
              variant="link" 
              className="switch-link p-0"
              onClick={() => handleTabChange('signup')}
            >
              Sign up here
            </Button>
          </p>
        ) : (
          <p className="text-muted mb-0">
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="switch-link p-0"
              onClick={() => handleTabChange('login')}
            >
              Sign in here
            </Button>
          </p>
        )}
      </div>
    </Form>
  );

  return (
    <div className="auth-page-modern">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-4">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            {/* Header */}
            <div className="text-center mb-4">
              <div className="auth-logo mb-3">
                <MapPin size={48} className="text-primary mb-2" />
                <h1 className="fw-bold text-dark mb-2">Nearమీ</h1>
              </div>
              <p className="auth-subtitle">
                {activeTab === 'login' 
                  ? 'Welcome back! Sign in to your account' 
                  : 'Join LocalVendor and discover amazing local businesses'
                }
              </p>
            </div>

            <Card className="auth-card-modern border-0 shadow-lg">
              <Card.Header className="auth-card-header p-0 border-0">
                <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabChange} className="auth-tabs-modern">
                  <Nav.Item>
                    <Nav.Link eventKey="login" className="auth-tab-link">
                      Sign In
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="signup" className="auth-tab-link">
                      Sign Up
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              
              <Card.Body className="auth-card-body p-4 p-md-5">
                {renderForm()}
              </Card.Body>
            </Card>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted auth-footer">
                By continuing, you agree to our{' '}
                <a href="/terms" className="footer-link">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="footer-link">Privacy Policy</a>
              </small>
              
              {/* Security Badge */}
              <div className="security-badge mt-3">
                <Shield size={14} className="me-1" />
                <small className="text-muted">Your data is securely encrypted</small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AuthPage;