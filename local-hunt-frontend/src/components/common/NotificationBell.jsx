// src/components/common/NotificationBell.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
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

    // Poll for new notifications every 2 minutes
    const intervalId = setInterval(fetchUnreadCount, 2 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);

  if (!currentUser) return null;

  const BellIcon = unreadCount > 0 ? Bell : BellOff;

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id="notification-tooltip">
          {unreadCount > 0 
            ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : 'No new notifications'
          }
        </Tooltip>
      }
    >
      <Button 
        as={Link} 
        to="/notifications" 
        variant="link" 
        className="notification-bell position-relative p-1 me-2"
        style={{
          minWidth: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? (
          <Spinner 
            animation="border" 
            size="sm" 
            style={{ 
              width: '16px', 
              height: '16px',
              color: 'var(--text-secondary)'
            }} 
          />
        ) : (
          <>
            <BellIcon 
              size={20} 
              className="notification-icon"
              style={{
                color: 'var(--text-secondary)',
                transition: 'all 0.3s ease'
              }}
            />
            {unreadCount > 0 && (
              <Badge 
                pill 
                bg="danger" 
                className="position-absolute top-0 start-100 translate-middle notification-badge"
                style={{
                  fontSize: '0.6rem',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  transform: 'translate(-30%, -30%)'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
                <span className="visually-hidden">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </span>
              </Badge>
            )}
          </>
        )}
        
        {/* Hidden error display for accessibility */}
        {error && (
          <span className="visually-hidden" role="alert">
            Error loading notifications: {error}
          </span>
        )}
      </Button>
    </OverlayTrigger>
  );
}

export default NotificationBell;