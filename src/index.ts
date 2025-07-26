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

// Timing attack prevention
export {
  createTimingProtection,
  generateHumanTiming,
  createHumanDelay,
  generateTimingProtectionScript,
  TimingProtection,
  TimingConfig,
  RequestTiming,
} from './core/timing-protection';

// TLS fingerprint spoofing
export {
  generateTLSFingerprint,
  generateTLSConfig,
  generateHTTPSAgentConfig,
  generateCurlWithTLS,
  generatePythonRequestsConfig,
  analyzeTLSCompatibility,
  TLSFingerprint,
  TLSExtension,
  TLSConfig,
} from './core/tls-fingerprinting';

// Async/parallel UA generation
export {
  createAsyncGenerator,
  generateParallel,
  createStreamingGenerator,
  AsyncUAGenerator,
  Semaphore,
  AsyncGenerationOptions,
  GenerationResult,
  BatchResult,
  GenerationCache,
} from './core/async-generator';

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
  generateCanvasNoiseScript,
  generateWebRTCMaskingScript,
  generateAntiDetectionScript,
  BrowserFingerprint,
  PuppeteerConfig,
  PlaywrightConfig,
} from './integrations/browser-spoofing';

// Playwright MCP integration
export {
  generateMCPServer,
  createPlaywrightContext,
  generatePlaywrightLaunchOptions,
  generateStealthPageScript,
  generateHumanInteractionScript,
  generateMCPToolImplementation,
  MCPPlaywrightConfig,
  MCPServer,
  MCPTool,
  PlaywrightAutomationContext,
} from './integrations/playwright-mcp';

// Selenium Grid integration
export {
  createSeleniumGridManager,
  generateWebDriverScript,
  generateDockerCompose,
  SeleniumGridManager,
  SeleniumGridNode,
  UARotationStrategy,
  SeleniumGridConfig,
  GridSession,
  SeleniumCapabilities,
} from './integrations/selenium-grid';

// OWASP ZAP integration
export {
  createZAPIntegration,
  generateZAPInstallScript,
  OWASPZAPIntegration,
  ZAPPluginConfig,
  ZAPScanConfig,
  ZAPSessionData,
  ZAPScanResult,
  ZAPFinding,
  ZAPProxyConfig,
} from './integrations/owasp-zap';

// Streaming API
export {
  createStreamingManager,
  generateClientScript,
  StreamingManager,
  StreamingConfig,
  StreamingClient,
  StreamEvent,
} from './api/streaming';

// Rate limiting bypass
export {
  createRequestDistribution,
  generateHTTPClientWithDistribution,
  RequestDistributionManager,
  RequestDistributionConfig,
  DistributionNode,
  RequestMetrics,
  DistributionResult,
} from './core/rate-limiting-bypass';

// Geolocation-based UA generation
export {
  createGeoDistributionManager,
  generateGeoUA,
  GeoDistributionManager,
  GeoLocation,
  RegionalDistribution,
  GeoUAConfig,
} from './core/geo-distribution';

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