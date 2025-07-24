import { Router, Request, Response } from 'express';
import { generateModularUA } from '../../core/modular-generator';
import { exportUAs } from '../../exports';
import { validateQueryParams, validateExportBody } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { UAResponse, UAMultipleResponse, ExportResponse } from '../types/api';
import { Platform, Browser, DeviceType, ExportFormat } from '../../types';

const router = Router();

// GET /ua - Generate single user agent
router.get('/ua', validateQueryParams, asyncHandler(async (req: Request, res: Response) => {
  const { platform, browser, device } = (req as any).validatedQuery;

  const result = generateModularUA({
    platform,
    browser,
    deviceType: device,
  });

  const response: UAResponse = {
    userAgent: result.userAgent,
    components: {
      platform: result.platform,
      browser: result.browser,
      deviceType: result.deviceType,
      browserVersion: result.browserVersion,
      engineVersion: result.engineVersion,
      osString: result.osString,
      deviceModel: result.deviceModel,
    },
    timestamp: new Date().toISOString(),
  };

  res.json(response);
}));

// GET /uas - Generate multiple user agents
router.get('/uas', validateQueryParams, asyncHandler(async (req: Request, res: Response) => {
  const { platform, browser, device, count, format, weighted } = (req as any).validatedQuery;

  const userAgents: string[] = [];
  const components: UAResponse['components'][] = [];

  for (let i = 0; i < count; i++) {
    const result = generateModularUA({
      platform,
      browser,
      deviceType: device,
    }, weighted);

    userAgents.push(result.userAgent);
    components.push({
      platform: result.platform,
      browser: result.browser,
      deviceType: result.deviceType,
      browserVersion: result.browserVersion,
      engineVersion: result.engineVersion,
      osString: result.osString,
      deviceModel: result.deviceModel,
    });
  }

  const response: UAMultipleResponse = {
    userAgents,
    count,
    format: format || ExportFormat.JSON,
    timestamp: new Date().toISOString(),
    components: (format || ExportFormat.JSON) === ExportFormat.JSON ? components : undefined,
  };

  res.json(response);
}));

// POST /ua/export - Export user agents in specified format
router.post('/ua/export', validateExportBody, asyncHandler(async (req: Request, res: Response) => {
  const { platform, browser, device, count, format, weighted } = (req as any).validatedBody;

  const userAgents: string[] = [];

  for (let i = 0; i < count; i++) {
    const result = generateModularUA({
      platform,
      browser,
      deviceType: device,
    }, weighted);
    userAgents.push(result.userAgent);
  }

  const content = exportUAs(userAgents, { format, count });

  const response: ExportResponse = {
    format,
    content,
    count,
    timestamp: new Date().toISOString(),
    parameters: {
      platform,
      browser,
      device,
      weighted,
    },
  };

  res.json(response);
}));

export default router;