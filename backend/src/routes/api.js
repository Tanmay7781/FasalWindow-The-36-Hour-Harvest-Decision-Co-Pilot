const express = require('express');
const router = express.Router();

const { analyzeHarvest, getAnalysisById } = require('../controllers/analysisController');
const { createOverride, getOverrides } = require('../controllers/overrideController');
const { getCrops, getMandis } = require('../controllers/catalogController');
const fastapiClient = require('../services/fastapiClient');
const db = require('../config/db');

// Health check endpoint
router.get('/health', async (req, res) => {
  const fastApiHealth = await fastapiClient.checkHealth();
  return res.json({
    status: 'ok',
    service: 'fasalwindow-express-backend',
    timestamp: new Date().toISOString(),
    fastapi_service: fastApiHealth,
    database_connected: db.isDbConnected(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catalog routes
router.get('/crops', getCrops);
router.get('/mandis', getMandis);

// Analysis routes
router.post('/analyze', analyzeHarvest);
router.get('/analyses/:id', getAnalysisById);

// Human override & audit routes
router.post('/overrides', createOverride);
router.get('/overrides', getOverrides);

module.exports = router;
