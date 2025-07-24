import { Platform, Browser, DeviceType } from '../types';

// Operating System Components
export interface OSComponent {
  platform: Platform;
  name: string;
  versions: string[];
  architecture?: string[];
  weight: number;
}

export const OS_COMPONENTS: OSComponent[] = [
  {
    platform: Platform.Windows,
    name: 'Windows NT',
    versions: ['10.0', '6.3', '6.1'],
    architecture: ['Win64; x64', 'WOW64', 'Win32'],
    weight: 45,
  },
  {
    platform: Platform.macOS,
    name: 'Intel Mac OS X',
    versions: ['10_15_7', '10_14_6', '10_13_6', '11_0_1', '12_0_1', '13_0_1'],
    weight: 25,
  },
  {
    platform: Platform.Linux,
    name: 'X11; Linux',
    versions: [''],
    architecture: ['x86_64', 'i686'],
    weight: 8,
  },
  {
    platform: Platform.Android,
    name: 'Linux; Android',
    versions: ['13', '12', '11', '10', '9'],
    weight: 15,
  },
  {
    platform: Platform.iOS,
    name: 'iPhone; CPU iPhone OS',
    versions: ['17_1', '16_6', '15_7', '14_8'],
    weight: 4,
  },
  {
    platform: Platform.iOS,
    name: 'iPad; CPU OS',
    versions: ['17_1', '16_6', '15_7', '14_8'],
    weight: 3,
  },
];

// Browser Engine Components
export interface EngineComponent {
  name: string;
  versions: string[];
  browsers: Browser[];
  weight: number;
}

export const ENGINE_COMPONENTS: EngineComponent[] = [
  {
    name: 'AppleWebKit',
    versions: ['537.36', '605.1.15', '534.30', '537.35'],
    browsers: [Browser.Chrome, Browser.Safari, Browser.Edge],
    weight: 80,
  },
  {
    name: 'Gecko',
    versions: ['20100101'],
    browsers: [Browser.Firefox],
    weight: 15,
  },
  {
    name: 'Blink',
    versions: ['537.36'],
    browsers: [Browser.Chrome, Browser.Edge],
    weight: 5,
  },
];

// Browser Components
export interface BrowserComponent {
  browser: Browser;
  name: string;
  versions: string[];
  engines: string[];
  platforms: Platform[];
  weight: number;
}

export const BROWSER_COMPONENTS: BrowserComponent[] = [
  {
    browser: Browser.Chrome,
    name: 'Chrome',
    versions: ['120.0.0.0', '119.0.0.0', '118.0.0.0', '117.0.0.0', '116.0.0.0', '115.0.0.0'],
    engines: ['AppleWebKit', 'Blink'],
    platforms: [Platform.Windows, Platform.macOS, Platform.Linux, Platform.Android, Platform.iOS],
    weight: 65,
  },
  {
    browser: Browser.Firefox,
    name: 'Firefox',
    versions: ['120.0', '119.0', '118.0', '117.0', '116.0', '115.0'],
    engines: ['Gecko'],
    platforms: [Platform.Windows, Platform.macOS, Platform.Linux, Platform.Android],
    weight: 8,
  },
  {
    browser: Browser.Safari,
    name: 'Safari',
    versions: ['17.1', '17.0', '16.6', '16.5', '15.6'],
    engines: ['AppleWebKit'],
    platforms: [Platform.macOS, Platform.iOS],
    weight: 18,
  },
  {
    browser: Browser.Edge,
    name: 'Edge',
    versions: ['120.0.0.0', '119.0.0.0', '118.0.0.0', '117.0.0.0'],
    engines: ['AppleWebKit'],
    platforms: [Platform.Windows, Platform.macOS],
    weight: 9,
  },
];

// Device Model Components
export interface DeviceComponent {
  platform: Platform;
  deviceType: DeviceType;
  models: string[];
  weight: number;
}

export const DEVICE_COMPONENTS: DeviceComponent[] = [
  {
    platform: Platform.Android,
    deviceType: DeviceType.Mobile,
    models: [
      'SM-G998B', 'SM-G991B', 'SM-G996B', 'SM-A525F', 'SM-A725F', 'SM-N986B',
      'Pixel 7 Pro', 'Pixel 7', 'Pixel 6 Pro', 'Pixel 6', 'Pixel 5', 'Pixel 4a',
      'OnePlus 11', 'OnePlus 10 Pro', 'OnePlus 9 Pro', 'OnePlus 8T',
      'LM-G710', 'LM-V500N', 'LM-G820', 'Mi 11', 'Mi 10T Pro', 'Redmi Note 11',
    ],
    weight: 60,
  },
  {
    platform: Platform.Android,
    deviceType: DeviceType.Tablet,
    models: [
      'SM-T970', 'SM-T870', 'SM-T720', 'SM-P900', 'SM-T290',
      'Pixel Tablet', 'Tab S8', 'Tab S7', 'MatePad Pro',
    ],
    weight: 20,
  },
  {
    platform: Platform.iOS,
    deviceType: DeviceType.Mobile,
    models: [
      'iPhone15,3', 'iPhone15,2', 'iPhone14,3', 'iPhone14,2', 'iPhone13,4',
      'iPhone13,3', 'iPhone13,2', 'iPhone13,1', 'iPhone12,8', 'iPhone12,5',
    ],
    weight: 15,
  },
  {
    platform: Platform.iOS,
    deviceType: DeviceType.Tablet,
    models: [
      'iPad14,3', 'iPad14,2', 'iPad13,11', 'iPad13,10', 'iPad13,2', 'iPad13,1',
      'iPad12,2', 'iPad12,1', 'iPad11,4', 'iPad11,3',
    ],
    weight: 5,
  },
];

// Screen Resolution Components
export const SCREEN_RESOLUTIONS = {
  [DeviceType.Desktop]: {
    common: ['1920x1080', '1366x768', '1440x900', '1536x864'],
    weight: [40, 25, 20, 15],
  },
  [DeviceType.Mobile]: {
    common: ['393x852', '375x667', '414x896', '360x640', '375x812', '390x844'],
    weight: [25, 20, 20, 15, 10, 10],
  },
  [DeviceType.Tablet]: {
    common: ['768x1024', '820x1180', '1024x768', '834x1194', '800x1280'],
    weight: [30, 25, 20, 15, 10],
  },
};

// Utility functions for component selection
export function getRandomFromWeighted<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const randomWeight = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const item of items) {
    currentWeight += item.weight;
    if (randomWeight <= currentWeight) {
      return item;
    }
  }
  
  return items[items.length - 1];
}

export function getRandomFromArray<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getCompatibleOS(platform: Platform): OSComponent[] {
  return OS_COMPONENTS.filter(os => os.platform === platform);
}

export function getCompatibleBrowsers(platform: Platform): BrowserComponent[] {
  return BROWSER_COMPONENTS.filter(browser => browser.platforms.includes(platform));
}

export function getCompatibleEngines(browser: Browser): EngineComponent[] {
  return ENGINE_COMPONENTS.filter(engine => engine.browsers.includes(browser));
}

export function getCompatibleDevices(platform: Platform, deviceType: DeviceType): DeviceComponent[] {
  return DEVICE_COMPONENTS.filter(device => 
    device.platform === platform && device.deviceType === deviceType
  );
}

// Template patterns for different browser types
export const UA_TEMPLATES = {
  [Browser.Chrome]: {
    desktop: 'Mozilla/5.0 ({os_string}) AppleWebKit/{engine_version} (KHTML, like Gecko) Chrome/{browser_version} Safari/{engine_version}',
    mobile: 'Mozilla/5.0 ({os_string}; {device_model}) AppleWebKit/{engine_version} (KHTML, like Gecko) Chrome/{browser_version} Mobile Safari/{engine_version}',
    tablet: 'Mozilla/5.0 ({os_string}; {device_model}) AppleWebKit/{engine_version} (KHTML, like Gecko) Chrome/{browser_version} Safari/{engine_version}',
  },
  [Browser.Firefox]: {
    desktop: 'Mozilla/5.0 ({os_string}; rv:{browser_version}) Gecko/{engine_version} Firefox/{browser_version}',
    mobile: 'Mozilla/5.0 (Mobile; {os_string}; rv:{browser_version}) Gecko/{engine_version} Firefox/{browser_version}',
    tablet: 'Mozilla/5.0 (Tablet; {os_string}; rv:{browser_version}) Gecko/{engine_version} Firefox/{browser_version}',
  },
  [Browser.Safari]: {
    desktop: 'Mozilla/5.0 ({os_string}) AppleWebKit/{engine_version} (KHTML, like Gecko) Version/{browser_version} Safari/{engine_version}',
    mobile: 'Mozilla/5.0 ({os_string}) AppleWebKit/{engine_version} (KHTML, like Gecko) Version/{browser_version} Mobile/15E148 Safari/{safari_version}',
    tablet: 'Mozilla/5.0 ({os_string}) AppleWebKit/{engine_version} (KHTML, like Gecko) Version/{browser_version} Mobile/15E148 Safari/{safari_version}',
  },
  [Browser.Edge]: {
    desktop: 'Mozilla/5.0 ({os_string}) AppleWebKit/{engine_version} (KHTML, like Gecko) Chrome/{chrome_version} Safari/{engine_version} Edg/{browser_version}',
    mobile: 'Mozilla/5.0 ({os_string}; {device_model}) AppleWebKit/{engine_version} (KHTML, like Gecko) Chrome/{chrome_version} Mobile Safari/{engine_version} EdgA/{browser_version}',
    tablet: 'Mozilla/5.0 ({os_string}; {device_model}) AppleWebKit/{engine_version} (KHTML, like Gecko) Chrome/{chrome_version} Safari/{engine_version} EdgA/{browser_version}',
  },
};

export function buildOSString(osComponent: OSComponent, deviceModel?: string): string {
  const version = getRandomFromArray(osComponent.versions);
  const arch = osComponent.architecture ? getRandomFromArray(osComponent.architecture) : '';
  
  switch (osComponent.platform) {
    case Platform.Windows:
      return `Windows NT ${version}; ${arch}`;
    case Platform.macOS:
      return `Macintosh; Intel Mac OS X ${version}`;
    case Platform.Linux:
      return `X11; Linux ${arch}`;
    case Platform.Android:
      return deviceModel ? `Linux; Android ${version}; ${deviceModel}` : `Linux; Android ${version}`;
    case Platform.iOS:
      if (osComponent.name.includes('iPhone')) {
        return `iPhone; CPU iPhone OS ${version} like Mac OS X`;
      } else {
        return `iPad; CPU OS ${version} like Mac OS X`;
      }
    default:
      return `${osComponent.name} ${version}`;
  }
}