import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Spinner, Alert, Button, 
  ListGroup, Badge, Form, InputGroup, Dropdown, Modal 
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import * as notificationApi from '../services/notificationApi';
import '../styles/NotificationsPage.css';
function NotificationsPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setFilteredNotifications([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const fetchedNotifications = await notificationApi.getNotifications();
      setNotifications(fetchedNotifications);
      setFilteredNotifications(fetchedNotifications);
    } catch (err) {
      setError(err?.message || 'Failed to fetch notifications.');
      console.error('NotificationsPage: Error fetching notifications:', err);
      addToast('danger', 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications based on type and search term
  useEffect(() => {
    let filtered = notifications;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filterType, searchTerm]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      addToast('success', 'Notification marked as read.');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      addToast('danger', 'Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    setBulkActionLoading(true);
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setSelectedNotifications(new Set());
      addToast('success', 'All notifications marked as read.');
    } catch (err) {
      console.error('Error marking all as read:', err);
      addToast('danger', 'Failed to mark all notifications as read.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      addToast('success', 'Notification deleted.');
    } catch (err) {
      console.error('Error deleting notification:', err);
      addToast('danger', 'Failed to delete notification.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.size === 0) return;

    setBulkActionLoading(true);
    try {
      const deletePromises = Array.from(selectedNotifications).map(id =>
        notificationApi.deleteNotification(id)
      );
      await Promise.all(deletePromises);
      
      setNotifications(prev => prev.filter(n => !selectedNotifications.has(n.id)));
      setSelectedNotifications(new Set());
      setShowDeleteModal(false);
      addToast('success', `${selectedNotifications.size} notification(s) deleted.`);
    } catch (err) {
      console.error('Error bulk deleting notifications:', err);
      addToast('danger', 'Failed to delete notifications.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.type === 'new_message' && notification.conversationId) {
      navigate(`/messages?conversation=${notification.conversationId}`);
    } else if (notification.type === 'new_review' && notification.vendorId) {
      navigate(`/vendors/${notification.vendorId}`);
    } else if (notification.type === 'vendor_approved' && notification.vendorId) {
      navigate(`/vendor-dashboard`);
    }
    // Add more navigation cases as needed
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return 'bi-chat-dots-fill text-primary';
      case 'new_review':
        return 'bi-star-fill text-warning';
      case 'vendor_approved':
        return 'bi-check-circle-fill text-success';
      case 'vendor_rejected':
        return 'bi-x-circle-fill text-danger';
      case 'booking_confirmed':
        return 'bi-calendar-check-fill text-info';
      case 'system':
        return 'bi-info-circle-fill text-secondary';
      default:
        return 'bi-bell-fill text-muted';
    }
  };

  const getNotificationTypeLabel = (type) => {
    const labels = {
      'new_message': 'New Message',
      'new_review': 'New Review',
      'vendor_approved': 'Business Approved',
      'vendor_rejected': 'Business Rejected',
      'booking_confirmed': 'Booking Confirmed',
      'system': 'System Notification'
    };
    return labels[type] || 'Notification';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const selectedCount = selectedNotifications.size;

  if (!currentUser) {
    return (
      <Container className="notifications-premium d-flex align-items-center justify-content-center min-vh-100">
        <Alert variant="info" className="text-center">
          <i className="bi bi-person-x display-4 d-block mb-3"></i>
          <h5>Authentication Required</h5>
          <p className="mb-3">Please log in to view your notifications.</p>
          <Button variant="primary" onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="notifications-premium py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold text-dark mb-2">Notifications</h1>
              <p className="text-muted mb-0">
                {unreadCount > 0 
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up!'
                }
              </p>
            </div>
            <div className="d-flex gap-2">
              {selectedCount > 0 && (
                <>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={bulkActionLoading}
                  >
                    <i className="bi bi-check-all me-2"></i>
                    Mark Selected Read
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={bulkActionLoading}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete Selected ({selectedCount})
                  </Button>
                </>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={bulkActionLoading}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-start-0"
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-3">
            <Form.Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="all">All Types</option>
              <option value="new_message">Messages</option>
              <option value="new_review">Reviews</option>
              <option value="vendor_approved">Approvals</option>
              <option value="booking_confirmed">Bookings</option>
              <option value="system">System</option>
            </Form.Select>
            
            <Button
              variant="outline-secondary"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
          </div>
        </Col>
      </Row>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="text-muted mt-3">Loading your notifications...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <div className="mt-3">
            <Button variant="outline-danger" onClick={fetchNotifications}>
              Try Again
            </Button>
          </div>
        </Alert>
      ) : filteredNotifications.length === 0 ? (
        <Card className="text-center border-0 shadow-sm">
          <Card.Body className="py-5">
            <i className="bi bi-bell-slash display-1 text-muted mb-3"></i>
            <h5 className="text-muted">No notifications found</h5>
            <p className="text-muted mb-0">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : "You're all caught up! We'll notify you when there's new activity."
              }
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {/* Select All Header */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-bottom bg-light">
                <Form.Check
                  type="checkbox"
                  label={`Select all ${filteredNotifications.length} notifications`}
                  checked={selectedNotifications.size === filteredNotifications.length}
                  onChange={handleSelectAll}
                  className="fw-medium"
                />
              </div>
            )}

            <ListGroup variant="flush">
              {filteredNotifications.map((notification) => (
                <ListGroup.Item
                  key={notification.id}
                  className={`notification-item p-4 border-bottom ${
                    !notification.read ? 'notification-unread' : ''
                  } ${selectedNotifications.has(notification.id) ? 'notification-selected' : ''}`}
                >
                  <div className="d-flex align-items-start">
                    {/* Checkbox for selection */}
                    <div className="me-3 mt-1">
                      <Form.Check
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                      />
                    </div>

                    {/* Notification Icon */}
                    <div className="notification-icon me-3">
                      <i className={`bi ${getNotificationIcon(notification.type)} fs-4`}></i>
                    </div>

                    {/* Notification Content */}
                    <div 
                      className="flex-grow-1 notification-content"
                      onClick={() => handleNotificationClick(notification)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Badge 
                            bg="outline-primary" 
                            className="me-2 type-badge"
                          >
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <Badge bg="primary" pill className="unread-badge">
                              New
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted">
                          {formatTime(notification.timestamp || notification.createdAt)}
                        </small>
                      </div>
                      
                      <p className="mb-2 fw-medium text-dark">
                        {notification.message}
                      </p>

                      {notification.metadata && (
                        <small className="text-muted d-block">
                          {Object.entries(notification.metadata).map(([key, value]) => (
                            <span key={key} className="me-3">
                              <strong>{key}:</strong> {value}
                            </span>
                          ))}
                        </small>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="ms-3 d-flex flex-column gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <i className="bi bi-check"></i>
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        title="Delete notification"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      )}

      {/* Bulk Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete {selectedCount} selected notification{selectedCount !== 1 ? 's' : ''}? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={bulkActionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleBulkDelete}
            disabled={bulkActionLoading}
          >
            {bulkActionLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              `Delete ${selectedCount} Notification${selectedCount !== 1 ? 's' : ''}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default NotificationsPage;