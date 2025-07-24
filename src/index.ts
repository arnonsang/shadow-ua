// Main library exports for programmatic usage
export {
  generateRandomUA,
  generateFilteredUA,
  generateWeightedRandomUA,
  generateWeightedFilteredUA,
  loadCustomUAPool,
  getCustomUAPool,
  generateFromCustomPool,
  // Legacy functions
  generateRandomUALegacy,
  generateFilteredUALegacy,
  generateWeightedRandomUALegacy,
} from './core/generator';

// Modular generation exports
export {
  generateModularUA,
  generateModularUAString,
  generateMultipleModularUA,
  generateMultipleModularUAStrings,
  generateCustomModularUA,
  getAvailableCombinations,
  OS_COMPONENTS,
  BROWSER_COMPONENTS,
  ENGINE_COMPONENTS,
  DEVICE_COMPONENTS,
  UA_TEMPLATES,
} from './core/modular-generator';

export {
  exportUAs,
  exportToBurpSuite,
  exportToK6,
  exportToJMeter,
  exportToLocust,
} from './exports';

export {
  loadProxyList,
  rotateProxy,
  getRandomProxy,
  getNextProxy,
  validateProxy,
  formatProxyForCurl,
  formatProxyForAxios,
  resetProxyRotation,
} from './proxy';

// Browser fingerprint spoofing
export {
  generateBrowserFingerprint,
  generatePuppeteerConfig,
  generatePlaywrightConfig,
  generateFingerprintOverrides,
  BrowserFingerprint,
  PuppeteerConfig,
  PlaywrightConfig,
} from './integrations/browser-spoofing';

export {
  UAString,
  Platform,
  Browser,
  DeviceType,
  ExportFormat,
  UAFilter,
  ExportOptions,
  ProxyConfig,
  ProxyList,
  UAGenerationOptions,
  UAData,
} from './types';