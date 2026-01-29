// Main Express application setup
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/admin', require('./src/routes/admin'));
app.use('/api/v1/school', require('./src/routes/schoolHead'));
app.use('/api/v1/teacher', require('./src/routes/teacher'));
// app.use('/api/v1/class-head', require('./src/routes/classHead'));
// app.use('/api/v1/student', require('./src/routes/student'));
// app.use('/api/v1/parent', require('./src/routes/parent'));
// app.use('/api/v1/store-house', require('./src/routes/storeHouse'));

// Error handling middleware (will be implemented later)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong!'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

module.exports = app;




