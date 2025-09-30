// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./config/firebaseAdmin');
require('./config/cloudinaryConfig');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- FIXED DIAGNOSTIC LOGGER ---
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    console.log(`--- ULTIMATE DIAGNOSTIC: Request to ${req.originalUrl} received ---`);
  }
  next();
});
// --- END FIXED DIAGNOSTIC LOGGER ---

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes); // Handles routes like /me, /:id, etc.
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Local Hunt Backend API is running!');
});

// Error handling middleware (should be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
