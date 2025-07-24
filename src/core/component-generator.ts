import { UAString, UAFilter, Platform, Browser, DeviceType } from '../types';
import {
  BROWSER_TEMPLATES,
  PLATFORM_TEMPLATES,
  DEVICE_TEMPLATES,
  getWeightedRandom,
  formatVersion,
  getRandomDeviceModel,
} from '../data/components';

export interface GeneratedComponents {
  platform: string;
  browser: string;
  device: string;
  userAgent: string;
  browserVersion: string;
  platformVersion: string;
  webkitVersion?: string;
  deviceModel?: string;
}

export function generateUAFromComponents(filter?: UAFilter, weighted: boolean = true): GeneratedComponents {
  // Select device type
  const deviceType = filter?.deviceType || getRandomDeviceType();
  const deviceTemplate = DEVICE_TEMPLATES.find(d => d.type === deviceType);
  if (!deviceTemplate) {
    throw new Error(`No device template found for device type: ${deviceType}`);
  }

  // Select platform based on device compatibility
  const availablePlatforms = deviceTemplate.platforms;
  const platformName = filter?.platform && availablePlatforms.includes(filter.platform) 
    ? filter.platform 
    : getRandomPlatform(availablePlatforms, weighted);

  const platformTemplate = PLATFORM_TEMPLATES.find(p => p.name === platformName);
  if (!platformTemplate) {
    throw new Error(`No platform template found for platform: ${platformName}`);
  }

  // Select browser based on platform compatibility
  const browserName = filter?.browser || getRandomBrowser(platformName, weighted);
  const browserTemplate = BROWSER_TEMPLATES.find(b => b.name === browserName);
  if (!browserTemplate) {
    throw new Error(`No browser template found for browser: ${browserName}`);
  }

  // Generate version components
  const browserVersion = weighted 
    ? getWeightedRandom(browserTemplate.versions)
    : browserTemplate.versions[Math.floor(Math.random() * browserTemplate.versions.length)];

  const platformVersion = platformTemplate.versions[Math.floor(Math.random() * platformTemplate.versions.length)];

  // Generate webkit version for Chromium-based browsers
  let webkitVersion: string | undefined;
  if (browserTemplate.webkitVersion) {
    const webkit = weighted 
      ? getWeightedRandom(browserTemplate.webkitVersion)
      : browserTemplate.webkitVersion[Math.floor(Math.random() * browserTemplate.webkitVersion.length)];
    webkitVersion = formatVersion(webkit);
  }

  // Generate device model for mobile/tablet
  let deviceModel: string | undefined;
  if (deviceType !== DeviceType.Desktop) {
    deviceModel = getRandomDeviceModel(platformName);
  }

  // Build platform string
  let platformString = platformTemplate.template.replace('{version}', platformVersion);
  if (deviceModel && deviceTemplate.template.includes('{device_model}')) {
    platformString = deviceTemplate.template
      .replace('{platform}', platformString)
      .replace('{device_model}', deviceModel);
  } else {
    platformString = deviceTemplate.template.replace('{platform}', platformString);
  }

  // Build user agent string
  let userAgent = browserTemplate.template
    .replace('{platform}', platformString)
    .replace('{browser_version}', formatVersion(browserVersion));

  if (webkitVersion) {
    userAgent = userAgent.replace(/{webkit_version}/g, webkitVersion);
  }

  if (browserTemplate.geckoVersion) {
    userAgent = userAgent.replace('{gecko_version}', browserTemplate.geckoVersion);
  }

  // Handle mobile suffix for Android Chrome
  if (platformName === Platform.Android && deviceType === DeviceType.Mobile && browserName === Browser.Chrome) {
    userAgent += ' Mobile';
  }

  return {
    platform: platformName,
    browser: browserName,
    device: deviceType,
    userAgent,
    browserVersion: formatVersion(browserVersion),
    platformVersion,
    webkitVersion,
    deviceModel,
  };
}

export function generateMultipleUAFromComponents(
  count: number,
  filter?: UAFilter,
  weighted: boolean = true
): GeneratedComponents[] {
  const results: GeneratedComponents[] = [];
  
  for (let i = 0; i < count; i++) {
    results.push(generateUAFromComponents(filter, weighted));
  }
  
  return results;
}

export function generateUAStringFromComponents(filter?: UAFilter, weighted: boolean = true): UAString {
  return generateUAFromComponents(filter, weighted).userAgent;
}

function getRandomDeviceType(): DeviceType {
  const weights = {
    [DeviceType.Desktop]: 60,
    [DeviceType.Mobile]: 35,
    [DeviceType.Tablet]: 5,
  };
  
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const randomWeight = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const [deviceType, weight] of Object.entries(weights)) {
    currentWeight += weight;
    if (randomWeight <= currentWeight) {
      return deviceType as DeviceType;
    }
  }
  
  return DeviceType.Desktop;
}

function getRandomPlatform(availablePlatforms: Platform[], weighted: boolean): Platform {
  const platformTemplates = PLATFORM_TEMPLATES.filter(p => availablePlatforms.includes(p.name));
  
  if (weighted) {
    return getWeightedRandom(platformTemplates).name;
  } else {
    return platformTemplates[Math.floor(Math.random() * platformTemplates.length)].name;
  }
}

function getRandomBrowser(platform: Platform, weighted: boolean): Browser {
  // Browser compatibility matrix
  const browserCompatibility: Record<Platform, Browser[]> = {
    [Platform.Windows]: [Browser.Chrome, Browser.Firefox, Browser.Edge],
    [Platform.macOS]: [Browser.Chrome, Browser.Firefox, Browser.Safari],
    [Platform.Linux]: [Browser.Chrome, Browser.Firefox],
    [Platform.Android]: [Browser.Chrome, Browser.Firefox],
    [Platform.iOS]: [Browser.Safari, Browser.Chrome], // Chrome on iOS is actually Safari-based
  };

  const availableBrowsers = browserCompatibility[platform] || [Browser.Chrome];
  const browserTemplates = BROWSER_TEMPLATES.filter(b => availableBrowsers.includes(b.name));
  
  if (weighted) {
    // Apply browser market share weights
    const browserWeights: Record<Browser, number> = {
      [Browser.Chrome]: 65,
      [Browser.Safari]: 20,
      [Browser.Edge]: 10,
      [Browser.Firefox]: 5,
    };
    
    const weightedTemplates = browserTemplates.map(template => ({
      ...template,
      weight: browserWeights[template.name] || 1,
    }));
    
    return getWeightedRandom(weightedTemplates).name;
  } else {
    return browserTemplates[Math.floor(Math.random() * browserTemplates.length)].name;
  }
}

// Advanced generation with custom version ranges
export interface VersionRange {
  min?: number;
  max?: number;
}

export interface AdvancedGenerationOptions {
  browserVersionRange?: VersionRange;
  platformVersionRange?: VersionRange;
  preferLatest?: boolean;
  customWeight?: boolean;
}

export function generateAdvancedUA(
  filter?: UAFilter,
  options?: AdvancedGenerationOptions
): GeneratedComponents {
  const components = generateUAFromComponents(filter, options?.customWeight !== false);
  
  // Could apply version range filtering here if needed
  // This is a placeholder for more advanced filtering logic
  
  return components;
}