const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { isAuthenticated } = require('../middleware/auth');

// Helper function to create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('Signup request:', { username, email });
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists.' 
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Create and set token in cookie
    const token = createToken(user._id);
    
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'lax'
    });
    
    // Send user data without password
    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user. Please try again.' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login request:', { username });
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    
    // Find user
    const user = await User.findOne({ 
      $or: [{ email: username }, { username }] 
    });
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }
    
    // Compare passwords
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', username);
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }
    
    // Create and set token in cookie
    const token = createToken(user._id);
    
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'lax'
    });
    
    // Send user data without password
    res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Admin login request:', { username });
    
    // Check for admin credentials
    if (username !== 'admin123' || password !== 'admin@12345') {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }
    
    // Find or create admin user if it doesn't exist
    let adminUser = await User.findOne({ username: 'admin123' });
    
    if (!adminUser) {
      // Create admin user if it doesn't exist
      const hashedPassword = await bcrypt.hash('admin@12345', 10);
      adminUser = new User({
        username: 'admin123',
        email: 'admin@smartparking.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      await adminUser.save();
    }
    
    // Create and set token in cookie
    const token = createToken(adminUser._id);
    
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'lax'
    });
    
    // Send admin user data
    res.status(200).json({
      message: 'Admin login successful.',
      user: {
        id: adminUser._id,
        username: adminUser.username,
        isAdmin: adminUser.isAdmin
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error during admin login. Please try again.' });
  }
});

// User logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  res.status(200).json({ message: 'Logout successful.' });
});

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
});

module.exports = router; 