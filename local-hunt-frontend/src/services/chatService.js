import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs, // ADD THIS IMPORT
  updateDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import * as vendorApi from './vendorApi';

// Helper function to check if an ID is a valid, non-empty string.
const isValidId = (id) => {
  return id && typeof id === 'string' && id.length > 10;
}

// Enhanced error handler
const handleFirestoreError = (error, operation) => {
  console.error(`Firestore ${operation} error:`, error);
  if (error.code === 'permission-denied') {
    throw new Error(`Permission denied: You don't have access to ${operation}.`);
  }
  throw error;
};

/**
 * Convert Firestore timestamp to JavaScript Date
 */
const convertTimestamp = (timestamp) => {
  if (!timestamp) return new Date();
  
  try {
    if (timestamp instanceof Date) {
      return timestamp;
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    } else if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
  } catch (error) {
    console.warn('Error converting timestamp:', error);
  }
  
  return new Date();
};

/**
 * Listens for real-time updates to a user's conversations.
 */
export const listenToConversations = (userId, onUpdate, onError) => {
  if (!userId) {
    console.warn('No user ID provided for listenToConversations');
    return () => {};
  }

  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );

  return onSnapshot(q, 
    async (snapshot) => {
      try {
        const conversations = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const conv = { id: docSnapshot.id, ...docSnapshot.data() };
            const partnerId = conv.participants.find(p => p !== userId);
            if (!partnerId) return null;

            let partnerName = 'Unknown User';
            let partnerAvatar = null;

            try {
              const userDoc = await getDoc(doc(db, 'users', partnerId));
              if (userDoc.exists()) {
                partnerName = userDoc.data().name || partnerName;
                partnerAvatar = userDoc.data().avatarUrl;
              }

              if (conv.type === 'user-vendor') {
                if (isValidId(conv.contextId)) {
                  const vendor = await vendorApi.getVendorById(conv.contextId);
                  if (vendor) {
                    partnerName = vendor.businessName;
                    partnerAvatar = vendor.profileImageUrl;
                  }
                } else {
                  console.warn('Malformed conversation found:', conv.id, 'Invalid contextId:', conv.contextId);
                }
              }
            } catch (error) {
              console.error(`Error fetching partner details for conversation ${conv.id}:`, error.message);
            }
            
            // Convert timestamps
            const lastMessageTimestamp = convertTimestamp(conv.lastMessageTimestamp);
            
            return { 
              ...conv, 
              receiverId: partnerId, 
              partnerName, 
              partnerAvatar,
              lastMessageTimestamp,
              formattedTime: lastMessageTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          })
        );
        onUpdate(conversations.filter(Boolean));
      } catch (error) {
        if (onError) onError(error);
      }
    },
    (error) => {
      console.error('Conversations listener error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Listens for real-time updates to messages within a specific conversation.
 */
export const listenToMessages = (conversationId, onUpdate, onError) => {
  if (!isValidId(conversationId)) {
    console.warn('Invalid conversation ID provided:', conversationId);
    return () => {};
  }

  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, 
    (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = convertTimestamp(data.timestamp);
        
        return { 
          id: doc.id, 
          ...data,
          timestamp,
          formattedTime: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      
      onUpdate(messages);
    },
    (error) => {
      console.error('Message listener error for conversation', conversationId, error);
      if (onError) onError(error);
    }
  );
};

/**
 * Sends a message and creates/updates a conversation document.
 */
export const sendMessage = async ({ senderId, receiverId, text, type, contextId }) => {
  if (!senderId || !receiverId) {
    throw new Error('Cannot send message: Missing sender or receiver ID.');
  }

  if (type === 'user-vendor' && !isValidId(contextId)) {
    throw new Error('Cannot send message: Invalid vendor context.');
  }

  const conversationId = [senderId, receiverId].sort().join('_') + `_${type}_${contextId || ''}`;
  const convRef = doc(db, 'conversations', conversationId);
  const messagesColRef = collection(convRef, 'messages');

  try {
    const batch = writeBatch(db);

    // 1. Add the new message document with read status
    const newMessageRef = doc(messagesColRef);
    const messageData = {
      senderId,
      receiverId,
      text: text.trim(),
      timestamp: serverTimestamp(),
      read: false, // Message starts as unread
      readAt: null,
    };
    batch.set(newMessageRef, messageData);

    // 2. Create or update the conversation document
    const convData = {
      participants: [senderId, receiverId],
      type,
      contextId: contextId || null,
      lastMessage: { 
        text: text.trim().substring(0, 100),
        senderId 
      },
      lastMessageTimestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      // Initialize unread counts
      unreadCounts: {
        [senderId]: 0,
        [receiverId]: 1 // Receiver has 1 unread message
      },
      // Track last read timestamps
      lastRead: {
        [senderId]: serverTimestamp(),
        [receiverId]: null
      }
    };
    
    batch.set(convRef, convData, { merge: true });

    await batch.commit();
    console.log('Message sent successfully to conversation:', conversationId);
    
  } catch (error) {
    console.error('SEND MESSAGE FAILED:', error);
    throw new Error('Message failed to send: ' + error.message);
  }
};

/**
 * Marks all messages in a conversation as read by the current user.
 */
export const markMessagesAsRead = async (conversationId, currentUserId) => {
  if (!isValidId(conversationId) || !currentUserId) {
    console.warn('Invalid parameters for markMessagesAsRead');
    return;
  }
  
  const convRef = doc(db, 'conversations', conversationId);
  
  try {
    // First check if the conversation document exists
    const convDoc = await getDoc(convRef);
    
    if (!convDoc.exists()) {
      console.log('Conversation document does not exist yet, skipping mark as read');
      return;
    }

    const batch = writeBatch(db);

    // 1. Update conversation unread count and last read timestamp
    batch.update(convRef, {
      [`unreadCounts.${currentUserId}`]: 0,
      [`lastRead.${currentUserId}`]: serverTimestamp()
    });

    // 2. Mark all unread messages as read (FIXED: use getDocs instead of getDoc for query)
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      where('receiverId', '==', currentUserId),
      where('read', '==', false)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery); // FIXED: getDocs instead of getDoc
    
    messagesSnapshot.docs.forEach((messageDoc) => {
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageDoc.id);
      batch.update(messageRef, {
        read: true,
        readAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log(`Marked ${messagesSnapshot.docs.length} messages as read for user ${currentUserId} in conversation ${conversationId}`);
    
  } catch (error) {
    if (error.code === 'not-found') {
      console.log('Conversation not found when trying to mark as read');
      return;
    }
    console.warn('Could not mark messages as read:', error.message);
  }
};

/**
 * Simplified version of markMessagesAsRead - just updates conversation unread count
 * Use this if you're having performance issues with the full version
 */
export const markConversationAsRead = async (conversationId, currentUserId) => {
  if (!isValidId(conversationId) || !currentUserId) {
    console.warn('Invalid parameters for markConversationAsRead');
    return;
  }
  
  const convRef = doc(db, 'conversations', conversationId);
  
  try {
    // Check if the document exists
    const convDoc = await getDoc(convRef);
    
    if (!convDoc.exists()) {
      console.log('Conversation document does not exist yet, skipping mark as read');
      return;
    }

    // Just update the conversation unread count and last read timestamp
    await updateDoc(convRef, {
      [`unreadCounts.${currentUserId}`]: 0,
      [`lastRead.${currentUserId}`]: serverTimestamp()
    });

    console.log(`Marked conversation as read for user ${currentUserId}`);
    
  } catch (error) {
    if (error.code === 'not-found') {
      console.log('Conversation not found when trying to mark as read');
      return;
    }
    console.warn('Could not mark conversation as read:', error.message);
  }
};

/**
 * Gets the read status of messages for a specific user
 */
export const getMessageReadStatus = (message, currentUserId) => {
  if (!message) return { isRead: false, readAt: null };
  
  if (message.senderId === currentUserId) {
    // For sent messages, check if they've been read by the receiver
    return {
      isRead: message.read || false,
      readAt: message.readAt ? convertTimestamp(message.readAt) : null
    };
  } else {
    // For received messages, they're read if we're viewing them
    return {
      isRead: true,
      readAt: message.timestamp || new Date()
    };
  }
};