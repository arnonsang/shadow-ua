import { ServerConfig } from './types/api';

export const DEFAULT_CONFIG: ServerConfig = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || 'localhost',
  cors: {
    enabled: process.env.CORS_ENABLED === 'true' || false,
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
  },
  security: {
    helmet: process.env.HELMET_ENABLED !== 'false',
    trustProxy: process.env.TRUST_PROXY === 'true',
  },
};

export function createConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    cors: {
      ...DEFAULT_CONFIG.cors,
      ...overrides.cors,
    },
    rateLimit: {
      ...DEFAULT_CONFIG.rateLimit,
      ...overrides.rateLimit,
    },
    security: {
      ...DEFAULT_CONFIG.security,
      ...overrides.security,
    },
  };
}