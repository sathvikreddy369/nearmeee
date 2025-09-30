const { db, admin } = require('../config/firebaseAdmin');

class MessageModel {
  /**
   * Generates a consistent conversation ID based on chat type and participants.
   * @param {string} userId1 - ID of the first participant.
   * @param {string} userId2 - ID of the second participant.
   * @param {string} chatType - Type of chat (e.g., 'user-vendor', 'admin-user', 'admin-vendor').
   * @param {string} [contextId] - Optional ID related to the chat context (e.g., vendorId for user-vendor chat).
   * @returns {string} The unique conversation ID.
   */
  static getConversationId(userId1, userId2, chatType, contextId = '') {
    const participantIds = [userId1, userId2].sort();
    return `${participantIds[0]}_${participantIds[1]}_${chatType}_${contextId}`;
  }

  /**
   * Retrieves a single conversation document by its ID.
   * @param {string} conversationId - The ID of the conversation.
   * @returns {Promise<object|null>} The conversation data or null if not found.
   */
  static async getConversationById(conversationId) {
    const doc = await db.collection('conversations').doc(conversationId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Creates a new message document and updates conversation metadata.
   * @param {string} senderId - The ID of the user/vendor sending the message.
   * @param {string} receiverId - The ID of the user/vendor receiving the message.
   * @param {string} chatType - Type of chat (e.g., 'user-vendor', 'admin-user', 'admin-vendor').
   * @param {string} [contextId] - Optional ID related to the chat context.
   * @param {string} text - The message content.
   * @returns {Promise<object>} The created message document with its ID.
   */
  static async createMessage(senderId, receiverId, chatType, contextId, text) {
    const conversationId = MessageModel.getConversationId(senderId, receiverId, chatType, contextId);
    const messageTimestamp = new Date();

    const newMessageData = {
      senderId,
      receiverId,
      text,
      timestamp: messageTimestamp,
      read: false,
    };

    const conversationRef = db.collection('conversations').doc(conversationId);
    const messageRef = conversationRef.collection('messages').doc(); // Auto-generate message ID

    const batch = db.batch();

    // 1. Add the new message to the sub-collection
    batch.set(messageRef, newMessageData);

    // 2. Update the conversation document metadata
    const unreadCountsUpdate = {};
    unreadCountsUpdate[receiverId] = admin.firestore.FieldValue.increment(1);
    unreadCountsUpdate[senderId] = 0; // Reset sender's unread count

    batch.set(conversationRef, {
      participants: [senderId, receiverId],
      type: chatType,
      contextId: contextId || null, // Store context ID if provided
      lastMessage: {
        senderId,
        text: text.substring(0, 100), // Store a snippet
        timestamp: messageTimestamp,
      },
      lastMessageTimestamp: messageTimestamp,
      unreadCounts: unreadCountsUpdate,
      updatedAt: messageTimestamp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Only set on first creation
    }, { merge: true }); // Use merge to update existing fields and create if not exists

    try {
      console.log(`[MessageModel] createMessage: Committing batch for conversation ${conversationId}`);
      await batch.commit();
      console.log(`[MessageModel] createMessage: Message ${messageRef.id} created.`);
      return { id: messageRef.id, ...newMessageData };
    } catch (error) {
      console.error('Error creating message and updating conversation:', error);
      throw new Error('Failed to save message.');
    }
  }

  /**
   * Retrieves all messages for a specific conversation ID.
   * @param {string} conversationId - The ID of the conversation thread.
   * @returns {Promise<Array<object>>} List of messages in the conversation.
   */
  static async getMessagesByConversationId(conversationId) {
    try {
      console.log(`[MessageModel] getMessagesByConversationId: Fetching messages for conversation ${conversationId}`);
      const snapshot = await db.collection('conversations').doc(conversationId).collection('messages')
        .orderBy('timestamp', 'asc')
        .get();

      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`[MessageModel] getMessagesByConversationId: Found ${messages.length} messages.`);
      return messages;
    } catch (error) {
      console.error('Error getting messages by conversation ID:', error);
      throw new Error('Failed to retrieve messages.');
    }
  }

  /**
   * Retrieves all unique conversations for a given user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array<object>>} List of latest messages for each unique conversation.
   */
  static async getConversationsForUser(userId) {
    try {
      console.log(`[MessageModel] getConversationsForUser: Fetching conversations for user ${userId}`);
      const snapshot = await db.collection('conversations')
        .where('participants', 'array-contains', userId)
        .orderBy('lastMessageTimestamp', 'desc') // Sort by most recent activity
        .get();

      const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`[MessageModel] getConversationsForUser: Found ${conversations.length} conversations.`);
      return conversations;
    } catch (error) {
      console.error(`Error getting conversations list for user ${userId}:`, error);
      throw new Error('Failed to retrieve conversations list.');
    }
  }

  /**
   * Marks messages in a conversation as read for a specific receiver and updates unread count.
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} readerId - The ID of the user/vendor who read the messages.
   * @returns {Promise<void>}
   */
  static async markMessagesAsRead(conversationId, readerId) {
    const conversationRef = db.collection('conversations').doc(conversationId);
    const messagesRef = conversationRef.collection('messages');

    const batch = db.batch();

    try {
      // 1. Mark individual messages as read
      console.log(`[MessageModel] markMessagesAsRead: Marking messages as read for ${readerId} in ${conversationId}`);
      const unreadMessagesSnapshot = await messagesRef
        .where('receiverId', '==', readerId)
        .where('read', '==', false)
        .get();

      unreadMessagesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      // 2. Reset unread count for this reader in the conversation document
      batch.update(conversationRef, {
        [`unreadCounts.${readerId}`]: 0,
      });

      await batch.commit();
      console.log(`[MessageModel] markMessagesAsRead: Marked ${unreadMessagesSnapshot.size} messages as read.`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}

module.exports = MessageModel;