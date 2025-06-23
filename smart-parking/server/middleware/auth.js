const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if the user is authenticated
const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    console.log('Checking authentication, cookies:', req.cookies);
    
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({ message: 'Authentication required. Please login.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Token verified, decoded ID:', decoded.id);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(404).json({ message: 'User not found.' });
    }
    
    console.log('User authenticated:', user.username);
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    
    res.status(500).json({ message: 'Server error in authentication.' });
  }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required.' });
  }
};

module.exports = { isAuthenticated, isAdmin }; 