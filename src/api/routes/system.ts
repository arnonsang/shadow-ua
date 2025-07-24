import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { statsTracker } from '../middleware/logging';
import { HealthResponse, StatsResponse, ComponentsResponse } from '../types/api';
import { Platform, Browser, DeviceType, ExportFormat } from '../../types';
import { BROWSER_COMPONENTS } from '../../data/component-lists';

const router = Router();
const startTime = Date.now();

// GET /health - Health check endpoint
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
  };

  res.json(response);
}));

// GET /stats - API usage statistics
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = statsTracker.getStats();

  const response: StatsResponse = {
    totalRequests: stats.totalRequests,
    requestsByEndpoint: stats.requestsByEndpoint,
    requestsByPlatform: stats.requestsByPlatform as Record<Platform, number>,
    requestsByBrowser: stats.requestsByBrowser as Record<Browser, number>,
    uptime: stats.uptime,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /components - Available components and combinations
router.get('/components', asyncHandler(async (req: Request, res: Response) => {
  // Build platform-browser compatibility matrix
  const platformBrowserMatrix: Record<Platform, Browser[]> = {} as Record<Platform, Browser[]>;
  
  Object.values(Platform).forEach(platform => {
    platformBrowserMatrix[platform] = [];
    
    BROWSER_COMPONENTS.forEach((config) => {
      if (config.platforms.includes(platform)) {
        platformBrowserMatrix[platform].push(config.browser);
      }
    });
  });

  // Calculate total possible combinations
  let totalPossible = 0;
  Object.values(platformBrowserMatrix).forEach(browsers => {
    totalPossible += browsers.length;
  });

  const response: ComponentsResponse = {
    platforms: Object.values(Platform),
    browsers: Object.values(Browser),
    deviceTypes: Object.values(DeviceType),
    exportFormats: Object.values(ExportFormat),
    combinations: {
      totalPossible,
      platformBrowserMatrix,
    },
  };

  res.json(response);
}));

export default router;