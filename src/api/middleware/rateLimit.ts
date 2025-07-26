import rateLimit from 'express-rate-limit';
import type { ServerConfig } from '../types/api';

export function createRateLimiter(config: ServerConfig['rateLimit']) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    message: {
      error: {
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        details: {
          windowMs: config.windowMs,
          maxRequests: config.max,
        },
      },
    },
    skip: (req) => {
      // Skip rate limiting for health check endpoint
      return req.path === '/health';
    },
  });
}