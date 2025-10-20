const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ridesRoutes = require('./routes/rides');
const bookingsRoutes = require('./routes/bookings');
const locationRoutes = require('./routes/location');

const app = express();
const server = http.createServer(app);

// Determine CORS origin - only allow wildcard in development
const corsOrigin = process.env.NODE_ENV === 'production' 
  ? process.env.CORS_ORIGIN || 'http://localhost:3000'
  : process.env.CORS_ORIGIN || '*';

const io = socketIo(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later.'
});

// Middleware
app.use(cors({
  origin: corsOrigin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Car Pooling API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      rides: '/api/rides',
      bookings: '/api/bookings',
      location: '/api/location'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/location', locationRoutes);

// WebSocket for real-time location tracking
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a ride room for location updates
  socket.on('join-ride', (rideId) => {
    socket.join(`ride-${rideId}`);
    console.log(`Client ${socket.id} joined ride ${rideId}`);
  });

  // Leave a ride room
  socket.on('leave-ride', (rideId) => {
    socket.leave(`ride-${rideId}`);
    console.log(`Client ${socket.id} left ride ${rideId}`);
  });

  // Broadcast location update to all clients in the ride room
  socket.on('location-update', (data) => {
    const { rideId, latitude, longitude, speed, heading } = data;
    socket.to(`ride-${rideId}`).emit('location-update', {
      latitude,
      longitude,
      speed,
      heading,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
