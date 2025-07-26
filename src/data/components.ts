import { Platform, Browser, DeviceType } from '../types';

// Browser version templates and data
export interface BrowserVersion {
  major: number;
  minor?: number;
  patch?: number;
  build?: number;
  weight?: number;
}

export interface BrowserTemplate {
  name: Browser;
  versions: BrowserVersion[];
  template: string;
  webkitVersion?: BrowserVersion[];
  geckoVersion?: string;
}

export interface PlatformTemplate {
  name: Platform;
  versions: string[];
  template: string;
  weight?: number;
}

export interface DeviceTemplate {
  type: DeviceType;
  platforms: Platform[];
  screenResolutions?: string[];
  template: string;
}

// Chrome browser templates and versions
export const CHROME_VERSIONS: BrowserVersion[] = [
  { major: 138, minor: 0, patch: 7204, build: 168, weight: 25 },
  { major: 137, minor: 0, patch: 7151, build: 137, weight: 20 },
  { major: 136, minor: 0, patch: 3240, build: 159, weight: 15 },
  { major: 135, minor: 0, patch: 3179, build: 95,  weight: 12 },
  { major: 134, minor: 0, patch: 3124, build: 129, weight: 10 },
  { major: 133, minor: 0, patch: 3065, build: 92,  weight: 8 },
];

export const WEBKIT_VERSIONS: BrowserVersion[] = [
  { major: 537, minor: 36, weight: 80 },
  { major: 537, minor: 35, weight: 15 },
  { major: 537, minor: 34, weight: 5 },
];

// Firefox browser versions
export const FIREFOX_VERSIONS: BrowserVersion[] = [
  { major: 141, minor: 0, weight: 25 },
  { major: 140, minor: 0, weight: 20 },
  { major: 139, minor: 0, weight: 15 },
  { major: 138, minor: 0, weight: 12 },
  { major: 137, minor: 0, weight: 10 },
  { major: 136, minor: 0, weight: 8 },
];

// Safari browser versions
export const SAFARI_VERSIONS: BrowserVersion[] = [
  { major: 18, minor: 5, weight: 30 },   // Stable
  { major: 18, minor: 6, weight: 25 },   // Beta (not stable)
  { major: 18, minor: 4, weight: 20 },
  { major: 17, minor: 6, weight: 15 },
  { major: 17, minor: 5, weight: 10 },
];

// Edge browser versions
export const EDGE_VERSIONS: BrowserVersion[] = [
  { major: 138, minor: 0, patch: 3351, build: 95, weight: 25 },
  { major: 137, minor: 0, patch: 3296, build: 68, weight: 20 },
  { major: 136, minor: 0, patch: 3240, build: 131, weight: 15 },
  { major: 135, minor: 0, patch: 3179, build: 73, weight: 12 },
];

// Browser templates
export const BROWSER_TEMPLATES: BrowserTemplate[] = [
  {
    name: Browser.Chrome,
    versions: CHROME_VERSIONS,
    webkitVersion: WEBKIT_VERSIONS,
    template: 'Mozilla/5.0 ({platform}) AppleWebKit/{webkit_version} (KHTML, like Gecko) Chrome/{browser_version} Safari/{webkit_version}',
  },
  {
    name: Browser.Firefox,
    versions: FIREFOX_VERSIONS,
    geckoVersion: '20100101',
    template: 'Mozilla/5.0 ({platform}; rv:{browser_version}) Gecko/{gecko_version} Firefox/{browser_version}',
  },
  {
    name: Browser.Safari,
    versions: SAFARI_VERSIONS,
    template: 'Mozilla/5.0 ({platform}) AppleWebKit/{webkit_version} (KHTML, like Gecko) Version/{browser_version} Safari/{webkit_version}',
  },
  {
    name: Browser.Edge,
    versions: EDGE_VERSIONS,
    webkitVersion: WEBKIT_VERSIONS,
    template: 'Mozilla/5.0 ({platform}) AppleWebKit/{webkit_version} (KHTML, like Gecko) Chrome/{browser_version} Safari/{webkit_version} Edg/{browser_version}',
  },
];

// Platform templates
export const PLATFORM_TEMPLATES: PlatformTemplate[] = [
  {
    name: Platform.Windows,
    versions: [
      'NT 10.0; Win64; x64',
      'NT 10.0; WOW64',
      'NT 10.0; Win64; ARM64',
      'NT 10.0; WOW64' // legacy
    ],
    template: 'Windows {version}',
    weight: 45,
  },
  {
    name: Platform.macOS,
    versions: [
      'Intel Mac OS X 14_0', // Sequoia
      'Intel Mac OS X 13_6', // Ventura
      'Intel Mac OS X 12_7'  // Monterey
    ],
    template: 'Macintosh; {version}',
    weight: 25,
  },
  {
    name: Platform.Linux,
    versions: [
      'X11; Linux x86_64',
      'X11; Ubuntu; Linux x86_64',
      'X11; Linux aarch64'
    ],
    template: '{version}',
    weight: 8,
  },
  {
    name: Platform.Android,
    versions: [
      'Linux; Android 16',
      'Linux; Android 15',
      'Linux; Android 14'
    ],
    template: '{version}',
    weight: 15,
  },
  {
    name: Platform.iOS,
    versions: [
      'iPhone; CPU iPhone OS 18_6 like Mac OS X',
      'iPhone; CPU iPhone OS 18_5 like Mac OS X',
      'iPad; CPU OS 18_5 like Mac OS X'
    ],
    template: '{version}',
    weight: 7,
  },
];


// Device models for iOS
export const IOS_DEVICES = [
  'iPhone16,1',     // iPhone 16
  'iPhone16,2',     // iPhone 16 Plus
  'iPhone16,3',     // iPhone 16 Pro
  'iPhone16,4',     // iPhone 16 Pro Max
  'iPhone16e',      // iPhone 16e (budget 2025 model)
  'iPhone15,2',     // iPhone 14 Pro etc.
  'iPhone15,3',     // iPhone 14 Pro Max / 15+
  'iPhone14,2',     // iPhone 13 Pro
  'iPhone14,3'      // iPhone 13 Pro Max
];

// Device models for Android
export const ANDROID_DEVICES = [
  'SM-S931B',       // Galaxy S25
  'Pixel 9 Pro',
  'Pixel 9',
  'SM-S928B',       // Galaxy S24 Ultra
  'SM-G556B',       // Galaxy Xcover7 / Motorola G-series
  'Moto g (2025)',
  'Moto Edge 30 Neo'
];

// Screen resolutions by device type
export const SCREEN_RESOLUTIONS = {
  [DeviceType.Desktop]: ['1920x1080', '1366x768', '1440x900', '1536x864', '1280x720'],
  [DeviceType.Mobile]: ['393x852', '375x667', '414x896', '360x640', '375x812'],
  [DeviceType.Tablet]: ['768x1024', '820x1180', '1024x768', '834x1194', '800x1280'],
};

// Device templates
export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    type: DeviceType.Desktop,
    platforms: [Platform.Windows, Platform.macOS, Platform.Linux],
    screenResolutions: SCREEN_RESOLUTIONS[DeviceType.Desktop],
    template: '{platform}',
  },
  {
    type: DeviceType.Mobile,
    platforms: [Platform.Android, Platform.iOS],
    screenResolutions: SCREEN_RESOLUTIONS[DeviceType.Mobile],
    template: '{platform}; {device_model}',
  },
  {
    type: DeviceType.Tablet,
    platforms: [Platform.Android, Platform.iOS],
    screenResolutions: SCREEN_RESOLUTIONS[DeviceType.Tablet],
    template: '{platform}; {device_model}',
  },
];

// Helper function to get weighted random item
export function getWeightedRandom<T extends { weight?: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  const randomWeight = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const item of items) {
    currentWeight += item.weight || 1;
    if (randomWeight <= currentWeight) {
      return item;
    }
  }
  
  return items[items.length - 1];
}

// Helper function to format version
export function formatVersion(version: BrowserVersion): string {
  let result = `${version.major}`;
  if (version.minor !== undefined) result += `.${version.minor}`;
  if (version.patch !== undefined) result += `.${version.patch}`;
  if (version.build !== undefined) result += `.${version.build}`;
  return result;
}

// Helper function to get random device model
export function getRandomDeviceModel(platform: Platform): string {
  if (platform === Platform.Android) {
    return ANDROID_DEVICES[Math.floor(Math.random() * ANDROID_DEVICES.length)];
  } else if (platform === Platform.iOS) {
    return IOS_DEVICES[Math.floor(Math.random() * IOS_DEVICES.length)];
  }
  return '';
}