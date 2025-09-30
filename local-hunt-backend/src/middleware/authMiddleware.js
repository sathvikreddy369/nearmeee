// src/middleware/authMiddleware.js
const { auth, db } = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;

      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (userDoc.exists) {
        req.user.role = userDoc.data().role;
      } else {
        req.user.role = 'user'; // Default role if doc not yet created
      }

      next();
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error);
      if (error.code === 'auth/id-token-expired') {
        res.status(401).json({ message: 'Unauthorized: Token expired. Please log in again.' });
      } else {
        res.status(401).json({ message: 'Unauthorized: Invalid token.' });
      }
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }
};

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: User role not found.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Access denied. Required roles: ${roles.join(', ')}.` });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };