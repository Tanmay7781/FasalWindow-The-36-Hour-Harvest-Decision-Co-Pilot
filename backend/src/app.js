const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome / status route
app.get('/', (req, res) => {
  res.json({
    message: 'FasalWindow API Gateway is running.',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      health: 'GET /api/health',
      crops: 'GET /api/crops',
      mandis: 'GET /api/mandis',
      analyze: 'POST /api/analyze',
      overrides: 'POST /api/overrides'
    }
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Structured Error Handler
app.use(errorHandler);

module.exports = app;
