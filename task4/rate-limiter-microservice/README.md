# Rate Limiter Microservice

A demonstration microservice implementing various rate-limiting strategies to protect against traffic spikes and ensure API stability.

## Rate Limiting Approach

This microservice demonstrates multiple rate-limiting strategies:

1. **Memory-based Rate Limiting**: Simple in-memory rate limiting using a fixed window approach. Good for single-instance deployments.
2. **IP-based Rate Limiting**: Different rate limits applied based on client IP addresses.
3. **API Key-based Rate Limiting**: Tiered rate limits based on API keys, allowing for different service levels.
4. **Adaptive Rate Limiting**: Dynamically adjusts rate limits based on server load.
5. **Redis-based Rate Limiting**: (Configurable) Distributed rate limiting for multi-instance deployments.

### Rate Limiting Algorithms

The implementation uses a combination of:

- **Fixed Window**: Simple counting of requests in a fixed time window (e.g., 100 requests per 15 minutes).
- **Token Bucket**: (Conceptual) The API key implementation resembles a token bucket approach where different keys get different bucket sizes.
- **Adaptive Window**: The adaptive rate limiter dynamically adjusts window sizes based on server load.

## Configuration

Rate limiting is configured via environment variables in the `.env` file:

```
RATE_LIMIT_WINDOW_MS=15000       # Time window in milliseconds
RATE_LIMIT_MAX_REQUESTS=100      # Maximum requests per window
```

For Redis-based rate limiting (multi-instance support), uncomment and configure:

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## API Endpoints

- `GET /api/message` - Simple endpoint with memory-based rate limiting
- `GET /api/intensive` - Resource-intensive endpoint with adaptive rate limiting
- `GET /api/user` - Protected endpoint with API key rate limiting
- `GET /api/ip-limited` - Endpoint with IP-based rate limiting
- `GET /api/health` - Health check endpoint (no rate limiting)
- `GET /api/docs` - API documentation

## Rate Limiting Headers

All rate-limited responses include standard headers:

- `RateLimit-Limit`: Maximum requests allowed in the window
- `RateLimit-Remaining`: Remaining requests in the current window
- `RateLimit-Reset`: Time (in seconds) until the rate limit resets

When a rate limit is exceeded, the server responds with HTTP 429 (Too Many Requests).

## Installation and Usage

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure `.env` file with your rate limiting settings
4. Start the server: `npm start`
5. For development with auto-reload: `npm run dev`

## Testing Rate Limiting

You can test the rate limiting with tools like Apache Bench or curl:

```bash
# Send 150 requests (exceeds the default 100 limit)
ab -n 150 -c 10 http://localhost:3000/api/message

# Test API key rate limiting
curl -H "x-api-key: test-key-basic" http://localhost:3000/api/user
curl -H "x-api-key: test-key-premium" http://localhost:3000/api/user
curl -H "x-api-key: test-key-enterprise" http://localhost:3000/api/user
```

## Multi-instance Deployment Considerations

For multi-instance deployments, configure Redis-based rate limiting by:

1. Setting up Redis server
2. Uncommenting Redis configuration in `.env`
3. The system will automatically use distributed rate limiting

## License

MIT 