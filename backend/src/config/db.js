const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'fasalwindow',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
});

let isDbConnected = false;

// Test connection without crashing the process if database is offline or not yet initialized
pool.connect()
  .then(client => {
    isDbConnected = true;
    console.log(`[PostgreSQL] Successfully connected to database '${process.env.PG_DATABASE || 'fasalwindow'}' on ${process.env.PG_HOST || 'localhost'}:${process.env.PG_PORT || '5432'}`);
    client.release();
  })
  .catch(err => {
    isDbConnected = false;
    console.warn(`[PostgreSQL] Connection note: Database is currently unreachable or credentials need setup (${err.message}). In-memory audit persistence active as resilient fallback.`);
  });

// In-memory fallback stores for when PostgreSQL is unreachable or running offline
const inMemoryStore = {
  analyses: new Map(),
  overrides: [],
};

const query = async (text, params) => {
  if (!isDbConnected) {
    throw new Error('DATABASE_OFFLINE');
  }
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
  isDbConnected: () => isDbConnected,
  inMemoryStore,
};
