import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '../types/api';

// Simple stats tracking in memory
class StatsTracker {
  private stats = {
    totalRequests: 0,
    requestsByEndpoint: {} as Record<string, number>,
    requestsByPlatform: {} as Record<string, number>,
    requestsByBrowser: {} as Record<string, number>,
    startTime: Date.now(),
  };

  incrementRequest(endpoint: string, platform?: string, browser?: string) {
    this.stats.totalRequests++;
    this.stats.requestsByEndpoint[endpoint] = (this.stats.requestsByEndpoint[endpoint] || 0) + 1;
    
    if (platform) {
      this.stats.requestsByPlatform[platform] = (this.stats.requestsByPlatform[platform] || 0) + 1;
    }
    
    if (browser) {
      this.stats.requestsByBrowser[browser] = (this.stats.requestsByBrowser[browser] || 0) + 1;
    }
  }

  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime,
    };
  }

  reset() {
    this.stats = {
      totalRequests: 0,
      requestsByEndpoint: {},
      requestsByPlatform: {},
      requestsByBrowser: {},
      startTime: Date.now(),
    };
  }
}

export const statsTracker = new StatsTracker();

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request context to request object
  (req as any).context = {
    requestId,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    endpoint: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    parameters: { ...req.query, ...req.body },
  } as RequestContext;

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    query: req.query,
    body: req.body,
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode}`, {
      requestId,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    });

    // Track stats
    const validatedQuery = (req as any).validatedQuery;
    const validatedBody = (req as any).validatedBody;
    const platform = validatedQuery?.platform || validatedBody?.platform;
    const browser = validatedQuery?.browser || validatedBody?.browser;
    
    statsTracker.incrementRequest(req.path, platform, browser);

    return originalJson.call(this, body);
  };

  next();
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}