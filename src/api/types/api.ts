import { Platform, Browser, DeviceType, ExportFormat } from '../../types';

// Request types
export interface UAQueryParams {
  platform?: Platform;
  browser?: Browser;
  device?: DeviceType;
}

export interface UAMultipleQueryParams extends UAQueryParams {
  count?: string;
  format?: ExportFormat;
  weighted?: string;
}

export interface ExportRequestBody {
  platform?: Platform;
  browser?: Browser;
  device?: DeviceType;
  count?: number;
  format: ExportFormat;
  weighted?: boolean;
}

// Response types
export interface UAResponse {
  userAgent: string;
  components: {
    platform: Platform;
    browser: Browser;
    deviceType: DeviceType;
    browserVersion: string;
    engineVersion: string;
    osString: string;
    deviceModel?: string;
  };
  timestamp: string;
}

export interface UAMultipleResponse {
  userAgents: string[];
  count: number;
  format: ExportFormat;
  timestamp: string;
  components?: UAResponse['components'][];
}

export interface ExportResponse {
  format: ExportFormat;
  content: string;
  count: number;
  timestamp: string;
  parameters: {
    platform?: Platform;
    browser?: Browser;
    device?: DeviceType;
    weighted?: boolean;
  };
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  node: string;
}

export interface StatsResponse {
  totalRequests: number;
  requestsByEndpoint: Record<string, number>;
  requestsByPlatform: Record<Platform, number>;
  requestsByBrowser: Record<Browser, number>;
  uptime: number;
  timestamp: string;
}

export interface ComponentsResponse {
  platforms: Platform[];
  browsers: Browser[];
  deviceTypes: DeviceType[];
  exportFormats: ExportFormat[];
  combinations: {
    totalPossible: number;
    platformBrowserMatrix: Record<Platform, Browser[]>;
  };
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    details?: Record<string, any>;
  };
}

// Server configuration
export interface ServerConfig {
  port: number;
  host: string;
  cors: {
    enabled: boolean;
    origins?: string[] | string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  security: {
    helmet: boolean;
    trustProxy: boolean;
  };
}

// Request context for logging and stats
export interface RequestContext {
  requestId: string;
  userAgent?: string;
  ip: string;
  endpoint: string;
  method: string;
  timestamp: string;
  parameters?: Record<string, any>;
}