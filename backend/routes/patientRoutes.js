// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./config/database');

// Import routes
const patientRoutes = require('./routes/patientRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Initialize database connection
let dbConnected = false;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/patients', patientRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🏥 Medi Online Clinic API',
    status: 'running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API health check
app.get('/api/health', async (req, res) => {
  try {
    res.json({ 
      status: 'healthy',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.json({ 
      status: 'degraded',
      database: 'disconnected'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with database initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Initialize database
  dbConnected = await initDB();
  
  // Start listening
  app.listen(PORT, () => {
    console.log(`
  🚀 Server is running!
  📡 Port: ${PORT}
  🔗 http://localhost:${PORT}
  📊 Health: http://localhost:${PORT}/api/health
  💾 Database: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}
    `);
  });
};

startServer();