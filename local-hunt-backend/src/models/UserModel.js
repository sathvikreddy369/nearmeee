// src/models/UserModel.js
const { db,admin } = require('../config/firebaseAdmin');

class UserModel {
  static async createUserProfile(uid, email, name, role = 'user') {
    const userRef = db.collection('users').doc(uid);
    const userData = {
      userId: uid,
      email: email,
      name: name,
      role: role,
      createdAt: new Date(),
      updatedAt: new Date(),
      favorites: [],
      recentViews: [],
    };
    await userRef.set(userData, { merge: true });
    return userData;
  }

  static async getUserProfile(uid) {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() };
  }

  static async updateUserProfile(uid, updates) {
    const userRef = db.collection('users').doc(uid);
    const allowedUpdates = { ...updates, updatedAt: new Date() };
    await userRef.update(allowedUpdates);
    return { id: uid, ...allowedUpdates };
  }

  static async deleteUserProfile(uid) {
    await db.collection('users').doc(uid).delete();
    return true;
  }

  static async getAllUsers() {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  /**
   * Adds a vendor ID to a user's favorites list.
   * @param {string} uid - The user's UID.
   * @param {string} vendorId - The ID of the vendor to favorite.
   * @returns {Promise<void>}
   */
  static async addFavoriteVendor(uid, vendorId) {
    try {
      const userRef = db.collection('users').doc(uid);
      await userRef.update({
        favorites: admin.firestore.FieldValue.arrayUnion(vendorId),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error adding favorite vendor ${vendorId} for user ${uid}:`, error);
      throw new Error('Failed to add vendor to favorites.');
    }
  }

  /**
   * Removes a vendor ID from a user's favorites list.
   * @param {string} uid - The user's UID.
   * @param {string} vendorId - The ID of the vendor to unfavorite.
   * @returns {Promise<void>}
   */
  static async removeFavoriteVendor(uid, vendorId) {
    try {
      const userRef = db.collection('users').doc(uid);
      await userRef.update({
        favorites: admin.firestore.FieldValue.arrayRemove(vendorId),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error removing favorite vendor ${vendorId} for user ${uid}:`, error);
      throw new Error('Failed to remove vendor from favorites.');
    }
  }
  /**
   * Adds a new notification to a user's notifications sub-collection.
   * @param {string} uid - The user's UID (recipient of the notification).
   * @param {string} type - Type of notification (e.g., 'new_review', 'admin_message').
   * @param {string} message - The notification text.
   * @param {string} [relatedId] - Optional ID of the related entity (e.g., reviewId, messageId).
   * @returns {Promise<void>}
   */
  static async addNotification(uid, type, message, relatedId = null) {
    try {
      const notificationRef = db.collection('users').doc(uid).collection('notifications');
      await notificationRef.add({
        type,
        message,
        relatedId,
        timestamp: new Date(),
        read: false,
      });
      console.log(`Notification added for user ${uid}: ${message}`);
    } catch (error) {
      console.error(`Error adding notification for user ${uid}:`, error);
      // Don't re-throw, as this is a background task
    }
  }

  /**
   * Retrieves notifications for a user.
   * @param {string} uid - The user's UID.
   * @param {boolean} [unreadOnly=false] - If true, only fetch unread notifications.
   * @returns {Promise<Array<object>>} List of notification documents.
   */
  static async getNotificationsForUser(uid, unreadOnly = false) {
    try {
      let query = db.collection('users').doc(uid).collection('notifications');

      if (unreadOnly) {
        query = query.where('read', '==', false);
      }

      const snapshot = await query.orderBy('timestamp', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting notifications for user ${uid}:`, error);
      throw new Error('Failed to retrieve notifications.');
    }
  }

  /**
   * Marks a specific notification as read.
   * @param {string} uid - The user's UID.
   * @param {string} notificationId - The ID of the notification to mark as read.
   * @returns {Promise<void>}
   */
  static async markNotificationAsRead(uid, notificationId) {
    try {
      const notificationRef = db.collection('users').doc(uid).collection('notifications').doc(notificationId);
      await notificationRef.update({ read: true });
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read for user ${uid}:`, error);
      // Don't re-throw
    }
  }

  /**
   * Deletes a specific notification.
   * @param {string} uid - The user's UID.
   * @param {string} notificationId - The ID of the notification to delete.
   * @returns {Promise<void>}
   */
  static async deleteNotification(uid, notificationId) {
    try {
      const notificationRef = db.collection('users').doc(uid).collection('notifications').doc(notificationId);
      await notificationRef.delete();
    } catch (error) {
      console.error(`Error deleting notification ${notificationId} for user ${uid}:`, error);
      // Don't re-throw
    }
  }
}

module.exports = UserModel;