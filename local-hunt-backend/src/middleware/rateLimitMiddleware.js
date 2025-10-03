// src/middleware/rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');

// 1. Strict limit for vendor registration (Scam prevention)
const vendorRegisterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per IP
    message: {
        message: 'Too many vendor registration attempts from this IP. Please try again after an hour.',
        status: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. Standard limit for public reading and general API browsing
const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: {
        message: 'Too many requests. Please wait a moment and try again.',
        status: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Moderate limit for user-submitted content/writes (e.g., reviews, reporting)
const userWriteLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 15, // 15 requests per IP
    message: {
        message: 'You are submitting data too quickly. Please slow down.',
        status: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 4. Moderate limit for user management actions (less frequent actions)
const userProfileLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // 20 requests per IP
    message: {
        message: 'Too many profile updates. Please wait a moment.',
        status: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { vendorRegisterLimiter, publicApiLimiter, userWriteLimiter, userProfileLimiter };