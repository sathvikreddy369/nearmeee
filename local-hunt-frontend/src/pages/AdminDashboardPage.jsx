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
  const [data, setData] = useState({ users: [], vendors: [], reviews: [], flaggedReviews: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [gstVerificationLoading, setGstVerificationLoading] = useState(false);
  const [gstVerificationResult, setGstVerificationResult] = useState(null);

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
      else if (tab === 'flagged-reviews') result = await adminApi.getFlaggedReviews();
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

  const handleVendorVerificationUpdate = async (vendorId, verificationStatus, notes = '') => {
    try {
      await adminApi.updateVendorVerificationStatus(vendorId, verificationStatus, notes);
      addToast('success', `Vendor verification status updated to ${verificationStatus}.`);
      fetchDataForTab('vendors');
      setShowVendorModal(false);
      setGstVerificationResult(null);
    } catch (err) {
      addToast('danger', `Failed to update verification status: ${err.message}`);
    }
  };

  const handleGstinVerification = async (vendorId, gstin) => {
    if (!gstin) {
      addToast('warning', 'GSTIN is required for verification.');
      return;
    }

    setGstVerificationLoading(true);
    try {
      const result = await adminApi.verifyGstinForVendor(vendorId, gstin);
      
      if (result.success && result.gstVerificationResult?.isValid) {
        addToast('success', 'GSTIN verification successful!');
        setGstVerificationResult(result);
      } else {
        addToast('warning', result.gstVerificationResult?.error || 'GSTIN verification failed.');
        setGstVerificationResult(result);
      }
    } catch (err) {
      console.error('GSTIN verification error:', err);
      addToast('danger', `GSTIN verification failed: ${err.message}`);
    } finally {
      setGstVerificationLoading(false);
    }
  };

  const handleViewVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
    setGstVerificationResult(null); // Reset verification result when opening new vendor
  };

  const filteredData = (items) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.verificationStatus?.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'flagged-reviews':
        return (
          <FlaggedReviewTable 
            reviews={filteredData(data.flaggedReviews)} 
            refreshData={() => fetchDataForTab('flagged-reviews')}
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
            />
          </Col>
          <Col xl={3} lg={6}>
            <StatCard 
              title="Total Vendors" 
              value={stats.totalVendors} 
              icon="bi-shop" 
              color="success"
              subtitle="Business listings"
            />
          </Col>
          <Col xl={3} lg={6}>
            <StatCard 
              title="Pending Verification" 
              value={stats.pendingVendors} 
              icon="bi-hourglass-split" 
              color="warning"
              subtitle="Awaiting review"
            />
          </Col>
          {/* <Col xl={3} lg={6}>
            <StatCard 
              title="Flagged Reviews" 
              value={stats.flaggedReviews || 0} 
              icon="bi-flag-fill" 
              color="danger"
              subtitle="Need attention"
            />
          </Col> */}
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
                  All Reviews
                </Nav.Link>
              </Nav.Item>
              {/* <Nav.Item>
                <Nav.Link eventKey="flagged-reviews" className="admin-tab-link">
                  <i className="bi bi-flag-fill me-2"></i>
                  Flagged Reviews
                  {data.flaggedReviews?.length > 0 && (
                    <Badge bg="danger" pill className="ms-2">{data.flaggedReviews.length}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item> */}
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
        onHide={() => {
          setShowVendorModal(false);
          setGstVerificationResult(null);
        }}
        onStatusUpdate={handleVendorStatusUpdate}
        onVerificationUpdate={handleVendorVerificationUpdate}
        onGstinVerification={handleGstinVerification}
        gstVerificationLoading={gstVerificationLoading}
        gstVerificationResult={gstVerificationResult}
        setGstVerificationResult={setGstVerificationResult}
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
            <h5 className="fw-semibold mb-0">Platform Statistics</h5>
          </Card.Header>
          <Card.Body>
            {stats ? (
              <Row className="g-3">
                <Col sm={6}>
                  <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                    <span className="text-muted">User Roles</span>
                    <div className="text-end">
                      <div>Users: <strong>{stats.userRoles?.user || 0}</strong></div>
                      <div>Vendors: <strong>{stats.userRoles?.vendor || 0}</strong></div>
                      <div>Admins: <strong>{stats.userRoles?.admin || 0}</strong></div>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                    <span className="text-muted">Vendor Status</span>
                    <div className="text-end">
                      <div>Pending: <strong>{stats.vendorStatus?.pending || 0}</strong></div>
                      <div>Approved: <strong>{stats.vendorStatus?.approved || 0}</strong></div>
                      <div>Suspended: <strong>{stats.vendorStatus?.suspended || 0}</strong></div>
                    </div>
                  </div>
                </Col>
              </Row>
            ) : (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading statistics...</p>
              </div>
            )}
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
              <Button variant="outline-primary" className="text-start py-3" href="#vendors">
                <i className="bi bi-shop me-2"></i>
                Manage Vendors
              </Button>
              <Button variant="outline-danger" className="text-start py-3" href="#flagged-reviews">
                <i className="bi bi-flag-fill me-2"></i>
                Review Flagged Content
              </Button>
              <Button variant="outline-info" className="text-start py-3" href="#users">
                <i className="bi bi-people-fill me-2"></i>
                User Management
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
                  <small className="text-muted">ID: {user.id?.substring(0, 8)}...</small>
                </div>
              </div>
            </td>
            <td className="text-muted">{user.email}</td>
            <td>
              <Badge 
                bg={user.role === 'admin' ? 'danger' : user.role === 'vendor' ? 'success' : 'secondary'} 
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

const VendorTable = ({ vendors, onStatusUpdate, onViewDetails }) => {
  const getVerificationBadge = (status) => {
    const statusConfig = {
      'pending_review_basic': { bg: 'warning', text: 'Basic Review' },
      'pending_gst_verification': { bg: 'info', text: 'GST Verification' },
      'verified_basic': { bg: 'success', text: 'Basic Verified' },
      'verified_gst': { bg: 'primary', text: 'GST Verified' },
      'gst_verification_failed': { bg: 'danger', text: 'GST Failed' },
      'suspended': { bg: 'secondary', text: 'Suspended' },
      'rejected': { bg: 'dark', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  return (
    <div className="table-container">
      <Table responsive hover className="admin-table-premium mb-0">
        <thead className="table-header-premium">
          <tr>
            <th>Business</th>
            <th>Category</th>
            <th>Verification</th>
            <th>Contact</th>
            <th>GSTIN</th>
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
                      {vendor.ownerName}
                    </small>
                    <br />
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
              <td>
                {getVerificationBadge(vendor.verificationStatus)}
              </td>
              <td className="text-muted">
                <div>{vendor.contactEmail}</div>
                <small>{vendor.contactPhone}</small>
              </td>
              <td>
                {vendor.gstin ? (
                  <Badge bg="info" className="gstin-badge">
                    {vendor.gstin}
                  </Badge>
                ) : (
                  <span className="text-muted">No GSTIN</span>
                )}
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
                  {vendor.verificationStatus === 'pending_review_basic' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onStatusUpdate(vendor.id, 'approved', vendor.businessName)}
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
      {vendors.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-shop display-4 d-block mb-3"></i>
          <h6>No Vendors Found</h6>
          <p className="mb-0">There are no vendors matching your search criteria</p>
        </div>
      )}
    </div>
  );
};

const ReviewTable = ({ reviews, refreshData }) => {
  const { addToast } = useToast();

  const handleReviewAction = async (reviewId, action, reason = '') => {
    try {
      if (action === 'remove') {
        await adminApi.removeReviewAdmin(reviewId, reason);
        addToast('success', 'Review removed successfully.');
      } else if (action === 'approve') {
        await adminApi.updateReviewStatus(reviewId, 'approved');
        addToast('success', 'Review approved successfully.');
      } else if (action === 'dismiss-reports') {
        await adminApi.dismissReports(reviewId);
        addToast('success', 'Reports dismissed successfully.');
      }
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
            <th>Reports</th>
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
                {review.vendorReply && (
                  <div className="vendor-reply mt-2 p-2 bg-light rounded">
                    <strong>Vendor Reply:</strong> {review.vendorReply.text}
                  </div>
                )}
              </td>
              <td>
                <Badge 
                  bg={
                    review.status === 'approved' ? 'success' : 
                    review.status === 'pending_review' ? 'warning' : 'danger'
                  } 
                  className="status-badge"
                >
                  {review.status}
                </Badge>
              </td>
              <td>
                {review.reportCount > 0 ? (
                  <Badge bg="danger" className="report-badge">
                    {review.reportCount} reports
                  </Badge>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                <div className="d-flex gap-2">
                  {review.status === 'approved' ? (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleReviewAction(review.id, 'remove', 'Admin action')}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleReviewAction(review.id, 'approve')}
                    >
                      Approve
                    </Button>
                  )}
                  {review.reportCount > 0 && (
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() => handleReviewAction(review.id, 'dismiss-reports')}
                    >
                      Dismiss Reports
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

const FlaggedReviewTable = ({ reviews, refreshData }) => {
  const { addToast } = useToast();

  const handleReviewAction = async (reviewId, action, reason = '') => {
    try {
      if (action === 'remove') {
        await adminApi.removeReviewAdmin(reviewId, reason);
        addToast('success', 'Review removed successfully.');
      } else if (action === 'approve') {
        await adminApi.updateReviewStatus(reviewId, 'approved');
        addToast('success', 'Review approved and reports dismissed.');
      } else if (action === 'dismiss-reports') {
        await adminApi.dismissReports(reviewId);
        addToast('success', 'Reports dismissed successfully.');
      }
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
      <div className="p-3 bg-warning bg-opacity-10 border-bottom">
        <h6 className="mb-0">
          <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
          {reviews.length} reviews need your attention
        </h6>
      </div>
      <Table responsive hover className="admin-table-premium mb-0">
        <thead className="table-header-premium">
          <tr>
            <th>Vendor</th>
            <th>Reviewer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Reports</th>
            <th>Flagged At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(review => (
            <tr key={review.id} className="table-row-premium bg-warning bg-opacity-5">
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
                {review.vendorReply && (
                  <div className="vendor-reply mt-2 p-2 bg-light rounded">
                    <strong>Vendor Reply:</strong> {review.vendorReply.text}
                  </div>
                )}
              </td>
              <td>
                <Badge bg="danger" className="report-badge">
                  {review.reportCount} reports
                </Badge>
              </td>
              <td className="text-muted">
                {review.flaggedAt ? new Date(review.flaggedAt._seconds * 1000).toLocaleDateString() : 'N/A'}
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleReviewAction(review.id, 'approve')}
                  >
                    Approve & Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleReviewAction(review.id, 'remove', 'Multiple user reports')}
                  >
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-info"
                    onClick={() => handleReviewAction(review.id, 'dismiss-reports')}
                  >
                    Dismiss Only
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {reviews.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-flag display-4 d-block mb-3"></i>
          <h6>No Flagged Reviews</h6>
          <p className="mb-0">Great! There are no reviews that need immediate attention.</p>
        </div>
      )}
    </div>
  );
};

const VendorDetailsModal = ({ 
  vendor, 
  show, 
  onHide, 
  onStatusUpdate, 
  onVerificationUpdate,
  onGstinVerification,
  gstVerificationLoading,
  gstVerificationResult,
  setGstVerificationResult
}) => {
  const [verificationNotes, setVerificationNotes] = useState('');
  const [gstinInput, setGstinInput] = useState('');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState('');

  // Reset state when vendor changes
  useEffect(() => {
    if (vendor) {
      setGstinInput(vendor.gstin || '');
      setVerificationNotes('');
      setSelectedVerificationStatus(vendor.verificationStatus || 'pending_review_basic');
    }
  }, [vendor]);

  const handleGstinVerification = async () => {
    if (!gstinInput) {
      return;
    }
    await onGstinVerification(vendor.id, gstinInput);
  };

  const handleUpdateVerificationStatus = async () => {
    if (!selectedVerificationStatus) {
      return;
    }
    await onVerificationUpdate(vendor.id, selectedVerificationStatus, verificationNotes);
  };

  const verificationOptions = [
    { value: 'verified_basic', label: 'Basic Verified', description: 'Basic documentation verified' },
    { value: 'verified_gst', label: 'GST Verified', description: 'GST verified and approved' },
    { value: 'pending_review_basic', label: 'Pending Review', description: 'Awaiting basic verification' },
    { value: 'pending_gst_verification', label: 'Pending GST', description: 'Awaiting GST verification' },
    { value: 'suspended', label: 'Suspended', description: 'Temporarily suspended' },
    { value: 'rejected', label: 'Rejected', description: 'Registration rejected' }
  ];

  // Don't render anything if vendor is null
  if (!vendor) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="vendor-modal-premium">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold">Vendor Details - {vendor.businessName || 'Unknown Vendor'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <Row className="g-4">
          {/* Vendor Information Column */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom-0">
                <h6 className="fw-semibold mb-0">Vendor Information (From Database)</h6>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-4">
                  <img
                    src={vendor.profileImageUrl || 'https://placehold.co/200x200/667eea/ffffff?text=BH'}
                    alt={vendor.businessName}
                    className="vendor-modal-image rounded-3 mb-3"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/200x200/667eea/ffffff?text=BH';
                    }}
                  />
                  <h5 className="fw-bold">{vendor.businessName || 'No Business Name'}</h5>
                  <Badge 
                    bg={
                      vendor.verificationStatus === 'verified_gst' ? 'primary' : 
                      vendor.verificationStatus === 'verified_basic' ? 'success' : 
                      vendor.verificationStatus === 'pending_review_basic' ? 'warning' : 'secondary'
                    }
                    className="mb-3"
                  >
                    {vendor.verificationStatus || 'unknown'}
                  </Badge>
                </div>

                <div className="vendor-details">
                  <Row className="g-3">
                    <Col sm={6}>
                      <label className="text-muted small">Owner Name</label>
                      <div className="fw-semibold">{vendor.ownerName || 'N/A'}</div>
                    </Col>
                    <Col sm={6}>
                      <label className="text-muted small">Category</label>
                      <div className="fw-semibold">{vendor.category || 'N/A'}</div>
                    </Col>
                    <Col sm={6}>
                      <label className="text-muted small">Aadhar Number</label>
                      <div className="fw-semibold">{vendor.aadharNumber || 'N/A'}</div>
                    </Col>
                    <Col sm={6}>
                      <label className="text-muted small">Submitted GSTIN</label>
                      <div className="fw-semibold">{vendor.gstin || 'Not Provided'}</div>
                    </Col>
                    <Col sm={6}>
                      <label className="text-muted small">Email</label>
                      <div className="fw-semibold">{vendor.contactEmail || 'N/A'}</div>
                    </Col>
                    <Col sm={6}>
                      <label className="text-muted small">Phone</label>
                      <div className="fw-semibold">{vendor.contactPhone || 'N/A'}</div>
                    </Col>
                    <Col sm={12}>
                      <label className="text-muted small">Address</label>
                      <div className="fw-semibold">
                        {vendor.location?.street || ''}{vendor.location?.street && vendor.location?.city ? ', ' : ''}
                        {vendor.location?.city || ''}{vendor.location?.city && vendor.location?.state ? ', ' : ''}
                        {vendor.location?.state || 'N/A'}
                      </div>
                    </Col>
                    <Col sm={12}>
                      <label className="text-muted small">Description</label>
                      <div className="fw-semibold">{vendor.description || 'No description provided'}</div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* GST Verification Column */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom-0">
                <h6 className="fw-semibold mb-0">GST Verification</h6>
              </Card.Header>
              <Card.Body>
                {!gstVerificationResult ? (
                  // GST Verification Input
                  <div className="p-3 border rounded">
                    <h6 className="fw-semibold mb-3">Verify GSTIN</h6>
                    <InputGroup className="mb-3">
                      <Form.Control
                        type="text"
                        value={gstinInput}
                        onChange={(e) => setGstinInput(e.target.value)}
                        placeholder="Enter GSTIN for verification"
                      />
                      <Button 
                        variant="primary" 
                        onClick={handleGstinVerification}
                        disabled={gstVerificationLoading || !gstinInput}
                      >
                        {gstVerificationLoading ? 'Verifying...' : 'Verify GSTIN'}
                      </Button>
                    </InputGroup>
                    <small className="text-muted">
                      Verify GSTIN with government records to compare with vendor data.
                    </small>
                  </div>
                ) : (
                  // GST Verification Results
                  <div className="verification-results">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-semibold mb-0">GST API Results</h6>
                      <Badge bg={gstVerificationResult.gstVerificationResult?.isValid ? "success" : "danger"}>
                        {gstVerificationResult.gstVerificationResult?.isValid ? "VALID" : "INVALID"}
                      </Badge>
                    </div>

                    {/* Data Comparison Table */}
                    <div className="comparison-table">
                      <h6 className="fw-semibold mb-3">Data Comparison</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Field</th>
                              <th>Vendor Submitted</th>
                              <th>GST API Result</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Business Name Comparison */}
                            <tr>
                              <td className="fw-semibold">Business Name</td>
                              <td>{vendor.businessName || 'N/A'}</td>
                              <td>{gstVerificationResult.gstVerificationResult?.businessName || 'N/A'}</td>
                              <td>
                                <Badge 
                                  bg={
                                    vendor.businessName?.toLowerCase() === gstVerificationResult.gstVerificationResult?.businessName?.toLowerCase() 
                                      ? 'success' 
                                      : 'danger'
                                  }
                                >
                                  {vendor.businessName?.toLowerCase() === gstVerificationResult.gstVerificationResult?.businessName?.toLowerCase() 
                                    ? 'Match' 
                                    : 'Mismatch'}
                                </Badge>
                              </td>
                            </tr>
                            
                            {/* Owner Name Comparison */}
                            <tr>
                              <td className="fw-semibold">Legal Name</td>
                              <td>{vendor.ownerName || 'N/A'}</td>
                              <td>{gstVerificationResult.gstVerificationResult?.ownerName || 'N/A'}</td>
                              <td>
                                <Badge 
                                  bg={
                                    vendor.ownerName?.toLowerCase() === gstVerificationResult.gstVerificationResult?.ownerName?.toLowerCase() 
                                      ? 'success' 
                                      : 'warning'
                                  }
                                >
                                  {vendor.ownerName?.toLowerCase() === gstVerificationResult.gstVerificationResult?.ownerName?.toLowerCase() 
                                    ? 'Match' 
                                    : 'Check'}
                                </Badge>
                              </td>
                            </tr>

                            {/* GSTIN Comparison */}
                            <tr>
                              <td className="fw-semibold">GSTIN</td>
                              <td>{vendor.gstin || 'Not Provided'}</td>
                              <td>{gstVerificationResult.gstVerificationResult?.data?.gstin || 'N/A'}</td>
                              <td>
                                <Badge 
                                  bg={
                                    vendor.gstin === gstVerificationResult.gstVerificationResult?.data?.gstin 
                                      ? 'success' 
                                      : vendor.gstin ? 'warning' : 'info'
                                  }
                                >
                                  {vendor.gstin === gstVerificationResult.gstVerificationResult?.data?.gstin 
                                    ? 'Match' 
                                    : vendor.gstin ? 'Mismatch' : 'Not Provided'}
                                </Badge>
                              </td>
                            </tr>

                            {/* Status Comparison */}
                            <tr>
                              <td className="fw-semibold">Status</td>
                              <td>
                                <Badge bg={
                                  vendor.verificationStatus === 'verified_gst' ? 'success' : 
                                  vendor.verificationStatus === 'verified_basic' ? 'primary' : 'warning'
                                }>
                                  {vendor.verificationStatus}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg={
                                  gstVerificationResult.gstVerificationResult?.status === 'Active' ? 'success' : 'danger'
                                }>
                                  {gstVerificationResult.gstVerificationResult?.status || 'N/A'}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg="info">
                                  Comparison
                                </Badge>
                              </td>
                            </tr>

                            {/* Business Type */}
                            <tr>
                              <td className="fw-semibold">Business Type</td>
                              <td>Proprietorship</td>
                              <td>{gstVerificationResult.gstVerificationResult?.businessType || 'N/A'}</td>
                              <td>
                                <Badge bg="info">
                                  Info
                                </Badge>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Additional GST API Details */}
                    <div className="gst-details mt-4">
                      <h6 className="fw-semibold mb-3">GST API Raw Data</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-borderless">
                          <tbody>
                            <tr>
                              <td className="text-muted" style={{width: '40%'}}>Registration Date:</td>
                              <td className="fw-semibold">{gstVerificationResult.gstVerificationResult?.registrationDate || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td className="text-muted">Address:</td>
                              <td className="fw-semibold">{gstVerificationResult.gstVerificationResult?.principalAddress || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td className="text-muted">Nature of Business:</td>
                              <td className="fw-semibold">
                                {gstVerificationResult.gstVerificationResult?.additionalData?.natureOfBusiness?.join(', ') || 'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td className="text-muted">State Jurisdiction:</td>
                              <td className="fw-semibold">{gstVerificationResult.gstVerificationResult?.additionalData?.stateJurisdiction || 'N/A'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Verification Status Selection */}
                    <div className="verification-actions mt-4 p-3 border rounded">
                      <h6 className="fw-semibold mb-3">Set Verification Status</h6>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Verification Status</Form.Label>
                        <Form.Select
                          value={selectedVerificationStatus}
                          onChange={(e) => setSelectedVerificationStatus(e.target.value)}
                        >
                          {verificationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label} - {option.description}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Verification Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Add notes about this verification (optional)"
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                        />
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          onClick={handleUpdateVerificationStatus}
                          className="flex-fill"
                        >
                          Update Verification Status
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => setGstVerificationResult(null)}
                        >
                          Re-verify
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Status Update (Always visible) */}
                {!gstVerificationResult && (
                  <div className="mt-4 p-3 border rounded">
                    <h6 className="fw-semibold mb-3">Quick Status Update</h6>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Select
                          value={selectedVerificationStatus}
                          onChange={(e) => setSelectedVerificationStatus(e.target.value)}
                        >
                          {verificationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={6}>
                        <Button
                          variant="outline-primary"
                          onClick={() => onVerificationUpdate(vendor.id, selectedVerificationStatus, verificationNotes)}
                          className="w-100"
                        >
                          Update Status
                        </Button>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-top-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        {vendor.verificationStatus === 'pending_review_basic' && (
          <Button
            variant="success"
            onClick={() => {
              onVerificationUpdate(vendor.id, 'verified_basic', 'Approved by admin');
              onHide();
            }}
          >
            Approve Vendor
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AdminDashboardPage;