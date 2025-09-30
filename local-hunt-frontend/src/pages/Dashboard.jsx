import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import * as userApi from '../services/userApi';
import * as vendorApi from '../services/vendorApi';
import '../styles/Dashboard.css';
function Dashboard() {
  const { userProfile, loadingAuth, currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userProfile || !currentUser) return;

      setLoading(true);
      try {
        // Fetch user-specific stats
        const stats = await userApi.getUserStats(currentUser.uid);
        setUserStats(stats);

        // If user is a vendor, fetch vendor data
        if (userProfile.role === 'vendor') {
          const vendor = await vendorApi.getVendorByUserId(currentUser.uid);
          setVendorData(vendor);
        }

        // Fetch recent activity (reviews, messages, etc.)
        const activity = await userApi.getRecentActivity(currentUser.uid);
        setRecentActivity(activity);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addToast('warning', 'Some dashboard features may not be available.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userProfile, currentUser, addToast]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'vendor': return 'success';
      case 'user': return 'primary';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return 'bi-shield-check';
      case 'vendor': return 'bi-shop';
      case 'user': return 'bi-person';
      default: return 'bi-person';
    }
  };

  if (loadingAuth || !userProfile) {
    return (
      <Container className="dashboard-premium d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="text-muted mt-3">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="dashboard-premium py-4">
      {/* Welcome Section */}
      <Row className="mb-5">
        <Col>
          <div className="welcome-section text-center text-md-start">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div>
                <h1 className="fw-bold text-dark mb-2">
                  {getWelcomeMessage()}, {userProfile.name}!
                </h1>
                <p className="lead text-muted mb-3">
                  Welcome to your LocalHunt dashboard
                  <Badge 
                    bg={getRoleBadgeVariant(userProfile.role)} 
                    className="ms-3 role-badge"
                  >
                    <i className={`bi ${getRoleIcon(userProfile.role)} me-2`}></i>
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                  </Badge>
                </p>
              </div>
              <div className="mt-3 mt-md-0">
                <Button 
                  variant="outline-primary" 
                  as={Link} 
                  to="/profile"
                  className="profile-btn"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  My Profile
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Overview */}
      {userStats && (
        <Row className="mb-5">
          <Col lg={3} md={6} className="mb-4">
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center p-4">
                <div className="stat-icon-container bg-primary-light mb-3">
                  <i className="bi bi-heart-fill text-primary"></i>
                </div>
                <h3 className="stat-value fw-bold text-dark">{userStats.favoriteCount || 0}</h3>
                <p className="stat-label text-muted mb-0">Favorite Businesses</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-4">
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center p-4">
                <div className="stat-icon-container bg-success-light mb-3">
                  <i className="bi bi-star-fill text-success"></i>
                </div>
                <h3 className="stat-value fw-bold text-dark">{userStats.reviewCount || 0}</h3>
                <p className="stat-label text-muted mb-0">Reviews Written</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-4">
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center p-4">
                <div className="stat-icon-container bg-warning-light mb-3">
                  <i className="bi bi-chat-dots-fill text-warning"></i>
                </div>
                <h3 className="stat-value fw-bold text-dark">{userStats.messageCount || 0}</h3>
                <p className="stat-label text-muted mb-0">Active Chats</p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-4">
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="text-center p-4">
                <div className="stat-icon-container bg-info-light mb-3">
                  <i className="bi bi-eye-fill text-info"></i>
                </div>
                <h3 className="stat-value fw-bold text-dark">{userStats.recentViews || 0}</h3>
                <p className="stat-label text-muted mb-0">Recent Views</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Vendor-specific Stats */}
      {userProfile.role === 'vendor' && vendorData && (
        <Row className="mb-5">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom-0">
                <h5 className="fw-semibold mb-0">
                  <i className="bi bi-graph-up me-2 text-success"></i>
                  Business Performance
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="text-center mb-3">
                    <div className="vendor-stat">
                      <h4 className="fw-bold text-success">{vendorData.averageRating || '0.0'}</h4>
                      <p className="text-muted mb-0">Average Rating</p>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <div className="vendor-stat">
                      <h4 className="fw-bold text-primary">{vendorData.totalReviews || 0}</h4>
                      <p className="text-muted mb-0">Total Reviews</p>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <div className="vendor-stat">
                      <h4 className="fw-bold text-warning">{vendorData.viewCount || 0}</h4>
                      <p className="text-muted mb-0">Profile Views</p>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <div className="vendor-stat">
                      <h4 className="fw-bold text-info">{vendorData.messageCount || 0}</h4>
                      <p className="text-muted mb-0">Customer Inquiries</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Quick Actions */}
      <Row className="mb-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom-0">
              <h5 className="fw-semibold mb-0">
                <i className="bi bi-lightning-fill me-2 text-warning"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {/* Common Actions for All Users */}
                <Col lg={3} md={6}>
                  <Button 
                    as={Link} 
                    to="/vendors" 
                    variant="outline-primary" 
                    className="w-100 h-100 action-btn p-3 text-start"
                  >
                    <i className="bi bi-search display-6 text-primary mb-2 d-block"></i>
                    <h6 className="fw-semibold">Discover Businesses</h6>
                    <small className="text-muted">Find local services and products</small>
                  </Button>
                </Col>

                <Col lg={3} md={6}>
                  <Button 
                    as={Link} 
                    to="/messages" 
                    variant="outline-success" 
                    className="w-100 h-100 action-btn p-3 text-start"
                  >
                    <i className="bi bi-chat-dots display-6 text-success mb-2 d-block"></i>
                    <h6 className="fw-semibold">Messages</h6>
                    <small className="text-muted">Chat with businesses</small>
                  </Button>
                </Col>

                {/* Role-specific Actions */}
                {userProfile.role === 'vendor' && (
                  <Col lg={3} md={6}>
                    <Button 
                      as={Link} 
                      to="/vendor-dashboard" 
                      variant="outline-success" 
                      className="w-100 h-100 action-btn p-3 text-start"
                    >
                      <i className="bi bi-speedometer2 display-6 text-success mb-2 d-block"></i>
                      <h6 className="fw-semibold">Business Dashboard</h6>
                      <small className="text-muted">Manage your business</small>
                    </Button>
                  </Col>
                )}

                {userProfile.role === 'admin' && (
                  <Col lg={3} md={6}>
                    <Button 
                      as={Link} 
                      to="/admin" 
                      variant="outline-danger" 
                      className="w-100 h-100 action-btn p-3 text-start"
                    >
                      <i className="bi bi-shield-check display-6 text-danger mb-2 d-block"></i>
                      <h6 className="fw-semibold">Admin Panel</h6>
                      <small className="text-muted">Manage platform</small>
                    </Button>
                  </Col>
                )}

                {userProfile.role === 'user' && (
                  <Col lg={3} md={6}>
                    <Button 
                      as={Link} 
                      to="/register-vendor" 
                      variant="outline-info" 
                      className="w-100 h-100 action-btn p-3 text-start"
                    >
                      <i className="bi bi-plus-circle display-6 text-info mb-2 d-block"></i>
                      <h6 className="fw-semibold">Register Business</h6>
                      <small className="text-muted">List your business</small>
                    </Button>
                  </Col>
                )}

                {/* Additional Common Actions */}
                <Col lg={3} md={6}>
                  <Button 
                    as={Link} 
                    to="/favorites" 
                    variant="outline-warning" 
                    className="w-100 h-100 action-btn p-3 text-start"
                  >
                    <i className="bi bi-heart display-6 text-warning mb-2 d-block"></i>
                    <h6 className="fw-semibold">Favorites</h6>
                    <small className="text-muted">Your saved businesses</small>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom-0">
                <h5 className="fw-semibold mb-0">
                  <i className="bi bi-clock-history me-2 text-primary"></i>
                  Recent Activity
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="activity-list">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="activity-item d-flex align-items-center py-3 border-bottom">
                      <div className="activity-icon me-3">
                        <i className={`bi bi-${activity.icon} text-${activity.type}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">{activity.message}</p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
                {recentActivity.length > 5 && (
                  <div className="text-center mt-3">
                    <Button variant="outline-primary" size="sm">
                      View All Activity
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Loading State for Dashboard Data */}
      {loading && (
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-3">Loading your dashboard data...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Empty State for New Users */}
      {!loading && (!userStats || Object.values(userStats).every(val => !val || val === 0)) && (
        <Row>
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle display-4 d-block mb-3"></i>
              <h5>Welcome to LocalHunt!</h5>
              <p className="mb-3">
                Get started by exploring local businesses, saving your favorites, and writing reviews.
              </p>
              <Button as={Link} to="/vendors" variant="primary">
                Start Exploring
              </Button>
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Dashboard;