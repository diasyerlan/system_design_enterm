const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const {
  memoryRateLimiter,
  ipRateLimiter,
  apiKeyRateLimiter,
  adaptiveRateLimiter
} = require('../middleware/rateLimiter');

router.get('/message', memoryRateLimiter, apiController.getMessage);

router.get('/intensive', adaptiveRateLimiter, apiController.getResourceIntensive);

router.get('/user', apiKeyRateLimiter, apiController.getUserData);

router.get('/ip-limited', ipRateLimiter, (req, res) => {
  res.json({
    message: 'This endpoint uses IP-based rate limiting',
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
});

router.get('/health', apiController.healthCheck);

module.exports = router; 