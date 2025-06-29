require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');
const searchRoutes = require('./routes/search');
const spamRoutes = require('./routes/spam');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = 4000; // Using a completely different port range

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/spam', spamRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Caller ID API is running!',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user profile'
      },
      users: {
        'GET /api/users/profile': 'Get user profile',
        'PUT /api/users/profile': 'Update user profile',
        'PUT /api/users/password': 'Change password'
      },
      contacts: {
        'GET /api/contacts': 'Get all contacts',
        'POST /api/contacts': 'Add new contact',
        'GET /api/contacts/:id': 'Get specific contact',
        'PUT /api/contacts/:id': 'Update contact',
        'DELETE /api/contacts/:id': 'Delete contact'
      },
      search: {
        'GET /api/search?q=query&type=name|phone': 'Search by name or phone',
        'GET /api/search/details/:phoneNumber': 'Get detailed info about phone number'
      },
      spam: {
        'POST /api/spam/report': 'Report spam number',
        'GET /api/spam/stats/:phoneNumber': 'Get spam statistics',
        'GET /api/spam/check/:phoneNumber': 'Check if number is spam',
        'GET /api/spam/trending': 'Get trending spam numbers'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Try to connect to database
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      
      // Always sync when using SQLite or in development
      const shouldSync = process.env.USE_SQLITE === 'true' || 
                        process.env.NODE_ENV === 'development' || 
                        !process.env.NODE_ENV;
      
      if (shouldSync) {
        console.log('🔄 Syncing database...');
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ Database synchronized.');
      }
    } catch (dbError) {
      console.warn('⚠️  Database connection failed:', dbError.message);
      console.log('💡 Make sure PostgreSQL is running and your .env file is configured correctly.');
      console.log('💡 You can still test the API endpoints that don\'t require database access.');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

startServer(); 