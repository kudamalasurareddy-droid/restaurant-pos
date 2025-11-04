const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const menuRoutes = require('./routes/menu');
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const reportRoutes = require('./routes/reports');
const kotRoutes = require('./routes/kot');
const settingsRoutes = require('./routes/settings');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { setupSocketEvents } = require('./utils/socketEvents');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const allowedOriginsEnv = process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = allowedOriginsEnv
  ? allowedOriginsEnv.split(',').map((s) => s.trim()).filter(Boolean)
  : (process.env.NODE_ENV === 'production'
      ? ['https://yourproductiondomain.com']
      : ['http://localhost:3000', 'http://localhost:3001']);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-csrf-token',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Idempotency-Key'
  ],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Rate limiting (apply AFTER CORS so preflight gets CORS headers). Skip in dev and for preflight.
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => req.method === 'OPTIONS' || (process.env.NODE_ENV !== 'production')
});

app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.io middleware to make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const packageJson = require('../package.json');
  
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const dbState = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const healthData = {
    status: dbStatus === 'connected' ? 'OK' : 'WARNING',
    message: 'Restaurant POS API Server',
    version: packageJson.version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbState[mongoose.connection.readyState] || 'unknown',
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    },
    endpoints: {
      health: '/api/health',
      documentation: '/api/health',
      apiBase: '/api'
    }
  };
  
  const statusCode = healthData.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthData);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/kot', kotRoutes);
app.use('/api/settings', settingsRoutes);

// Serve React app in production (only if frontend build exists)
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  const fs = require('fs');
  
  // Only serve frontend if build directory exists (for local deployments)
  if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
    });
  } else {
    // If frontend is deployed separately (e.g., on Vercel), just return API info for root
    app.get('/', (req, res) => {
      const packageJson = require('../package.json');
      res.json({
        message: 'Restaurant POS API Server',
        version: packageJson.version || '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        health: '/api/health',
        documentation: '/api/health',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          menu: '/api/menu',
          tables: '/api/tables',
          orders: '/api/orders',
          inventory: '/api/inventory',
          reports: '/api/reports',
          kot: '/api/kot',
          settings: '/api/settings'
        }
      });
    });
  }
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Setup Socket.io events
setupSocketEvents(io);

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`
🚀 Restaurant POS Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/api/health
🔗 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Check your MONGODB_URI'}
⚡ Socket.io: Enabled
📁 Upload Path: ${process.env.UPLOAD_PATH || 'uploads/'}
🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'NOT CONFIGURED - PLEASE SET JWT_SECRET'}

📝 API Endpoints:
   - POST /api/auth/login
   - POST /api/auth/register
   - GET  /api/users
   - GET  /api/menu
   - GET  /api/tables
   - GET  /api/orders
   - GET  /api/inventory
   - GET  /api/reports
   - GET  /api/kot
   - GET  /api/settings

💡 Quick Start:
   1. Install MongoDB Compass and connect to: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_pos_db'}
   2. Create admin user via POST /api/auth/register
   3. Start the frontend: cd frontend && npm start
   4. Access admin panel: http://localhost:3000

🛠️  Development:
   - API Documentation: http://localhost:${PORT}/api/health
   - MongoDB GUI: MongoDB Compass
   - Real-time Events: Socket.io connected
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

module.exports = { app, server, io };