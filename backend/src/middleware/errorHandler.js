function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  console.error(`[Error] [${code}] ${err.message}`, err.stack ? err.stack.split('\n')[1] : '');

  res.status(statusCode).json({
    error: true,
    code,
    message: err.message || 'An unexpected server error occurred.',
    details: err.details || null,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
