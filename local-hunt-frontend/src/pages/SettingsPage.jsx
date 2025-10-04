// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ProfileSettings from '../components/settings/ProfileSettings';
import PasswordSettings from '../components/settings/PasswordSettings';
//import './SettingsPage.css';

function SettingsPage() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { key: 'profile', title: 'Profile', icon: '👤' },
    { key: 'password', title: 'Password', icon: '🔒' },
  ];

  if (!userProfile) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="settings-page py-5">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-dark mb-3">Account Settings</h1>
            <p className="lead text-muted">
              Manage your account preferences and security settings
            </p>
          </div>

          <Card className="settings-card border-0 shadow-lg">
            <Card.Body className="p-0">
              <Row className="g-0">
                {/* Sidebar Navigation */}
                <Col md={4} lg={3}>
                  <div className="settings-sidebar p-4 border-end">
                    <div className="text-center mb-4">
                      <div className="user-avatar-lg mb-3">
                        <div className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto">
                          {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">{userProfile.name}</h6>
                      <small className="text-muted">{userProfile.email}</small>
                    </div>

                    <Nav variant="pills" className="flex-column settings-nav">
                      {tabs.map(tab => (
                        <Nav.Item key={tab.key}>
                          <Nav.Link
                            active={activeTab === tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="settings-nav-link d-flex align-items-center py-3"
                          >
                            <span className="nav-icon me-3" style={{ fontSize: '18px' }}>
                              {tab.icon}
                            </span>
                            <span className="fw-medium">{tab.title}</span>
                          </Nav.Link>
                        </Nav.Item>
                      ))}
                    </Nav>
                  </div>
                </Col>

                {/* Content Area */}
                <Col md={8} lg={9}>
                  <div className="settings-content p-4 p-md-5">
                    {loading && (
                      <div className="text-center mb-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2">Updating settings...</p>
                      </div>
                    )}

                    {activeTab === 'profile' && (
                      <ProfileSettings 
                        onLoadingChange={setLoading}
                      />
                    )}

                    {activeTab === 'password' && (
                      <PasswordSettings 
                        onLoadingChange={setLoading}
                      />
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default SettingsPage;