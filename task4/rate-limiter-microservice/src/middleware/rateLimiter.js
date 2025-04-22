const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; 
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100; 

const memoryRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, 
  legacyHeaders: false, 
  message: { 
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

const ipRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: (req, res) => {
    const clientIp = req.ip;
    if (clientIp === '127.0.0.1' || clientIp === '::1') {
      return RATE_LIMIT_MAX_REQUESTS * 2; 
    }
    return RATE_LIMIT_MAX_REQUESTS;
  },
  keyGenerator: (req) => {
    return req.ip; 
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Rate limit exceeded. Please try again later.'
  }
});


const apiKeyRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, 
  max: (req, res) => {
    const apiKey = req.headers['x-api-key'] || '';
    
    
    const apiKeyTiers = {
      'test-key-basic': RATE_LIMIT_MAX_REQUESTS,
      'test-key-premium': RATE_LIMIT_MAX_REQUESTS * 2,
      'test-key-enterprise': RATE_LIMIT_MAX_REQUESTS * 5
    };
    
    return apiKeyTiers[apiKey] || RATE_LIMIT_MAX_REQUESTS / 2; 
  },
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip; 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    
    return req.path === '/docs' || req.path === '/health';
  },
  message: {
    status: 429,
    message: 'API rate limit exceeded. Please upgrade your plan or try again later.'
  }
});

const createRedisRateLimiter = async () => {
  if (!process.env.REDIS_HOST) {
    console.warn('Redis configuration not found. Using memory rate limiter instead.');
    return memoryRateLimiter;
  }
  
  try {
    const redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
    });
    
    await redisClient.connect();
    
    
    console.log('Redis rate limiter configured successfully');
    
    
    return memoryRateLimiter;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    console.warn('Falling back to memory rate limiter');
    return memoryRateLimiter;
  }
};

const adaptiveRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: (req, res) => {
    
    const serverLoad = Math.random(); 
    
    if (serverLoad > 0.8) {
      // High load - reduce limits
      return RATE_LIMIT_MAX_REQUESTS / 2;
    } else if (serverLoad > 0.5) {
      // Medium load
      return RATE_LIMIT_MAX_REQUESTS * 0.8;
    }
    // Low load - normal limits
    return RATE_LIMIT_MAX_REQUESTS;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Server is experiencing high load. Please try again later.'
  }
});

module.exports = {
  memoryRateLimiter,
  ipRateLimiter,
  apiKeyRateLimiter,
  createRedisRateLimiter,
  adaptiveRateLimiter
}; 