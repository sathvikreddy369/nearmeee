// src/components/common/NotificationBell.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as notificationApi from '../../services/notificationApi';
import { useAuth } from '../../contexts/AuthContext';
import './common.css';
function NotificationBell() {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const notifications = await notificationApi.getNotifications(true); // Fetch unread only
      setUnreadCount(notifications.length);
    } catch (err) {
      setError(err || 'Failed to fetch notifications count.');
      console.error('NotificationBell: Error fetching count:', err);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUnreadCount();

    // Optional: Poll for new notifications every X minutes
    const intervalId = setInterval(fetchUnreadCount, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);

  if (!currentUser) return null; // Don't show bell if not logged in

  return (
    <Button as={Link} to="/notifications" variant="link" className="position-relative text-white me-3">
      {loading ? (
        <Spinner animation="border" size="sm" className="text-white" />
      ) : (
        <>
          {/* Icon for bell (you might need to import a proper icon library like FontAwesome) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bell" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 1.219-.365 1.765L2.76 10.1A.5.5 0 0 0 3.25 11h9.5a.5.5 0 0 0 .49-.89l-1.47-2.345A4.002 4.002 0 0 0 12 6c0-2.43-1.912-4.342-4.342-4.082L8 1.918zM10 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
          </svg>
          {unreadCount > 0 && (
            <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
              {unreadCount}
              <span className="visually-hidden">unread messages</span>
            </Badge>
          )}
        </>
      )}
    </Button>
  );
}

export default NotificationBell;