import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import './common.css';

const Footer = () => (
  <footer className="footer-premium bg-dark text-light pt-5 pb-4">
    <Container>
      <Row className="g-4">
        <Col lg={4} className="mb-4 mb-lg-0">
          <div className="d-flex align-items-center mb-3">
            <MapPin size={24} className="text-primary me-2" />
            <h5 className="fw-bold text-white mb-0">Nearమీ</h5>
          </div>
          <p className="text-light opacity-75 mb-3">
            Connecting you with the best local businesses in your community. 
            Discover, connect, and support local excellence.
          </p>
          <div className="social-links">
            <a href="#" className="text-light opacity-75 me-3" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#" className="text-light opacity-75 me-3" aria-label="Twitter">
              <i className="bi bi-twitter"></i>
            </a>
            <a href="#" className="text-light opacity-75 me-3" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="#" className="text-light opacity-75" aria-label="LinkedIn">
              <i className="bi bi-linkedin"></i>
            </a>
          </div>
        </Col>
        
        <Col md={4} lg={2} className="mb-4 mb-md-0">
          <h6 className="text-white fw-semibold mb-3">Explore</h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Link to="/" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Home
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/vendors" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Discover
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/about" className="text-light opacity-75 text-decoration-none hover-text-primary">
                About
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/contact" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </Col>
        
        <Col md={4} lg={2} className="mb-4 mb-md-0">
          <h6 className="text-white fw-semibold mb-3">Business</h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Link to="/register-vendor" className="text-light opacity-75 text-decoration-none hover-text-primary">
                List Business
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/business-solutions" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Solutions
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/pricing" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Pricing
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/support" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Support
              </Link>
            </li>
          </ul>
        </Col>
        
        <Col md={4} lg={2} className="mb-4 mb-md-0">
          <h6 className="text-white fw-semibold mb-3">Legal</h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Link to="/privacy" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Privacy
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/terms" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Terms
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/cookies" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Cookies
              </Link>
            </li>
          </ul>
        </Col>

        <Col md={4} lg={2}>
          <h6 className="text-white fw-semibold mb-3">Support</h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Link to="/support" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Help Center
              </Link>
            </li>
            <li className="mb-2">
              <a href="mailto:support@Nearme.com" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Email Support
              </a>
            </li>
            <li className="mb-2">
              <a href="tel:+15551234567" className="text-light opacity-75 text-decoration-none hover-text-primary">
                Call Support
              </a>
            </li>
          </ul>
        </Col>
      </Row>
      
      <hr className="my-4 border-secondary" />
      
      <Row className="align-items-center">
        <Col md={6} className="text-center text-md-start">
          <p className="mb-0 text-light opacity-75">
            &copy; {new Date().getFullYear()} Nearమీ. All rights reserved.
          </p>
        </Col>
        <Col md={6} className="text-center text-md-end">
          <p className="mb-0 text-light opacity-75 d-flex align-items-center justify-content-center justify-content-md-end">
            Made with <Heart size={16} className="text-danger mx-1" /> for local communities
          </p>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;