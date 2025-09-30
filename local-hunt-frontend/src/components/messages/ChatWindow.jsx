import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, InputGroup, Spinner, Alert, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css'
function ChatWindow({ messages, onSendMessage, otherUserName, onBack, isLoading, conversationId, currentUserId }) {
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: messages.length > 0 ? 'smooth' : 'auto',
      block: 'end'
    });
  }, [messages]);

  // Simulate typing indicator (you can replace this with real typing detection)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].senderId !== currentUser?.uid) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages, currentUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp || !(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
      return 'Invalid time';
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (timestamp >= today) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timestamp >= yesterday) {
      return `Yesterday ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + 
             timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getReadReceiptText = (message) => {
    if (message.senderId !== currentUserId) return null;
    
    const readStatus = message.readStatus || { isRead: false, readAt: null };
    
    if (readStatus.isRead && readStatus.readAt) {
      return `Read ${formatMessageTime(readStatus.readAt)}`;
    } else if (readStatus.isRead) {
      return 'Read';
    } else {
      return 'Delivered';
    }
  };

  const ReadReceiptTooltip = ({ message }) => {
    const readStatus = message.readStatus || { isRead: false, readAt: null };
    
    if (message.senderId !== currentUserId) return null;
    
    return (
      <Tooltip id={`read-tooltip-${message.id}`}>
        <div className="text-start">
          <div className="fw-semibold">Message Status</div>
          {readStatus.isRead ? (
            <div>
              <div>✓ Read</div>
              {readStatus.readAt && (
                <div className="text-muted small">
                  {formatMessageTime(readStatus.readAt)}
                </div>
              )}
            </div>
          ) : (
            <div>✓ Delivered</div>
          )}
        </div>
      </Tooltip>
    );
  };

  if (!currentUser) {
    return (
      <div className="chat-window-premium d-flex align-items-center justify-content-center">
        <div className="text-center text-muted p-5">
          <i className="bi bi-chat-dots display-4 d-block mb-3"></i>
          <h5>Please log in to chat</h5>
          <p className="mb-0">Sign in to start messaging with businesses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window-premium">
      {/* Header */}
      <header className="chat-header-premium">
        <div className="d-flex align-items-center">
          <Button 
            variant="link" 
            onClick={onBack} 
            className="d-md-none p-0 me-3 text-dark"
          >
            <i className="bi bi-arrow-left fs-5"></i>
          </Button>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center">
              <div className="user-avatar-small me-3">
                <div className="avatar-placeholder bg-primary text-white">
                  {otherUserName?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">{otherUserName}</h5>
                <div className="d-flex align-items-center">
                  <Badge bg="success" className="me-2" style={{ fontSize: '0.6rem' }}>
                    <i className="bi bi-circle-fill me-1"></i>
                    Online
                  </Badge>
                  <small className="text-muted">Active now</small>
                </div>
              </div>
            </div>
          </div>
          {isLoading && (
            <Spinner animation="border" size="sm" variant="primary" />
          )}
        </div>
      </header>

      {/* Messages Body */}
      <div className="chat-body-premium">
        {isLoading && messages.length === 0 ? (
          <div className="chat-loading-premium">
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 text-muted">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-premium">
            <i className="bi bi-chat-quote display-1 text-muted mb-3"></i>
            <h5 className="text-muted">No messages yet</h5>
            <p className="text-muted mb-0">Start the conversation with {otherUserName}</p>
          </div>
        ) : (
          <>
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div 
                  key={msg.tempId || msg.id || index} 
                  className={`message-wrapper-premium ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}
                >
                  <div className="message-bubble-premium">
                    <div className="message-text">{msg.text}</div>
                    <div className="message-footer-premium">
                      <span className="message-time">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                      {msg.senderId === currentUser.uid && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<ReadReceiptTooltip message={msg} />}
                        >
                          <span className="read-receipt-premium ms-2">
                            <span className="receipt-icons">
                              {getReadReceiptText(msg) === 'Read' ? '✓✓' : '✓'}
                            </span>
                            {getReadReceiptText(msg) && (
                              <span className="receipt-text ms-1 d-none d-sm-inline">
                                {getReadReceiptText(msg)}
                              </span>
                            )}
                          </span>
                        </OverlayTrigger>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="message-wrapper-premium received">
                  <div className="message-bubble-premium">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} className="messages-anchor" />
          </>
        )}
      </div>

      {/* Message Input */}
      <footer className="chat-footer-premium">
        <Form onSubmit={handleSend} className="w-100">
          <InputGroup className="message-input-group">
            <Form.Control
              type="text"
              placeholder={`Message ${otherUserName}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              autoComplete="off"
              className="message-input"
              disabled={isLoading}
              maxLength={1000}
            />
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!newMessage.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <i className="bi bi-send-fill"></i>
              )}
            </Button>
          </InputGroup>
          {newMessage.length > 0 && (
            <div className="message-length-indicator">
              <small className={`text-muted ${newMessage.length > 800 ? 'text-warning' : ''}`}>
                {newMessage.length}/1000
              </small>
            </div>
          )}
        </Form>
      </footer>
    </div>
  );
}

export default ChatWindow;