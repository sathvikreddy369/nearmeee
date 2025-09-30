import React, { useMemo } from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css'
function ConversationList({ conversations, onSelectConversation, activeConversationId }) {
  const { currentUser } = useAuth();

  const processedConversations = useMemo(() => {
    return conversations.map((conv) => {
      const unreadCount = conv.unreadCounts && conv.unreadCounts[currentUser.uid] ? conv.unreadCounts[currentUser.uid] : 0;

      let contextDisplay = '';
      let contextIcon = 'bi-chat-dots';
      let contextColor = '#6c757d';
      
      if (conv.type === 'user-vendor') {
        contextDisplay = 'Vendor';
        contextIcon = 'bi-shop';
        contextColor = '#007bff';
      } else if (conv.type === 'admin-user') {
        contextDisplay = 'Support';
        contextIcon = 'bi-headset';
        contextColor = '#28a745';
      } else if (conv.type === 'admin-vendor') {
        contextDisplay = 'Business Support';
        contextIcon = 'bi-briefcase';
        contextColor = '#ffc107';
      }

      const timestamp = conv.lastMessageTimestamp || new Date();
      
      const formatConversationTime = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          return '';
        }
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date >= today) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (date >= yesterday) {
          return 'Yesterday';
        } else if (date.getFullYear() === now.getFullYear()) {
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
          return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
        }
      };

      const getLastMessagePreview = (lastMessage) => {
        if (!lastMessage?.text) return 'No messages yet.';
        
        const preview = lastMessage.text.length > 60 
          ? lastMessage.text.substring(0, 60) + '...' 
          : lastMessage.text;
        
        return lastMessage.senderId === currentUser.uid 
          ? `You: ${preview}`
          : preview;
      };

      return {
        ...conv,
        unreadCount,
        contextDisplay,
        contextIcon,
        contextColor,
        formattedTime: formatConversationTime(timestamp),
        lastMessagePreview: getLastMessagePreview(conv.lastMessage),
        isActive: activeConversationId === conv.id
      };
    });
  }, [conversations, currentUser.uid, activeConversationId]);

  if (conversations.length === 0) {
    return (
      <div className="conversations-empty-premium text-center p-5">
        <i className="bi bi-chat-left-text display-4 text-muted mb-3 d-block"></i>
        <h5 className="text-muted mb-2">No conversations</h5>
        <p className="text-muted mb-0">Start chatting with businesses to see conversations here</p>
      </div>
    );
  }

  return (
    <div className="conversation-list-premium">
      <div className="conversation-header-premium p-3 border-bottom">
        <h5 className="mb-0 fw-bold text-dark">Messages</h5>
        <small className="text-muted">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</small>
      </div>
      
      <div className="conversations-container">
        {processedConversations.map((conv, index) => (
          <div
            key={`${conv.id}-${index}`}
            className={`conversation-item-premium ${conv.isActive ? 'active' : ''}`}
            onClick={() => onSelectConversation(conv)}
          >
            <div className="conversation-avatar">
              <div 
                className="avatar-placeholder"
                style={{ backgroundColor: conv.contextColor }}
              >
                <i className={`bi ${conv.contextIcon} text-white`}></i>
              </div>
              {conv.unreadCount > 0 && (
                <div className="unread-indicator-premium"></div>
              )}
            </div>
            
            <div className="conversation-content">
              <div className="conversation-header">
                <div className="conversation-info">
                  <h6 className="conversation-name mb-0 fw-semibold">
                    {conv.partnerName}
                  </h6>
                  <span 
                    className="conversation-context"
                    style={{ color: conv.contextColor }}
                  >
                    <i className={`bi ${conv.contextIcon} me-1`}></i>
                    {conv.contextDisplay}
                  </span>
                </div>
                <div className="conversation-meta">
                  <span className="conversation-time text-muted">
                    {conv.formattedTime}
                  </span>
                  {conv.unreadCount > 0 && (
                    <Badge bg="danger" pill className="ms-2 unread-badge">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="conversation-preview">
                <p className="mb-0 text-muted conversation-message">
                  {conv.lastMessagePreview}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversationList;