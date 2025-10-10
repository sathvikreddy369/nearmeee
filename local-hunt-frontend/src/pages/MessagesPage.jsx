import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { 
  listenToConversations,
  listenToMessages,
  sendMessage,
  markMessagesAsRead,
  getMessageReadStatus
} from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import ChatWindow from '../components/messages/ChatWindow';
import ConversationList from '../components/messages/ConversationList';
import * as vendorApi from '../services/vendorApi';
import { useToast } from '../contexts/ToastContext';

import '../styles/MessagesPage.css';

function MessagesPage() {
  const { currentUser } = useAuth();
  const { vendorId: urlVendorId } = useParams();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [showChatWindowMobile, setShowChatWindowMobile] = useState(false);

  // Listener for conversations with proper error handling
  useEffect(() => {
    if (!currentUser) {
      setLoadingConversations(false);
      return;
    }

    const unsubscribe = listenToConversations(
      currentUser.uid, 
      (fetchedConversations) => {
        setConversations(fetchedConversations);
        setLoadingConversations(false);
        setError('');
      },
      (error) => {
        setError('Failed to load conversations: ' + error.message);
        setLoadingConversations(false);
        console.error('Conversations listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Listener for messages of the selected conversation with safety checks
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    
    const unsubscribe = listenToMessages(
      selectedConversation.id, 
      (fetchedMessages) => {
        // Process messages with read status
        const processedMessages = fetchedMessages.map(msg => ({
          ...msg,
          readStatus: getMessageReadStatus(msg, currentUser.uid)
        }));
        
        setMessages(processedMessages);
        setLoadingMessages(false);
        
        // Only mark as read if we have messages and the conversation exists
        if (processedMessages.length > 0) {
          markMessagesAsRead(selectedConversation.id, currentUser.uid);
        }
      },
      (error) => {
        setLoadingMessages(false);
        console.error('Messages listener error:', error);
        setMessages([]);
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, currentUser]);

  // Effect to handle initiating a chat from a vendor's page (FIXED LOGIC)
  useEffect(() => {
    const initChat = async () => {
      if (!urlVendorId || !currentUser || loadingConversations || selectedConversation) return;

      console.log('Initializing chat with vendor:', urlVendorId);
      
      // Look for existing conversation with this vendor
      const existingConv = conversations.find(c => 
        c.type === 'user-vendor' && c.contextId === urlVendorId
      );

      if (existingConv) {
        console.log('Found existing conversation:', existingConv.id);
        setSelectedConversation(existingConv);
        setShowChatWindowMobile(true);
      } else {
        try {
          console.log('Creating new conversation for vendor:', urlVendorId);
          const vendor = await vendorApi.getVendorById(urlVendorId);
          if (vendor && vendor.userId) {
            const tempConv = {
              id: [currentUser.uid, vendor.userId].sort().join('_') + `_user-vendor_${vendor.id}`,
              partnerName: vendor.businessName || 'Vendor',
              receiverId: vendor.userId,
              contextId: vendor.id,
              type: 'user-vendor',
              // Add these fields to match the conversation structure
              participants: [currentUser.uid, vendor.userId],
              lastMessage: null,
              lastMessageTimestamp: null,
              unreadCounts: { [currentUser.uid]: 0 }
            };
            console.log('Created temporary conversation:', tempConv.id);
            setSelectedConversation(tempConv);
            setShowChatWindowMobile(true);
          } else {
            addToast('danger', 'Vendor information is incomplete.');
          }
        } catch (err) {
          console.error('Error fetching vendor:', err);
          addToast('danger', 'Could not find vendor to start chat.');
        }
      }
    };
    
    initChat();
  }, [urlVendorId, currentUser, conversations, loadingConversations, addToast, selectedConversation]); 

  const handleSelectConversation = useCallback((conv) => {
    if (!conv?.id) {
      console.warn('Attempted to select invalid conversation:', conv);
      return;
    }
    console.log('Selecting conversation:', conv.id);
    setSelectedConversation(conv);
    setShowChatWindowMobile(true);
  }, []);

  const handleSendMessage = useCallback(async (text) => {
    if (!selectedConversation || !text.trim()) {
      console.warn('Attempted to send empty message or no conversation selected');
      return;
    }

    try {
      console.log('Sending message to conversation:', selectedConversation.id);
      await sendMessage({
        senderId: currentUser.uid,
        receiverId: selectedConversation.receiverId,
        text: text.trim(),
        type: selectedConversation.type,
        contextId: selectedConversation.contextId,
      });
      
      // Message sent successfully
      console.log('Message sent successfully');
      
    } catch (err) {
      console.error('Send message error:', err);
      addToast('danger', 'Failed to send message: ' + (err.message || 'Unknown error'));
    }
  }, [selectedConversation, currentUser, addToast]);

  const handleBackToConversations = useCallback(() => {
    console.log('Navigating back to conversations list');
    setSelectedConversation(null);
    setShowChatWindowMobile(false);
  }, []);

  // Show loading state while checking authentication
  if (!currentUser) {
    return (
      <Container className="my-5">
        <Alert variant="info">Please log in to access messages.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="messages-page-container py-4">
      <Row className="h-100">
        {/* Conversations List Column */}
        <Col 
          md={4} 
          lg={3} 
          className={`conversation-list-col ${
            showChatWindowMobile && !selectedConversation 
              ? 'd-block' 
              : showChatWindowMobile 
                ? 'd-none d-md-block' 
                : ''
          }`}
        >
          <h4 className="p-3 mb-0 fw-bold text-primary-dark">Conversations</h4>
          {loadingConversations ? (
            <div className="text-center mt-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Loading conversations...</div>
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-3">
              {error}
              <div className="mt-2">
                <small>Please check your internet connection and try again.</small>
              </div>
            </Alert>
          ) : (
            <ConversationList
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              activeConversationId={selectedConversation?.id}
            />
          )}
        </Col>

        {/* Chat Window Column */}
        <Col 
          md={8} 
          lg={9} 
          className={`chat-window-col ${
            !showChatWindowMobile ? 'd-none d-md-block' : ''
          }`}
        >
          {selectedConversation ? (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              otherUserName={selectedConversation.partnerName}
              onBack={handleBackToConversations}
              isLoading={loadingMessages}
              conversationId={selectedConversation.id}
              currentUserId={currentUser.uid}
            />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted">
              <div className="text-center">
                <p className="fw-medium mb-1">Select a conversation to start chatting</p>
                <small className="text-muted">
                  {conversations.length === 0 ? 'No conversations yet' : 'Choose from your conversations'}
                </small>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default MessagesPage;