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

// Enhanced Diagnostic Logger
app.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(`   Query:`, req.query);
  console.log(`   Body:`, req.body);
  console.log(`   Auth Header:`, req.headers.authorization ? 'Present' : 'Missing');
  next();
});

// Log route mounting
console.log('🔄 Mounting routes...');
console.log('   - /api/auth');
console.log('   - /api/users'); 
console.log('   - /api/vendors');
console.log('   - /api/reviews');
console.log('   - /api/admin');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Test route at root level to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is running!' });
});

// Default route
app.get('/', (req, res) => {
  res.send('Local Hunt Backend API is running!');
});

// Error handling middleware (should be last)
app.use(notFound);
app.use(errorHandler);

console.log('✅ All routes mounted successfully');

module.exports = app;