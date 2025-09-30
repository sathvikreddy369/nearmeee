// src/config/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load .env file

const serviceAccountPath = path.resolve(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('Error loading Firebase service account key:', error.message);
  console.error(`Attempted path: ${serviceAccountPath}`);
  process.exit(1);
}

try {
  // Initialize Firebase Admin SDK for Auth and Firestore
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Keep this, even if not using for primary image storage
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore(); // Firestore instance
const auth = admin.auth();   // Firebase Auth instance
const storage = admin.storage(); // Firebase Storage instance (will not be used for main images)

module.exports = { db, auth, storage, admin };