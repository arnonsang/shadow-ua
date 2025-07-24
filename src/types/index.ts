export type UAString = string;

export enum Platform {
  Windows = 'Windows',
  macOS = 'macOS',
  Linux = 'Linux',
  Android = 'Android',
  iOS = 'iOS',
}

export enum Browser {
  Chrome = 'Chrome',
  Firefox = 'Firefox',
  Safari = 'Safari',
  Edge = 'Edge',
}

export enum DeviceType {
  Desktop = 'desktop',
  Mobile = 'mobile',
  Tablet = 'tablet',
}

export enum ExportFormat {
  TXT = 'txt',
  JSON = 'json',
  CSV = 'csv',
  CURL = 'curl',
}

export interface UAFilter {
  platform?: Platform;
  browser?: Browser;
  deviceType?: DeviceType;
}

export interface ExportOptions {
  format: ExportFormat;
  count: number;
  output?: string;
}

export interface ProxyConfig {
  host: string;
  port: number;
  type: 'HTTP' | 'HTTPS' | 'SOCKS';
  username?: string;
  password?: string;
}

export type ProxyList = ProxyConfig[];

export interface UAGenerationOptions {
  filter?: UAFilter;
  count?: number;
  weighted?: boolean;
}

export interface UAData {
  userAgent: UAString;
  platform: Platform;
  browser: Browser;
  deviceType: DeviceType;
  weight?: number;
}