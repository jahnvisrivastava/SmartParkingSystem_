const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');

// Load env variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', ' https://graceful-hummingbird-01f317.netlify.app'

  ], // Allow both Vite's default ports
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', ' https://graceful-hummingbird-01f317.netlify.app'],
    credentials: true
  }
});

// Socket.io event handling
const socketManager = require('./socketManager');
socketManager(io);

// Routes
app.use('/api', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Server status endpoint for diagnostics
app.get('/api/status', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus,
    nodeVersion: process.version,
    uptime: process.uptime() + ' seconds'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout for server selection
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Please check that your MongoDB connection string is correct and the database server is running.');
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 