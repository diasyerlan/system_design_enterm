const express = require('express');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/apiRoutes');
const { memoryRateLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(memoryRateLimiter);

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Rate Limiter Microservice',
    documentation: '/api/docs',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    endpoints: [
      { path: '/api/message', description: 'Simple message endpoint with memory-based rate limiting' },
      { path: '/api/intensive', description: 'Resource-intensive endpoint with adaptive rate limiting' },
      { path: '/api/user', description: 'Protected endpoint with API key rate limiting (use x-api-key header)' },
      { path: '/api/ip-limited', description: 'Endpoint with IP-based rate limiting' },
      { path: '/api/health', description: 'Health check endpoint (no rate limiting)' }
    ],
    rateLimiting: {
      description: 'This API implements various rate limiting strategies',
      defaultWindow: process.env.RATE_LIMIT_WINDOW_MS + 'ms',
      defaultMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS} requests per ${process.env.RATE_LIMIT_WINDOW_MS}ms`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 