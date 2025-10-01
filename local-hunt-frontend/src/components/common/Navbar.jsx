import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button, Badge, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  BarChart3, 
  Bell, 
  MessageCircle, 
  User, 
  LogOut, 
  Settings,
  Heart,
  Menu,
  X,
  Shield,
  Store,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import './common.css';

// Import your local logo
import logo from '../../assets/logo_1.png'; // Update path to your logo

function SiteNavbar() {
  const { userProfile, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setExpanded(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    setShowMobileMenu(!expanded);
  };

  const handleSelect = () => {
    setExpanded(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setExpanded(false);
    setShowMobileMenu(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // Logo Component with local image
  const Logo = ({ size = 40, className = "" }) => (
    <div className={`logo-container ${className}`}>
      <img 
        src={logo} 
        alt="LocalVendor" 
        className="logo-image"
        style={{ 
          height: size, 
          width: 'auto',
          maxWidth: '150px'
        }}
      />
    </div>
  );

  return (
    <>
      <Navbar 
        bg="white" 
        expand="lg" 
        fixed="top"
        className={`navbar-premium py-2 transition-all ${scrolled ? 'navbar-scrolled shadow-lg' : ''}`}
        expanded={expanded}
        onToggle={handleToggle}
      >
        <Container>
          {/* Brand with Local Logo */}
          <Navbar.Brand 
            as={Link} 
            to="/" 
            className="fw-bold text-primary d-flex align-items-center" 
            onClick={closeMobileMenu}
          >
            <Logo size={40} />
          </Navbar.Brand>

          {/* Desktop Navigation */}
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
            {/* Center Navigation - Desktop */}
            <Nav className="mx-auto align-items-lg-center d-none d-lg-flex">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={`nav-link-premium mx-3 ${isActiveRoute('/') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Home size={18} className="me-2" />
                Home
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/vendors" 
                className={`nav-link-premium mx-3 ${isActiveRoute('/vendors') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Search size={18} className="me-2" />
                Discover
              </Nav.Link>
              
              {userProfile?.role === 'vendor' && (
                <Nav.Link 
                  as={Link} 
                  to="/vendor-dashboard" 
                  className={`nav-link-premium mx-3 ${isActiveRoute('/vendor-dashboard') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <BarChart3 size={18} className="me-2" />
                  Dashboard
                </Nav.Link>
              )}
            </Nav>

            {/* Right Side - User Menu - Desktop */}
            <Nav className="align-items-lg-center d-none d-lg-flex">
              {userProfile ? (
                <>
                  {/* Notification Bell */}
                  <div className="me-3">
                    <NotificationBell />
                  </div>

                  {/* Messages */}
                  <Nav.Link 
                    as={Link} 
                    to="/messages" 
                    className="nav-link-premium me-3 position-relative"
                    onClick={closeMobileMenu}
                  >
                    <MessageCircle size={20} />
                    {userProfile.unreadMessages > 0 && (
                      <Badge 
                        bg="danger" 
                        pill 
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {userProfile.unreadMessages}
                      </Badge>
                    )}
                  </Nav.Link>

                  {/* User Dropdown */}
                  <NavDropdown 
                    title={
                      <div className="d-flex align-items-center cursor-pointer user-avatar-container">
                        <div 
                          className="user-avatar me-2"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            border: '3px solid #e9ecef',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {getInitials(userProfile.name)}
                        </div>
                        <div className="d-flex flex-column">
                          <span className="text-dark fw-semibold" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
                            {userProfile.name}
                          </span>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {userProfile.role}
                          </small>
                        </div>
                      </div>
                    } 
                    id="user-nav-dropdown"
                    align="end"
                    className="user-dropdown"
                  >
                    <div className="px-3 py-2 border-bottom">
                      <div className="fw-semibold text-dark">{userProfile.name}</div>
                      <small className="text-muted">{userProfile.email}</small>
                      <div className="mt-2">
                        <Badge bg="primary" className="me-1">
                          {userProfile.role}
                        </Badge>
                        {userProfile.isVerified && (
                          <Badge bg="success">
                            <Shield size={12} className="me-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <NavDropdown.Item 
                      onClick={() => { navigate('/dashboard'); closeMobileMenu(); }}
                      className="dropdown-item-premium d-flex align-items-center"
                    >
                      <BarChart3 size={18} className="me-2" />
                      Dashboard
                    </NavDropdown.Item>
                    
                    <NavDropdown.Item 
                      onClick={() => { navigate('/profile'); closeMobileMenu(); }}
                      className="dropdown-item-premium d-flex align-items-center"
                    >
                      <User size={18} className="me-2" />
                      My Profile
                    </NavDropdown.Item>

                    <NavDropdown.Item 
                      onClick={() => { navigate('/favorites'); closeMobileMenu(); }}
                      className="dropdown-item-premium d-flex align-items-center"
                    >
                      <Heart size={18} className="me-2" />
                      Favorites
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    
                    <NavDropdown.Item 
                      onClick={() => { navigate('/settings'); closeMobileMenu(); }}
                      className="dropdown-item-premium d-flex align-items-center"
                    >
                      <Settings size={18} className="me-2" />
                      Settings
                    </NavDropdown.Item>
                    
                    {userProfile.role === 'vendor' && (
                      <NavDropdown.Item 
                        onClick={() => { navigate('/vendor/settings'); closeMobileMenu(); }}
                        className="dropdown-item-premium d-flex align-items-center"
                      >
                        <Store size={18} className="me-2" />
                        Business Settings
                      </NavDropdown.Item>
                    )}
                    
                    <NavDropdown.Divider />
                    
                    <NavDropdown.Item 
                      onClick={handleLogout}
                      className="dropdown-item-premium d-flex align-items-center text-danger"
                    >
                      <LogOut size={18} className="me-2" />
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <div className="d-flex gap-3 align-items-center">
                  <Nav.Link 
                    as={Link} 
                    to="/become-vendor" 
                    className="nav-link-premium text-primary fw-semibold"
                    onClick={closeMobileMenu}
                  >
                    For Businesses
                  </Nav.Link>
                  <div className="d-flex gap-2">
                    <Button 
                      as={Link} 
                      to="/auth?tab=login" 
                      variant="outline-primary" 
                      className="px-4 rounded-pill"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Button>
                    <Button 
                      as={Link} 
                      to="/auth?tab=register" 
                      variant="primary" 
                      className="px-4 rounded-pill"
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>

          {/* Mobile Menu Toggle */}
          <div className="d-flex align-items-center d-lg-none">
            {userProfile && (
              <>
                <div className="me-3 position-relative">
                  <NotificationBell />
                </div>
                {userProfile.unreadMessages > 0 && (
                  <Button
                    as={Link}
                    to="/messages"
                    variant="link"
                    className="position-relative me-3 p-0 text-dark"
                    onClick={closeMobileMenu}
                  >
                    <MessageCircle size={22} />
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.6rem' }}
                    >
                      {userProfile.unreadMessages}
                    </Badge>
                  </Button>
                )}
              </>
            )}
            <Button
              variant="link"
              className="navbar-toggler-custom p-0 border-0"
              onClick={handleToggle}
              aria-controls="basic-navbar-nav"
              aria-expanded={expanded}
            >
              {expanded ? (
                <X size={24} className="text-dark" />
              ) : (
                <Menu size={24} className="text-dark" />
              )}
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas 
        show={showMobileMenu} 
        onHide={closeMobileMenu} 
        placement="end"
        className="mobile-menu-offcanvas"
        style={{ width: '320px' }}
      >
        <Offcanvas.Header className="border-bottom pb-3">
          <div className="d-flex align-items-center w-100">
            {userProfile ? (
              <>
                <div 
                  className="user-avatar me-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: '3px solid #e9ecef'
                  }}
                >
                  {getInitials(userProfile.name)}
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold text-dark mb-1">{userProfile.name}</h6>
                  <p className="text-muted small mb-1">{userProfile.email}</p>
                  <div className="d-flex gap-1">
                    <Badge bg="primary" className="fs-3">
                      {userProfile.role}
                    </Badge>
                    {userProfile.isVerified && (
                      <Badge bg="success" className="fs-3">
                        <Shield size={12} className="me-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center w-100">
                <Logo size={35} className="mb-2 justify-content-center" />
                <h5 className="fw-bold text-dark mb-1">LocalVendor</h5>
                <p className="text-muted small">Discover local businesses</p>
              </div>
            )}
          </div>
          <Button 
            variant="link" 
            className="p-0 ms-2" 
            onClick={closeMobileMenu}
            style={{ minWidth: 'auto' }}
          >
            <X size={24} className="text-dark" />
          </Button>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0 d-flex flex-column">
          {/* Mobile Navigation Menu */}
          <Nav className="flex-column flex-grow-1">
            <div className="px-3 py-2 text-uppercase small fw-semibold text-muted">
              Navigation
            </div>
            
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`mobile-nav-link ${isActiveRoute('/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Home size={20} className="me-3" />
              Home
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/discover" 
              className={`mobile-nav-link ${isActiveRoute('/discover') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Search size={20} className="me-3" />
              Discover
            </Nav.Link>

            {userProfile ? (
              <>
                {/* User Specific Links */}
                <div className="px-3 py-2 text-uppercase small fw-semibold text-muted mt-3">
                  My Account
                </div>

                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  className={`mobile-nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <BarChart3 size={20} className="me-3" />
                  Dashboard
                </Nav.Link>

                <Nav.Link 
                  as={Link} 
                  to="/profile" 
                  className={`mobile-nav-link ${isActiveRoute('/profile') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <User size={20} className="me-3" />
                  My Profile
                </Nav.Link>

                <Nav.Link 
                  as={Link} 
                  to="/messages" 
                  className={`mobile-nav-link ${isActiveRoute('/messages') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <MessageCircle size={20} className="me-3" />
                  Messages
                  {userProfile.unreadMessages > 0 && (
                    <Badge bg="danger" pill className="ms-2">
                      {userProfile.unreadMessages}
                    </Badge>
                  )}
                </Nav.Link>
                {userProfile.role === 'vendor' && (
                  <>
                    <Nav.Link 
                      as={Link} 
                      to="/vendor-dashboard" 
                      className={`mobile-nav-link ${isActiveRoute('/vendor-dashboard') ? 'active' : ''}`}
                      onClick={closeMobileMenu}
                    >
                      <Shield size={20} className="me-3" />
                      Vendor Dashboard
                    </Nav.Link>

                    <Nav.Link 
                      as={Link} 
                      to="/vendor-dashboard" 
                      className={`mobile-nav-link ${isActiveRoute('/vendor-dashboard') ? 'active' : ''}`}
                      onClick={closeMobileMenu}
                    >
                      <Store size={20} className="me-3" />
                      Business Settings
                    </Nav.Link>
                  </>
                )}

                <div className="px-3 py-2 text-uppercase small fw-semibold text-muted mt-3">
                  Settings
                </div>

                <Nav.Link 
                  as={Link} 
                  to="/settings" 
                  className={`mobile-nav-link ${isActiveRoute('/settings') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Settings size={20} className="me-3" />
                  Settings
                </Nav.Link>

                <Nav.Link 
                  onClick={handleLogout}
                  className="mobile-nav-link text-danger"
                >
                  <LogOut size={20} className="me-3" />
                  Logout
                </Nav.Link>
              </>
            ) : (
              /* Guest User Links */
              <div className="p-3 border-top mt-3">
                <div className="d-grid gap-2">
                  <Button 
                    as={Link} 
                    to="/auth?tab=login" 
                    variant="outline-primary" 
                    size="lg"
                    onClick={closeMobileMenu}
                    className="py-2 rounded-pill"
                  >
                    Login
                  </Button>
                  <Button 
                    as={Link} 
                    to="/auth?tab=register" 
                    variant="primary" 
                    size="lg"
                    onClick={closeMobileMenu}
                    className="py-2 rounded-pill"
                  >
                    Sign Up
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register-vendor" 
                    variant="outline-success" 
                    size="lg"
                    onClick={closeMobileMenu}
                    className="py-2 rounded-pill"
                  >
                    <Store size={18} className="me-2" />
                    For Businesses
                  </Button>
                </div>
                
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Join thousands of local businesses and customers
                  </small>
                </div>
              </div>
            )}
          </Nav>

          {/* Footer Section */}
          <div className="border-top p-3 mt-auto">
            <div className="text-center">
              <small className="text-muted">
                &copy; 2024 LocalVendor. All rights reserved.
              </small>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <style jsx>{`
        .navbar-premium {
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .navbar-scrolled {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.98) !important;
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        
        .logo-image {
          transition: all 0.3s ease;
          object-fit: contain;
        }
        
        .logo-container:hover .logo-image {
          transform: scale(1.05);
        }
        
        .nav-link-premium {
          font-weight: 500;
          color: #6c757d !important;
          transition: all 0.3s ease;
          padding: 0.5rem 1rem !important;
          border-radius: 0.75rem;
          position: relative;
        }
        
        .nav-link-premium:hover,
        .nav-link-premium.active {
          color: #667eea !important;
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }
        
        .nav-link-premium.active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #667eea;
          border-radius: 50%;
        }
        
        .dropdown-item-premium {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          transition: all 0.2s ease;
          border-radius: 0.5rem;
          margin: 0.125rem 0.5rem;
        }
        
        .dropdown-item-premium:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateX(4px);
        }
        
        .user-avatar-container:hover .user-avatar {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .mobile-menu-offcanvas .offcanvas-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .mobile-nav-link {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          color: #6c757d;
          text-decoration: none;
          border-bottom: 1px solid #f8f9fa;
          transition: all 0.3s ease;
        }
        
        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          border-left: 4px solid #667eea;
          padding-left: calc(1.5rem - 4px);
        }
        
        .mobile-nav-link:last-child {
          border-bottom: none;
        }
        
        .navbar-toggler-custom {
          background: none !important;
          box-shadow: none !important;
          transition: all 0.3s ease;
        }
        
        .navbar-toggler-custom:hover {
          transform: scale(1.1);
        }
        
        .navbar-toggler-custom:focus {
          box-shadow: none !important;
        }
        
        @media (max-width: 991.98px) {
          .navbar-premium {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          
          .logo-image {
            max-height: 35px;
          }
        }
        
        @media (max-width: 575.98px) {
          .mobile-menu-offcanvas {
            width: 280px !important;
          }
          
          .logo-image {
            max-height: 30px;
          }
        }
      `}</style>
    </>
  );
}

export default SiteNavbar;