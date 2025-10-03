// src/models/UserModel.js
const { db, admin } = require('../config/firebaseAdmin');

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
      vendorProfile: null, // Reference to vendor document if user becomes vendor
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
    
    // If role is being updated to vendor, set vendorProfile reference
    if (updates.role === 'vendor') {
      // Find vendor document for this user
      const vendorSnapshot = await db.collection('vendors')
        .where('userId', '==', uid)
        .limit(1)
        .get();
      
      if (!vendorSnapshot.empty) {
        const vendorDoc = vendorSnapshot.docs[0];
        updates.vendorProfile = vendorDoc.id;
      }
    }
    
    const allowedUpdates = { ...updates, updatedAt: new Date() };
    await userRef.update(allowedUpdates);
    
    // Return updated profile with vendor data if applicable
    const updatedUser = await this.getUserProfile(uid);
    return updatedUser;
  }

  static async updateUserRole(uid, newRole) {
    const userRef = db.collection('users').doc(uid);
    
    const updates = {
      role: newRole,
      updatedAt: new Date()
    };
    
    // If becoming vendor, link to vendor profile
    if (newRole === 'vendor') {
      const vendorSnapshot = await db.collection('vendors')
        .where('userId', '==', uid)
        .limit(1)
        .get();
      
      if (!vendorSnapshot.empty) {
        const vendorDoc = vendorSnapshot.docs[0];
        updates.vendorProfile = vendorDoc.id;
      }
    } else {
      // If role changed from vendor, remove vendor profile link
      updates.vendorProfile = null;
    }
    
    await userRef.update(updates);
    return this.getUserProfile(uid);
  }

  static async deleteUserProfile(uid) {
    await db.collection('users').doc(uid).delete();
    return true;
  }

  static async getAllUsers() {
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

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
    }
  }

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

  static async markNotificationAsRead(uid, notificationId) {
    try {
      const notificationRef = db.collection('users').doc(uid).collection('notifications').doc(notificationId);
      await notificationRef.update({ read: true });
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read for user ${uid}:`, error);
    }
  }

  static async deleteNotification(uid, notificationId) {
    try {
      const notificationRef = db.collection('users').doc(uid).collection('notifications').doc(notificationId);
      await notificationRef.delete();
    } catch (error) {
      console.error(`Error deleting notification ${notificationId} for user ${uid}:`, error);
    }
  }

  // Get users by role for admin
  static async getUsersByRole(role) {
    try {
      const snapshot = await db.collection('users').where('role', '==', role).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting users by role ${role}:`, error);
      throw new Error('Failed to retrieve users by role.');
    }
  }
}

module.exports = UserModel;