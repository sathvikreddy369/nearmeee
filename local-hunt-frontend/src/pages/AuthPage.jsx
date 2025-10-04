import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Card, Nav, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  signupWithEmailAndPassword, 
  loginWithEmailAndPassword, 
  registerUserProfileInBackend,
  signInWithGoogle
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

// Inline SVG for Google Icon fallback (to prevent 404 errors)
const GoogleIconSvg = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 48 48" 
    width="20" 
    height="20"
    {...props}
  >
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,7.995-11.303,7.995 C13.582,36.083,8,30.505,8,23.995s5.582-12.088,12.792-12.088c3.06,0,5.734,1.08,7.954,2.835l5.657-5.657 C34.046,6.053,29.268,4,20.792,4C9.293,4,0,13.293,0,23.995c0,10.692,9.293,19.99,20.792,19.99 c11.303,0,18.049-8.528,18.049-17.962c0-1.344-0.125-2.285-0.344-3.291H43.611z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,17.448,13.864,20.792,13.864 c3.298,0,6.084,1.385,8.239,3.003l6.568-4.819C33.155,7.747,27.202,4,20.792,4C14.382,4,8.55,7.747,5.088,13.045z"/>
    <path fill="#4CAF50" d="M14.655,36.083c-1.354-2.585-2.029-5.321-2.029-7.995s0.675-5.41,2.029-7.995l6.571,4.819 C20.916,28.69,20.792,30.505,20.792,30.505s-2.001-0.076-2.001-0.076c-1.92,0-3.766-0.741-5.176-2.15l-6.571,4.819 C9.792,38.169,14.655,36.083,14.655,36.083z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.125,0.73-0.344,1.46-0.612,2.15l-6.568-4.819 c-2.155,1.618-4.941,3.003-8.239,3.003c-5.223,0-9.654-3.338-11.303-7.995l-6.571,4.819C10.702,42.508,18.049,43.989,24,43.989 c10.692,0,19.99-9.293,19.99-19.99C43.989,23.291,43.611,20.083,43.611,20.083z"/>
  </svg>
);

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
  
  // Combine password visibility into a single state object
  const [showPasswords, setShowPasswords] = useState({ 
    main: false, 
    confirm: false 
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Use useMemo for calculating strength only when password changes
  useMemo(() => {
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
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return false;
    }

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
        navigate('/'); 
      } else {
        // --- SIGNUP LOGIC ---
        
        // 1. Create user in Firebase Auth
        const authUser = await signupWithEmailAndPassword(email, password);
        tempUser = authUser;
        
        if (!tempUser || !tempUser.uid) {
            throw new Error('Failed to create authentication user.');
        }
        
        // ⚠️ NEW: Get the ID Token for the newly created user
        const idToken = await tempUser.getIdToken(); 

        try {
          // 2. Register profile in backend database (passing the ID Token)
          await registerUserProfileInBackend(tempUser.uid, email, name.trim(), 'user', idToken); 

          // 3. Success feedback and navigation
          addToast('success', 'Welcome to Nearమీ! Your account has been created.');
          navigate('/');
          
        } catch (profileError) {
          // 4. Handle backend failure by deleting Firebase Auth user
          console.error('Profile creation failed, deleting auth user:', profileError);
          // Delete the Firebase Auth user (Fixes orphaned auth accounts)
          await deleteUserAccount(tempUser); 
          
          // Throw the original error object for outer catch block
          throw profileError; 
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      let errorMessage = err.message || 'An unexpected error occurred.';
      
      // ⚠️ Use the err.code from the Firebase error object OR check for custom error messages
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please login instead.';
            setActiveTab('login');
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters long.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email. Please sign up.';
            setActiveTab('signup');
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          default:
            // Fallback to error message from auth service if available
            if (err.message && !errorMessage.includes('unexpected error')) {
                errorMessage = err.message.replace('Firebase: ', '');
            }
        }
      } else {
          // This handles custom errors thrown from registerUserProfileInBackend
          errorMessage = errorMessage.includes('Failed to register profile') 
              ? 'Error creating user profile in the database. The auth account was deleted. Please try again.'
              : errorMessage;
      }
      
      setError(errorMessage);
      addToast('danger', errorMessage);
    } finally {
      // Ensure loading state is always reset regardless of success or failure
      setLoading(false); 
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      
      // Check if this is a new user (first time Google sign-in)
      const isNewUser = result._tokenResponse?.isNewUser;
      
      if (isNewUser) {
        // New Google user - their profile should already be created by signInWithGoogle function
        addToast('success', 'Welcome to Nearమీ! Your account has been created with Google.');
      } else {
        // Existing Google user
        addToast('success', 'Welcome back! Google sign-in successful.');
      }
      
      navigate('/');
    } catch (err) {
      console.error('Google sign-in error:', err);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google sign-in was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but different sign-in method. Please use email/password to sign in.';
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
    setShowPasswords({ main: false, confirm: false });
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

  const getPasswordStrengthText = (strength) => {
    if (strength === 0) return 'Enter Password';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
              disabled={loading || googleLoading}
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
            disabled={loading || googleLoading}
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
            type={showPasswords.main ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
            disabled={loading || googleLoading}
            minLength={6}
          />
          <Button
            variant="link"
            className="password-toggle"
            onClick={() => togglePasswordVisibility('main')}
            type="button"
            aria-label={showPasswords.main ? "Hide password" : "Show password"}
          >
            {showPasswords.main ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>

        {activeTab === 'signup' && (
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
                {getPasswordStrengthText(passwordStrength)}
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
              type={showPasswords.confirm ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="auth-input"
              disabled={loading || googleLoading}
              minLength={6}
            />
            <Button
              variant="link"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('confirm')}
              type="button"
              aria-label={showPasswords.confirm ? "Hide confirmed password" : "Show confirmed password"}
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
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

      {/* Forgot Password Link - Only show on login tab */}
      {activeTab === 'login' && (
        <div className="text-end mb-3">
          <Link 
            to="/forgot-password" 
            className="text-decoration-none text-primary small"
          >
            Forgot your password?
          </Link>
        </div>
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
        disabled={loading || googleLoading}
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
          <>
            {/* Using the Inline SVG as a robust alternative to a file path */}
            <GoogleIconSvg className="me-2 google-icon" />
            {'Continue with Google'}
          </>
        )}
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
              disabled={loading || googleLoading}
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
              disabled={loading || googleLoading}
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
                  : 'Join Nearమీ and discover amazing local businesses'
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