import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Nav, Spinner, Alert, Button, 
  Table, Badge, Modal, Form, InputGroup, Dropdown 
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import * as adminApi from '../services/adminApi';
import '../styles/AdminDashboardPage.css';

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card className={`stat-card-premium stat-${color} border-0 shadow-sm`}>
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <h6 className="stat-title text-muted mb-2 fw-semibold">{title}</h6>
          <h3 className="stat-value fw-bold text-dark mb-1">{value}</h3>
          {subtitle && (
            <p className="stat-subtitle text-muted mb-0 small">{subtitle}</p>
          )}
          {trend && (
            <div className={`stat-trend ${trend.direction} mt-2`}>
              <i className={`bi bi-arrow-${trend.direction === 'up' ? 'up' : 'down'}-circle-fill me-1`}></i>
              {trend.value}% from last week
            </div>
          )}
        </div>
        <div className={`stat-icon-container bg-${color}-light`}>
          <i className={`bi ${icon} text-${color}`}></i>
        </div>
      </div>
    </Card.Body>
  </Card>
);

function AdminDashboardPage() {
  const { userProfile, loadingAuth } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ users: [], vendors: [], reviews: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  useEffect(() => {
    if (!loadingAuth && userProfile?.role !== 'admin') {
      addToast('warning', 'Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [userProfile, loadingAuth, navigate, addToast]);

  const fetchStats = useCallback(async () => {
    try {
      const fetchedStats = await adminApi.getDashboardStats();
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      addToast('danger', 'Failed to load dashboard statistics.');
    }
  }, [addToast]);

  const fetchDataForTab = useCallback(async (tab) => {
    if (tab === 'overview') return;
    
    setLoading(true);
    setError('');
    try {
      let result = [];
      if (tab === 'users') result = await adminApi.getAllUsers();
      else if (tab === 'vendors') result = await adminApi.getAllVendorsAdmin();
      else if (tab === 'reviews') result = await adminApi.getAllReviewsAdmin();
      setData(prev => ({ ...prev, [tab]: result }));
    } catch (err) {
      setError(err.message || `Failed to fetch ${tab}.`);
      addToast('danger', `Failed to load ${tab}.`);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchStats();
      if (activeTab !== 'overview') {
        fetchDataForTab(activeTab);
      }
    }
  }, [userProfile, activeTab, fetchStats, fetchDataForTab]);

  const handleVendorStatusUpdate = async (vendorId, status, vendorName) => {
    try {
      await adminApi.updateVendorStatus(vendorId, status);
      addToast('success', `${vendorName} has been ${status}.`);
      fetchDataForTab('vendors');
      fetchStats();
    } catch (err) {
      addToast('danger', `Failed to update vendor status: ${err.message}`);
    }
  };

  const handleViewVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const filteredData = (items) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderContent = () => {
    if (loading && activeTab !== 'overview') {
      return (
        <div className="text-center my-5 py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="text-muted mt-3">Loading {activeTab}...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-3"
            onClick={() => fetchDataForTab(activeTab)}
          >
            Retry
          </Button>
        </Alert>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} />;
      case 'users':
        return <UserTable users={filteredData(data.users)} />;
      case 'vendors':
        return (
          <VendorTable 
            vendors={filteredData(data.vendors)} 
            onStatusUpdate={handleVendorStatusUpdate}
            onViewDetails={handleViewVendorDetails}
          />
        );
      case 'reviews':
        return (
          <ReviewTable 
            reviews={filteredData(data.reviews)} 
            refreshData={() => fetchDataForTab('reviews')}
          />
        );
      default:
        return null;
    }
  };

  if (loadingAuth || !userProfile) {
    return (
      <div className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-3">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <Container fluid className="admin-dashboard-premium px-4 py-4">
      {/* Header */}
      <div className="admin-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bold text-dark mb-2">Admin Dashboard</h1>
            <p className="text-muted mb-0">
              Welcome back, {userProfile.name}. Manage your platform efficiently.
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => {
                fetchStats();
                if (activeTab !== 'overview') fetchDataForTab(activeTab);
              }}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && activeTab === 'overview' && (
        <Row className="mb-4 g-4">
          <Col xl={3} lg={6}>
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon="bi-people-fill" 
              color="primary"
              subtitle="Registered users"
              trend={{ direction: 'up', value: 12 }}
            />
          </Col>
          <Col xl={3} lg={6}>
            <StatCard 
              title="Total Vendors" 
              value={stats.totalVendors} 
              icon="bi-shop" 
              color="success"
              subtitle="Business listings"
              trend={{ direction: 'up', value: 8 }}
            />
          </Col>
          <Col xl={3} lg={6}>
            <StatCard 
              title="Pending Approvals" 
              value={stats.pendingVendors} 
              icon="bi-hourglass-split" 
              color="warning"
              subtitle="Awaiting review"
              trend={{ direction: 'down', value: 5 }}
            />
          </Col>
          <Col xl={3} lg={6}>
            <StatCard 
              title="Total Reviews" 
              value={stats.totalReviews} 
              icon="bi-star-fill" 
              color="info"
              subtitle="Customer feedback"
              trend={{ direction: 'up', value: 15 }}
            />
          </Col>
        </Row>
      )}

      {/* Main Content */}
      <Card className="admin-content-card border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom-0 pt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="admin-tabs">
              <Nav.Item>
                <Nav.Link eventKey="overview" className="admin-tab-link">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Overview
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="vendors" className="admin-tab-link">
                  <i className="bi bi-shop me-2"></i>
                  Vendors
                  {stats?.pendingVendors > 0 && (
                    <Badge bg="danger" pill className="ms-2">{stats.pendingVendors}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reviews" className="admin-tab-link">
                  <i className="bi bi-star-fill me-2"></i>
                  Reviews
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="users" className="admin-tab-link">
                  <i className="bi bi-people-fill me-2"></i>
                  Users
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Search Bar */}
            {activeTab !== 'overview' && (
              <InputGroup style={{ width: '300px' }}>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            )}
          </div>
        </Card.Header>

        <Card.Body className="px-0 pb-0">
          {renderContent()}
        </Card.Body>
      </Card>

      {/* Vendor Details Modal */}
      <VendorDetailsModal 
        vendor={selectedVendor}
        show={showVendorModal}
        onHide={() => setShowVendorModal(false)}
        onStatusUpdate={handleVendorStatusUpdate}
      />
    </Container>
  );
}

// Enhanced Sub-components
const OverviewTab = ({ stats }) => (
  <div className="overview-content p-4">
    <Row className="g-4">
      <Col lg={8}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Header className="bg-white border-bottom-0">
            <h5 className="fw-semibold mb-0">Recent Activity</h5>
          </Card.Header>
          <Card.Body>
            <div className="text-center py-5 text-muted">
              <i className="bi bi-graph-up display-4 d-block mb-3"></i>
              <h6>Activity Overview</h6>
              <p className="mb-0">Recent platform activity and analytics will appear here</p>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Header className="bg-white border-bottom-0">
            <h5 className="fw-semibold mb-0">Quick Actions</h5>
          </Card.Header>
          <Card.Body>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" className="text-start py-3">
                <i className="bi bi-shop me-2"></i>
                Manage Vendors
              </Button>
              <Button variant="outline-success" className="text-start py-3">
                <i className="bi bi-star-fill me-2"></i>
                Review Moderation
              </Button>
              <Button variant="outline-info" className="text-start py-3">
                <i className="bi bi-people-fill me-2"></i>
                User Management
              </Button>
              <Button variant="outline-warning" className="text-start py-3">
                <i className="bi bi-gear-fill me-2"></i>
                System Settings
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);

const UserTable = ({ users }) => (
  <div className="table-container">
    <Table responsive hover className="admin-table-premium mb-0">
      <thead className="table-header-premium">
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className="table-row-premium">
            <td>
              <div className="d-flex align-items-center">
                <div className="user-avatar-sm me-3">
                  <div className="avatar-placeholder bg-primary text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="fw-semibold text-dark">{user.name}</div>
                  <small className="text-muted">ID: {user.id.substring(0, 8)}...</small>
                </div>
              </div>
            </td>
            <td className="text-muted">{user.email}</td>
            <td>
              <Badge 
                bg={user.role === 'admin' ? 'danger' : 'secondary'} 
                className="role-badge"
              >
                {user.role}
              </Badge>
            </td>
            <td className="text-muted">
              {user.createdAt ? new Date(user.createdAt._seconds * 1000).toLocaleDateString() : 'N/A'}
            </td>
            <td>
              <Badge bg="success" className="status-badge">
                <i className="bi bi-check-circle-fill me-1"></i>
                Active
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    {users.length === 0 && (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-people display-4 d-block mb-3"></i>
        <h6>No Users Found</h6>
        <p className="mb-0">There are no users matching your search criteria</p>
      </div>
    )}
  </div>
);

const VendorTable = ({ vendors, onStatusUpdate, onViewDetails }) => (
  <div className="table-container">
    <Table responsive hover className="admin-table-premium mb-0">
      <thead className="table-header-premium">
        <tr>
          <th>Business</th>
          <th>Category</th>
          <th>Contact</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map(vendor => (
          <tr key={vendor.id} className="table-row-premium">
            <td>
              <div className="d-flex align-items-center">
                <div className="vendor-avatar-sm me-3">
                  <img 
                    src={vendor.profileImageUrl || 'https://placehold.co/40x40/667eea/ffffff?text=BH'} 
                    alt={vendor.businessName}
                    className="avatar-image"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/40x40/667eea/ffffff?text=BH';
                    }}
                  />
                </div>
                <div>
                  <div 
                    className="fw-semibold text-dark cursor-pointer"
                    onClick={() => onViewDetails(vendor)}
                    style={{ cursor: 'pointer' }}
                  >
                    {vendor.businessName}
                  </div>
                  <small className="text-muted">
                    {vendor.location?.city}, {vendor.location?.state}
                  </small>
                </div>
              </div>
            </td>
            <td>
              <Badge bg="outline-primary" className="category-badge">
                {vendor.category}
              </Badge>
            </td>
            <td className="text-muted">
              <div>{vendor.contactEmail}</div>
              <small>{vendor.contactPhone}</small>
            </td>
            <td>
              <Badge 
                bg={
                  vendor.status === 'approved' ? 'success' : 
                  vendor.status === 'pending' ? 'warning' : 'danger'
                } 
                className="status-badge"
              >
                <i className={`bi bi-${
                  vendor.status === 'approved' ? 'check-circle' : 
                  vendor.status === 'pending' ? 'clock' : 'x-circle'
                }-fill me-1`}></i>
                {vendor.status}
              </Badge>
            </td>
            <td>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onViewDetails(vendor)}
                >
                  <i className="bi bi-eye"></i>
                </Button>
                {vendor.status === 'pending' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onStatusUpdate(vendor.id, 'approved', vendor.businessName)}
                  >
                    Approve
                  </Button>
                )}
                {vendor.status === 'approved' && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onStatusUpdate(vendor.id, 'suspended', vendor.businessName)}
                  >
                    Suspend
                  </Button>
                )}
                {vendor.status === 'suspended' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onStatusUpdate(vendor.id, 'approved', vendor.businessName)}
                  >
                    Unsuspend
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    {vendors.length === 0 && (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-shop display-4 d-block mb-3"></i>
        <h6>No Vendors Found</h6>
        <p className="mb-0">There are no vendors matching your search criteria</p>
      </div>
    )}
  </div>
);

const ReviewTable = ({ reviews, refreshData }) => {
  const { addToast } = useToast();

  const handleStatusUpdate = async (id, status, reviewInfo) => {
    try {
      await adminApi.updateReviewStatus(id, status);
      addToast('success', `Review has been ${status}.`);
      refreshData();
    } catch (err) {
      addToast('danger', `Failed to update review: ${err.message}`);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-warning' : 'text-light'}
        style={{ fontSize: '0.9rem' }}
      >
        <i className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'}`}></i>
      </span>
    ));
  };

  return (
    <div className="table-container">
      <Table responsive hover className="admin-table-premium mb-0">
        <thead className="table-header-premium">
          <tr>
            <th>Vendor</th>
            <th>Reviewer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(review => (
            <tr key={review.id} className="table-row-premium">
              <td className="fw-semibold text-dark">
                {review.vendorName || 'Unknown Vendor'}
              </td>
              <td className="text-muted">
                {review.reviewerName || review.userId?.substring(0, 8)}
              </td>
              <td>
                <div className="d-flex align-items-center">
                  {renderStars(review.rating)}
                  <span className="ms-2 fw-semibold text-dark">{review.rating}.0</span>
                </div>
              </td>
              <td className="comment-cell">
                <div className="review-comment">
                  {review.comment}
                </div>
              </td>
              <td>
                <Badge 
                  bg={review.status === 'approved' ? 'success' : 'secondary'} 
                  className="status-badge"
                >
                  {review.status}
                </Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  {review.status === 'approved' ? (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleStatusUpdate(review.id, 'removed', review)}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleStatusUpdate(review.id, 'approved', review)}
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {reviews.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-star display-4 d-block mb-3"></i>
          <h6>No Reviews Found</h6>
          <p className="mb-0">There are no reviews matching your search criteria</p>
        </div>
      )}
    </div>
  );
};

const VendorDetailsModal = ({ vendor, show, onHide, onStatusUpdate }) => {
  if (!vendor) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="vendor-modal-premium">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold">Vendor Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <Row className="g-4">
          <Col md={4}>
            <div className="text-center">
              <img
                src={vendor.profileImageUrl || 'https://placehold.co/200x200/667eea/ffffff?text=BH'}
                alt={vendor.businessName}
                className="vendor-modal-image rounded-3 mb-3"
              />
              <h5 className="fw-bold">{vendor.businessName}</h5>
              <Badge 
                bg={
                  vendor.status === 'approved' ? 'success' : 
                  vendor.status === 'pending' ? 'warning' : 'danger'
                }
                className="mb-3"
              >
                {vendor.status}
              </Badge>
            </div>
          </Col>
          <Col md={8}>
            <div className="vendor-details">
              <h6 className="fw-semibold mb-3">Business Information</h6>
              <Row className="g-3">
                <Col sm={6}>
                  <label className="text-muted small">Category</label>
                  <div className="fw-semibold">{vendor.category}</div>
                </Col>
                <Col sm={6}>
                  <label className="text-muted small">Owner ID</label>
                  <div className="fw-semibold">{vendor.userId}</div>
                </Col>
                <Col sm={6}>
                  <label className="text-muted small">Email</label>
                  <div className="fw-semibold">{vendor.contactEmail}</div>
                </Col>
                <Col sm={6}>
                  <label className="text-muted small">Phone</label>
                  <div className="fw-semibold">{vendor.contactPhone}</div>
                </Col>
                <Col sm={12}>
                  <label className="text-muted small">Address</label>
                  <div className="fw-semibold">
                    {vendor.location?.street}, {vendor.location?.city}, {vendor.location?.state}
                  </div>
                </Col>
                <Col sm={12}>
                  <label className="text-muted small">Description</label>
                  <div className="fw-semibold">{vendor.description}</div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-top-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        {vendor.status === 'pending' && (
          <Button
            variant="success"
            onClick={() => {
              onStatusUpdate(vendor.id, 'approved', vendor.businessName);
              onHide();
            }}
          >
            Approve Vendor
          </Button>
        )}
        {vendor.status === 'approved' && (
          <Button
            variant="warning"
            onClick={() => {
              onStatusUpdate(vendor.id, 'suspended', vendor.businessName);
              onHide();
            }}
          >
            Suspend Vendor
          </Button>
        )}
        {vendor.status === 'suspended' && (
          <Button
            variant="success"
            onClick={() => {
              onStatusUpdate(vendor.id, 'approved', vendor.businessName);
              onHide();
            }}
          >
            Unsuspend Vendor
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AdminDashboardPage;