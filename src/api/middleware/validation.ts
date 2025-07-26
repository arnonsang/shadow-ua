import { Request, Response, NextFunction } from 'express';
import { Platform, Browser, DeviceType, ExportFormat } from '../../types';

export interface ValidationError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, any>;
}

function createValidationError(message: string, details?: Record<string, any>): ValidationError {
  const error = new Error(message) as ValidationError;
  error.statusCode = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  return error;
}

export function validatePlatform(platform?: string): Platform | undefined {
  if (!platform) return undefined;
  
  if (!Object.values(Platform).includes(platform as Platform)) {
    throw createValidationError(
      `Invalid platform: ${platform}`,
      { 
        validValues: Object.values(Platform),
        receivedValue: platform 
      }
    );
  }
  
  return platform as Platform;
}

export function validateBrowser(browser?: string): Browser | undefined {
  if (!browser) return undefined;
  
  if (!Object.values(Browser).includes(browser as Browser)) {
    throw createValidationError(
      `Invalid browser: ${browser}`,
      { 
        validValues: Object.values(Browser),
        receivedValue: browser 
      }
    );
  }
  
  return browser as Browser;
}

export function validateDeviceType(device?: string): DeviceType | undefined {
  if (!device) return undefined;
  
  if (!Object.values(DeviceType).includes(device as DeviceType)) {
    throw createValidationError(
      `Invalid device type: ${device}`,
      { 
        validValues: Object.values(DeviceType),
        receivedValue: device 
      }
    );
  }
  
  return device as DeviceType;
}

export function validateExportFormat(format?: string): ExportFormat | undefined {
  if (!format) return undefined;
  
  if (!Object.values(ExportFormat).includes(format as ExportFormat)) {
    throw createValidationError(
      `Invalid export format: ${format}`,
      { 
        validValues: Object.values(ExportFormat),
        receivedValue: format 
      }
    );
  }
  
  return format as ExportFormat;
}

export function validateCount(count?: string): number {
  if (!count) return 1;
  
  const parsed = parseInt(count, 10);
  
  if (isNaN(parsed) || parsed < 1) {
    throw createValidationError(
      `Count must be a positive integer, received: ${count}`,
      { receivedValue: count }
    );
  }
  
  if (parsed > 1000) {
    throw createValidationError(
      `Count must not exceed 1000, received: ${parsed}`,
      { receivedValue: parsed, maxAllowed: 1000 }
    );
  }
  
  return parsed;
}

export function validateBoolean(value?: string): boolean | undefined {
  if (!value) return undefined;
  
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  
  throw createValidationError(
    `Boolean value must be 'true', 'false', '1', or '0', received: ${value}`,
    { receivedValue: value }
  );
}

// Middleware for query parameter validation
export function validateQueryParams(req: Request, res: Response, next: NextFunction): void {
  try {
    // Validate and attach parsed parameters to request
    (req as any).validatedQuery = {
      platform: validatePlatform(req.query.platform as string),
      browser: validateBrowser(req.query.browser as string),
      device: validateDeviceType(req.query.device as string),
      count: validateCount(req.query.count as string),
      format: validateExportFormat(req.query.format as string),
      weighted: validateBoolean(req.query.weighted as string),
    };
    
    next();
  } catch (error) {
    next(error);
  }
}

// Middleware for request body validation
export function validateExportBody(req: Request, res: Response, next: NextFunction): void {
  try {
    const { platform, browser, device, count, format, weighted } = req.body;
    
    // Validate required format field
    if (!format) {
      throw createValidationError('Export format is required', { field: 'format' });
    }
    
    // Validate and attach parsed body to request
    (req as any).validatedBody = {
      platform: validatePlatform(platform),
      browser: validateBrowser(browser),
      device: validateDeviceType(device),
      count: count ? validateCount(count.toString()) : 10,
      format: validateExportFormat(format),
      weighted: typeof weighted === 'boolean' ? weighted : undefined,
    };
    
    next();
  } catch (error) {
    next(error);
  }
}