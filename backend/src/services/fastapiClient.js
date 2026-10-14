const axios = require('axios');
require('dotenv').config();

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8001';

const client = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 5000, // 5 second timeout requirement
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Calls FastAPI analytical engine with robust error classification.
 */
async function analyze(payload) {
  try {
    const response = await client.post('/analyze', payload);
    return response.data;
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      const error = new Error('Analytical engine timed out (exceeded 5000ms). Please retry with cached data.');
      error.statusCode = 504;
      error.code = 'FASTAPI_TIMEOUT';
      throw error;
    }
    if (err.code === 'ECONNREFUSED' || err.message.includes('connect ECONNREFUSED')) {
      const error = new Error(`Cannot connect to FastAPI analytical service at ${FASTAPI_URL}. Ensure the Python service is running.`);
      error.statusCode = 503;
      error.code = 'FASTAPI_UNAVAILABLE';
      throw error;
    }
    if (err.response) {
      const error = new Error(err.response.data?.detail || 'Analytical engine rejected request validation.');
      error.statusCode = err.response.status;
      error.code = 'FASTAPI_VALIDATION_ERROR';
      error.details = err.response.data;
      throw error;
    }
    throw err;
  }
}

async function checkHealth() {
  try {
    const res = await client.get('/health', { timeout: 2000 });
    return res.data;
  } catch (err) {
    return { status: 'down', error: err.message };
  }
}

module.exports = {
  analyze,
  checkHealth,
  FASTAPI_URL,
};
