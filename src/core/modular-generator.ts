import { UAString, UAFilter, Platform, Browser, DeviceType } from '../types';
import {
  OS_COMPONENTS,
  BROWSER_COMPONENTS,
  ENGINE_COMPONENTS,
  DEVICE_COMPONENTS,
  UA_TEMPLATES,
  getRandomFromWeighted,
  getRandomFromArray,
  getCompatibleOS,
  getCompatibleBrowsers,
  getCompatibleEngines,
  getCompatibleDevices,
  buildOSString,
  OSComponent,
  BrowserComponent,
  EngineComponent,
  DeviceComponent,
} from '../data/component-lists';

export interface UAComponents {
  platform: Platform;
  deviceType: DeviceType;
  browser: Browser;
  osComponent: OSComponent;
  browserComponent: BrowserComponent;
  engineComponent: EngineComponent;
  deviceComponent?: DeviceComponent;
  osString: string;
  browserVersion: string;
  engineVersion: string;
  deviceModel?: string;
  userAgent: string;
}

export function generateModularUA(filter?: UAFilter, weighted: boolean = true): UAComponents {
  // Step 1: Determine device type
  let deviceType = filter?.deviceType;
  if (!deviceType) {
    let deviceWeights = [
      { type: DeviceType.Desktop, weight: 60 },
      { type: DeviceType.Mobile, weight: 35 },
      { type: DeviceType.Tablet, weight: 5 },
    ];
    
    // If browser is specified, filter device types to those compatible with the browser
    if (filter?.browser) {
      const browserComponent = BROWSER_COMPONENTS.find(b => b.browser === filter.browser);
      if (browserComponent) {
        const compatibleDeviceTypes: DeviceType[] = [];
        browserComponent.platforms.forEach(platform => {
          const availableTypes = getAvailableDeviceTypes(platform);
          availableTypes.forEach(type => {
            if (!compatibleDeviceTypes.includes(type)) {
              compatibleDeviceTypes.push(type);
            }
          });
        });
        deviceWeights = deviceWeights.filter(dw => compatibleDeviceTypes.includes(dw.type));
      }
    }
    
    deviceType = weighted 
      ? getRandomFromWeighted(deviceWeights).type
      : getRandomFromArray(deviceWeights).type;
  }

  // If platform is specified, ensure device type is compatible
  if (filter?.platform) {
    const availableDeviceTypes = getAvailableDeviceTypes(filter.platform);
    if (!availableDeviceTypes.includes(deviceType)) {
      // Default to desktop for desktop platforms, mobile for mobile platforms
      if ([Platform.Windows, Platform.macOS, Platform.Linux].includes(filter.platform)) {
        deviceType = DeviceType.Desktop;
      } else {
        deviceType = DeviceType.Mobile;
      }
    }
  }

  // Step 2: Determine platform based on constraints
  let platform = filter?.platform;
  if (!platform) {
    // If browser is specified, prioritize compatible platforms for that browser
    if (filter?.browser) {
      const browserComponent = BROWSER_COMPONENTS.find(b => b.browser === filter.browser);
      if (browserComponent) {
        // Pick a platform that's compatible with both device type and browser
        const availablePlatforms = getAvailablePlatforms(deviceType);
        const compatiblePlatforms = browserComponent.platforms.filter(p => availablePlatforms.includes(p));
        if (compatiblePlatforms.length > 0) {
          const platformComponents = OS_COMPONENTS.filter(os => compatiblePlatforms.includes(os.platform));
          const osComponent = weighted 
            ? getRandomFromWeighted(platformComponents)
            : getRandomFromArray(platformComponents);
          platform = osComponent.platform;
        }
      }
    }
    
    // If still no platform, use device type constraints
    if (!platform) {
      const availablePlatforms = getAvailablePlatforms(deviceType);
      const platformComponents = OS_COMPONENTS.filter(os => availablePlatforms.includes(os.platform));
      const osComponent = weighted 
        ? getRandomFromWeighted(platformComponents)
        : getRandomFromArray(platformComponents);
      platform = osComponent.platform;
    }
  }

  // Step 3: Select OS component for the platform
  let compatibleOS = getCompatibleOS(platform);
  
  // For iOS, filter OS components based on device type
  if (platform === Platform.iOS) {
    if (deviceType === DeviceType.Tablet) {
      // For tablets, only use iPad OS components
      compatibleOS = compatibleOS.filter(os => os.name.includes('iPad'));
    } else if (deviceType === DeviceType.Mobile) {
      // For mobile, only use iPhone OS components  
      compatibleOS = compatibleOS.filter(os => os.name.includes('iPhone'));
    }
  }
  
  const osComponent = weighted 
    ? getRandomFromWeighted(compatibleOS)
    : getRandomFromArray(compatibleOS);

  // Step 4: Select browser based on platform compatibility
  let browser = filter?.browser;
  if (!browser) {
    const compatibleBrowsers = getCompatibleBrowsers(platform);
    const browserComponent = weighted 
      ? getRandomFromWeighted(compatibleBrowsers)
      : getRandomFromArray(compatibleBrowsers);
    browser = browserComponent.browser;
  }

  // Get browser component - should always be compatible at this point
  let browserComponents = BROWSER_COMPONENTS.filter(b => b.browser === browser && b.platforms.includes(platform));
  
  if (browserComponents.length === 0) {
    // This should not happen if the logic above is correct, but fallback just in case
    const compatibleBrowsers = getCompatibleBrowsers(platform);
    if (compatibleBrowsers.length === 0) {
      throw new Error(`No compatible browsers found for platform: ${platform}`);
    }
    const fallbackBrowserComponent = getRandomFromArray(compatibleBrowsers);
    browser = fallbackBrowserComponent.browser;
    browserComponents = [fallbackBrowserComponent];
  }
  
  const browserComponent = getRandomFromArray(browserComponents);

  // Step 5: Select engine compatible with browser
  const compatibleEngines = getCompatibleEngines(browser);
  const engineComponent = weighted 
    ? getRandomFromWeighted(compatibleEngines)
    : getRandomFromArray(compatibleEngines);

  // Step 6: Select device model for mobile/tablet
  let deviceComponent: DeviceComponent | undefined;
  let deviceModel: string | undefined;
  
  if (deviceType !== DeviceType.Desktop) {
    const compatibleDevices = getCompatibleDevices(platform, deviceType);
    if (compatibleDevices.length > 0) {
      deviceComponent = weighted 
        ? getRandomFromWeighted(compatibleDevices)
        : getRandomFromArray(compatibleDevices);
      deviceModel = getRandomFromArray(deviceComponent.models);
    }
  }

  // Step 7: Generate version strings
  const browserVersion = getRandomFromArray(browserComponent.versions);
  const engineVersion = getRandomFromArray(engineComponent.versions);

  // Step 8: Build OS string
  const osString = buildOSString(osComponent, deviceModel);

  // Step 9: Build user agent string using template
  const template = UA_TEMPLATES[browser][deviceType];
  let userAgent = template
    .replace(/{os_string}/g, osString)
    .replace(/{engine_version}/g, engineVersion)
    .replace(/{browser_version}/g, browserVersion);

  // Handle device model replacement
  if (deviceModel) {
    userAgent = userAgent.replace(/{device_model}/g, deviceModel);
  }

  // Handle special cases for different browsers
  if (browser === Browser.Safari) {
    const safariVersion = engineVersion.split('.')[0] + '.1.15'; // Safari version format
    userAgent = userAgent.replace(/{safari_version}/g, safariVersion);
  }

  if (browser === Browser.Edge) {
    // Edge uses Chrome version for compatibility
    const chromeVersion = browserVersion; // Edge versions match Chrome
    userAgent = userAgent.replace(/{chrome_version}/g, chromeVersion);
  }

  return {
    platform,
    deviceType,
    browser,
    osComponent,
    browserComponent,
    engineComponent,
    deviceComponent,
    osString,
    browserVersion,
    engineVersion,
    deviceModel,
    userAgent,
  };
}

export function generateModularUAString(filter?: UAFilter, weighted: boolean = true): UAString {
  return generateModularUA(filter, weighted).userAgent;
}

export function generateMultipleModularUA(
  count: number,
  filter?: UAFilter,
  weighted: boolean = true
): UAComponents[] {
  const results: UAComponents[] = [];
  
  for (let i = 0; i < count; i++) {
    results.push(generateModularUA(filter, weighted));
  }
  
  return results;
}

export function generateMultipleModularUAStrings(
  count: number,
  filter?: UAFilter,
  weighted: boolean = true
): UAString[] {
  return generateMultipleModularUA(count, filter, weighted).map(ua => ua.userAgent);
}

// Utility function to get available platforms for device type
function getAvailablePlatforms(deviceType: DeviceType): Platform[] {
  switch (deviceType) {
    case DeviceType.Desktop:
      return [Platform.Windows, Platform.macOS, Platform.Linux];
    case DeviceType.Mobile:
      return [Platform.Android, Platform.iOS];
    case DeviceType.Tablet:
      return [Platform.Android, Platform.iOS];
    default:
      return [Platform.Windows, Platform.macOS, Platform.Linux, Platform.Android, Platform.iOS];
  }
}

// Utility function to get available device types for platform
function getAvailableDeviceTypes(platform: Platform): DeviceType[] {
  switch (platform) {
    case Platform.Windows:
    case Platform.macOS:
    case Platform.Linux:
      return [DeviceType.Desktop];
    case Platform.Android:
      return [DeviceType.Mobile, DeviceType.Tablet];
    case Platform.iOS:
      return [DeviceType.Mobile, DeviceType.Tablet];
    default:
      return [DeviceType.Desktop, DeviceType.Mobile, DeviceType.Tablet];
  }
}

// Advanced generation with custom component selection
export interface CustomComponentOptions {
  osVersionRange?: { min?: string; max?: string };
  browserVersionRange?: { min?: string; max?: string };
  engineVersionRange?: { min?: string; max?: string };
  specificDeviceModels?: string[];
  excludePlatforms?: Platform[];
  excludeBrowsers?: Browser[];
}

export function generateCustomModularUA(
  filter?: UAFilter,
  options?: CustomComponentOptions,
  weighted: boolean = true
): UAComponents {
  // This is a more advanced version that could filter components based on custom options
  let components = generateModularUA(filter, weighted);
  
  // Apply custom filtering logic here if needed
  if (options?.excludePlatforms?.includes(components.platform)) {
    // Regenerate with different constraints
    const newFilter = { ...filter };
    // Remove excluded platform logic would go here
    components = generateModularUA(newFilter, weighted);
  }
  
  return components;
}

// Debug function to show all possible combinations
export function getAvailableCombinations(filter?: UAFilter): {
  platforms: Platform[];
  browsers: Browser[];
  devices: DeviceType[];
  totalCombinations: number;
} {
  const platforms = filter?.platform ? [filter.platform] : Object.values(Platform);
  const browsers = filter?.browser ? [filter.browser] : Object.values(Browser);
  const devices = filter?.deviceType ? [filter.deviceType] : Object.values(DeviceType);
  
  // Calculate approximate total combinations
  const osCount = OS_COMPONENTS.length;
  const browserCount = BROWSER_COMPONENTS.length;
  const engineCount = ENGINE_COMPONENTS.length;
  const deviceCount = DEVICE_COMPONENTS.reduce((sum, dc) => sum + dc.models.length, 0);
  
  const totalCombinations = osCount * browserCount * engineCount * deviceCount;
  
  return {
    platforms,
    browsers,
    devices,
    totalCombinations,
  };
}

// Export the component data for external use
export {
  OS_COMPONENTS,
  BROWSER_COMPONENTS,
  ENGINE_COMPONENTS,
  DEVICE_COMPONENTS,
  UA_TEMPLATES,
} from '../data/component-lists';