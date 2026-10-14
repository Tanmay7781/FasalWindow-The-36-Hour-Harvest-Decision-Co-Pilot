require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Express] FasalWindow backend listening on http://localhost:${PORT}`);
  console.log(`[Express] Health check available at http://localhost:${PORT}/api/health`);
});

module.exports = server;
