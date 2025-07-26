import { Browser, Platform, DeviceType } from '../types';
import { generateModularUA, generateMultipleModularUA } from '../core/modular-generator';
import { generateBrowserFingerprint } from './browser-spoofing';
import { createTimingProtection } from '../core/timing-protection';
import { generateTLSConfig } from '../core/tls-fingerprinting';

export interface SeleniumGridNode {
  id: string;
  url: string;
  browser: Browser;
  platform: Platform;
  version: string;
  maxSessions: number;
  currentSessions: number;
  capabilities: Record<string, any>;
  status: 'online' | 'offline' | 'maintenance';
  lastHeartbeat: number;
}

export interface UARotationStrategy {
  type: 'sequential' | 'random' | 'weighted' | 'round-robin' | 'least-used';
  browsers?: Browser[];
  platforms?: Platform[];
  deviceTypes?: DeviceType[];
  rotationInterval?: number; // milliseconds
  maxUsagePerUA?: number;
}

export interface SeleniumGridConfig {
  hubUrl: string;
  nodes: SeleniumGridNode[];
  uaRotation: UARotationStrategy;
  sessionManagement: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    retryAttempts: number;
  };
  stealth: {
    enableFingerprinting: boolean;
    enableTimingProtection: boolean;
    enableTLSFingerprinting: boolean;
  };
}

export interface GridSession {
  sessionId: string;
  nodeId: string;
  userAgent: string;
  browser: Browser;
  platform: Platform;
  deviceType: DeviceType;
  capabilities: Record<string, any>;
  createdAt: number;
  lastUsed: number;
  fingerprint?: any;
  timingProtection?: any;
}

export interface SeleniumCapabilities {
  browserName: string;
  browserVersion?: string;
  platformName: string;
  'goog:chromeOptions'?: {
    args: string[];
    prefs: Record<string, any>;
    excludeSwitches: string[];
    useAutomationExtension: boolean;
  };
  'moz:firefoxOptions'?: {
    args: string[];
    prefs: Record<string, any>;
    binary?: string;
  };
  'ms:edgeOptions'?: {
    args: string[];
    prefs: Record<string, any>;
    excludeSwitches: string[];
  };
  'webkit:options'?: {
    args: string[];
  };
  // Custom Shadow-UA capabilities
  'shadowua:userAgent'?: string;
  'shadowua:fingerprint'?: boolean;
  'shadowua:timing'?: boolean;
  'shadowua:stealth'?: string;
}

class SeleniumGridManager {
  private nodes: Map<string, SeleniumGridNode> = new Map();
  private sessions: Map<string, GridSession> = new Map();
  private uaPool: string[] = [];
  private uaUsageCount: Map<string, number> = new Map();
  private currentUAIndex = 0;

  constructor(private config: SeleniumGridConfig) {
    this.initializeNodes();
    this.generateUAPool();
  }

  /**
   * Initialize grid nodes
   */
  private initializeNodes(): void {
    this.config.nodes.forEach(node => {
      this.nodes.set(node.id, { ...node, currentSessions: 0 });
    });
  }

  /**
   * Generate User-Agent pool based on rotation strategy
   */
  private generateUAPool(): void {
    const { type, browsers, platforms, deviceTypes } = this.config.uaRotation;
    const poolSize = 100; // Generate 100 UAs for rotation

    const targetBrowsers = browsers || [Browser.Chrome, Browser.Firefox, Browser.Safari, Browser.Edge];
    const targetPlatforms = platforms || [Platform.Windows, Platform.macOS, Platform.Linux];
    const targetDeviceTypes = deviceTypes || [DeviceType.Desktop];

    this.uaPool = [];

    for (let i = 0; i < poolSize; i++) {
      const browser = targetBrowsers[Math.floor(Math.random() * targetBrowsers.length)];
      const platform = targetPlatforms[Math.floor(Math.random() * targetPlatforms.length)];
      const deviceType = targetDeviceTypes[Math.floor(Math.random() * targetDeviceTypes.length)];

      const ua = generateModularUA({ browser, platform, deviceType });
      this.uaPool.push(ua.userAgent);
      this.uaUsageCount.set(ua.userAgent, 0);
    }
  }

  /**
   * Get next User-Agent based on rotation strategy
   */
  private getNextUA(): string {
    const { type, maxUsagePerUA = 10 } = this.config.uaRotation;

    switch (type) {
      case 'sequential':
        const sequentialUA = this.uaPool[this.currentUAIndex];
        this.currentUAIndex = (this.currentUAIndex + 1) % this.uaPool.length;
        return sequentialUA;

      case 'random':
        return this.uaPool[Math.floor(Math.random() * this.uaPool.length)];

      case 'round-robin':
        const roundRobinUA = this.uaPool[this.currentUAIndex];
        this.currentUAIndex = (this.currentUAIndex + 1) % this.uaPool.length;
        return roundRobinUA;

      case 'least-used':
        // Find UA with least usage
        let leastUsedUA = this.uaPool[0];
        let minUsage = this.uaUsageCount.get(leastUsedUA) || 0;

        for (const ua of this.uaPool) {
          const usage = this.uaUsageCount.get(ua) || 0;
          if (usage < minUsage && usage < maxUsagePerUA) {
            leastUsedUA = ua;
            minUsage = usage;
          }
        }

        return leastUsedUA;

      case 'weighted':
        // Implement weighted selection based on browser market share
        const weights = this.uaPool.map(ua => {
          const usage = this.uaUsageCount.get(ua) || 0;
          return Math.max(1, maxUsagePerUA - usage); // Higher weight for less used UAs
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < this.uaPool.length; i++) {
          random -= weights[i];
          if (random <= 0) {
            return this.uaPool[i];
          }
        }

        return this.uaPool[0]; // Fallback

      default:
        return this.uaPool[Math.floor(Math.random() * this.uaPool.length)];
    }
  }

  /**
   * Find available node for session
   */
  private findAvailableNode(capabilities: SeleniumCapabilities): SeleniumGridNode | null {
    const availableNodes = Array.from(this.nodes.values()).filter(node => 
      node.status === 'online' && 
      node.currentSessions < node.maxSessions &&
      this.isNodeCompatible(node, capabilities)
    );

    if (availableNodes.length === 0) {
      return null;
    }

    // Return node with least current sessions
    return availableNodes.reduce((least, current) => 
      current.currentSessions < least.currentSessions ? current : least
    );
  }

  /**
   * Check if node is compatible with requested capabilities
   */
  private isNodeCompatible(node: SeleniumGridNode, capabilities: SeleniumCapabilities): boolean {
    // Check browser compatibility
    const requestedBrowser = capabilities.browserName.toLowerCase();
    const nodeBrowser = node.browser.toLowerCase();

    if (requestedBrowser !== nodeBrowser) {
      return false;
    }

    // Check platform compatibility
    const requestedPlatform = capabilities.platformName.toLowerCase();
    const nodePlatform = node.platform.toLowerCase();

    if (requestedPlatform !== 'any' && requestedPlatform !== nodePlatform) {
      return false;
    }

    return true;
  }

  /**
   * Create enhanced Selenium capabilities with UA rotation
   */
  createCapabilities(
    browser: Browser,
    platform: Platform,
    deviceType: DeviceType = DeviceType.Desktop,
    customOptions: Partial<SeleniumCapabilities> = {}
  ): SeleniumCapabilities {
    const userAgent = this.getNextUA();
    const uaComponents = generateModularUA({ browser, platform, deviceType });
    
    // Update usage count
    const currentUsage = this.uaUsageCount.get(userAgent) || 0;
    this.uaUsageCount.set(userAgent, currentUsage + 1);

    let capabilities: SeleniumCapabilities = {
      browserName: browser.toLowerCase(),
      platformName: platform,
      'shadowua:userAgent': userAgent,
      'shadowua:fingerprint': this.config.stealth.enableFingerprinting,
      'shadowua:timing': this.config.stealth.enableTimingProtection,
      'shadowua:stealth': 'advanced',
      ...customOptions
    };

    // Browser-specific options
    switch (browser) {
      case Browser.Chrome:
        const fingerprint = this.config.stealth.enableFingerprinting 
          ? generateBrowserFingerprint(uaComponents) 
          : null;

        capabilities['goog:chromeOptions'] = {
          args: [
            `--user-agent=${userAgent}`,
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-blink-features=AutomationControlled',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            `--window-size=${fingerprint?.viewport.width || 1920},${fingerprint?.viewport.height || 1080}`,
            ...(customOptions['goog:chromeOptions']?.args || [])
          ],
          prefs: {
            'profile.default_content_setting_values.notifications': 2,
            'profile.default_content_settings.popups': 0,
            'profile.managed_default_content_settings.images': 2,
            ...(customOptions['goog:chromeOptions']?.prefs || {})
          },
          excludeSwitches: [
            'enable-automation',
            'enable-logging',
            ...(customOptions['goog:chromeOptions']?.excludeSwitches || [])
          ],
          useAutomationExtension: false
        };
        break;

      case Browser.Firefox:
        capabilities['moz:firefoxOptions'] = {
          args: [
            '--no-remote',
            '--new-instance',
            ...(customOptions['moz:firefoxOptions']?.args || [])
          ],
          prefs: {
            'general.useragent.override': userAgent,
            'dom.webdriver.enabled': false,
            'useAutomationExtension': false,
            'marionette.enabled': true,
            'dom.webnotifications.enabled': false,
            'media.volume_scale': '0.0',
            ...(customOptions['moz:firefoxOptions']?.prefs || {})
          }
        };
        break;

      case Browser.Edge:
        capabilities['ms:edgeOptions'] = {
          args: [
            `--user-agent=${userAgent}`,
            '--no-first-run',
            '--disable-blink-features=AutomationControlled',
            '--disable-extensions',
            ...(customOptions['ms:edgeOptions']?.args || [])
          ],
          prefs: {
            'profile.default_content_setting_values.notifications': 2,
            ...(customOptions['ms:edgeOptions']?.prefs || {})
          },
          excludeSwitches: ['enable-automation']
        };
        break;

      case Browser.Safari:
        capabilities['webkit:options'] = {
          args: [
            '--no-startup-window',
            ...(customOptions['webkit:options']?.args || [])
          ]
        };
        break;
    }

    return capabilities;
  }

  /**
   * Create new grid session
   */
  async createSession(capabilities: SeleniumCapabilities): Promise<GridSession> {
    const availableNode = this.findAvailableNode(capabilities);
    
    if (!availableNode) {
      throw new Error('No available nodes for the requested capabilities');
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userAgent = capabilities['shadowua:userAgent'] || this.getNextUA();
    
    // Parse browser/platform from capabilities
    const browser = capabilities.browserName as Browser;
    const platform = capabilities.platformName as Platform;
    const deviceType = DeviceType.Desktop; // Default for Selenium Grid

    const session: GridSession = {
      sessionId,
      nodeId: availableNode.id,
      userAgent,
      browser,
      platform,
      deviceType,
      capabilities,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    // Add stealth features if enabled
    if (this.config.stealth.enableFingerprinting) {
      const uaComponents = generateModularUA({ browser, platform, deviceType });
      session.fingerprint = generateBrowserFingerprint(uaComponents);
    }

    if (this.config.stealth.enableTimingProtection) {
      session.timingProtection = createTimingProtection(browser, platform);
    }

    // Update node session count
    availableNode.currentSessions++;
    this.nodes.set(availableNode.id, availableNode);

    // Store session
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): GridSession | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastUsed = Date.now();
      return session;
    }
    return null;
  }

  /**
   * Close session
   */
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Update node session count
    const node = this.nodes.get(session.nodeId);
    if (node) {
      node.currentSessions = Math.max(0, node.currentSessions - 1);
      this.nodes.set(node.id, node);
    }

    // Remove session
    this.sessions.delete(sessionId);
  }

  /**
   * Get grid status
   */
  getGridStatus(): {
    totalNodes: number;
    onlineNodes: number;
    totalSessions: number;
    availableSlots: number;
    uaPoolSize: number;
    uaRotationStats: Record<string, number>;
  } {
    const nodes = Array.from(this.nodes.values());
    const onlineNodes = nodes.filter(n => n.status === 'online');
    const totalSessions = nodes.reduce((sum, n) => sum + n.currentSessions, 0);
    const availableSlots = onlineNodes.reduce((sum, n) => sum + (n.maxSessions - n.currentSessions), 0);

    return {
      totalNodes: nodes.length,
      onlineNodes: onlineNodes.length,
      totalSessions,
      availableSlots,
      uaPoolSize: this.uaPool.length,
      uaRotationStats: Object.fromEntries(this.uaUsageCount)
    };
  }

  /**
   * Refresh UA pool
   */
  refreshUAPool(): void {
    this.generateUAPool();
    this.currentUAIndex = 0;
  }

  /**
   * Health check for nodes
   */
  async performHealthCheck(): Promise<void> {
    const healthCheckPromises = Array.from(this.nodes.values()).map(async (node) => {
      try {
        // Simple HTTP check to node URL with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${node.url}/status`, { 
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          node.status = 'online';
          node.lastHeartbeat = Date.now();
        } else {
          node.status = 'offline';
        }
      } catch (error) {
        node.status = 'offline';
      }

      this.nodes.set(node.id, node);
    });

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    const sessionTimeout = this.config.sessionManagement.sessionTimeout;

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastUsed > sessionTimeout) {
        this.closeSession(sessionId);
      }
    }
  }
}

/**
 * Create Selenium Grid manager instance
 */
export function createSeleniumGridManager(config: SeleniumGridConfig): SeleniumGridManager {
  return new SeleniumGridManager(config);
}

/**
 * Generate WebDriver script with UA rotation
 */
export function generateWebDriverScript(
  browser: Browser,
  platform: Platform,
  hubUrl: string,
  customCapabilities: Partial<SeleniumCapabilities> = {}
): string {
  return `
const { Builder, By, until } = require('selenium-webdriver');
const ShadowUA = require('shadow-ua');

// Create grid manager configuration
const gridConfig = {
  hubUrl: '${hubUrl}',
  nodes: [], // Will be populated by grid discovery
  uaRotation: {
    type: 'random',
    browsers: ['${browser}'],
    platforms: ['${platform}'],
    rotationInterval: 300000 // 5 minutes
  },
  sessionManagement: {
    maxConcurrentSessions: 10,
    sessionTimeout: 1800000, // 30 minutes
    retryAttempts: 3
  },
  stealth: {
    enableFingerprinting: true,
    enableTimingProtection: true,
    enableTLSFingerprinting: true
  }
};

const gridManager = ShadowUA.createSeleniumGridManager(gridConfig);

async function createStealthDriver() {
  // Create enhanced capabilities with UA rotation
  const capabilities = gridManager.createCapabilities(
    '${browser}',
    '${platform}',
    'desktop',
    ${JSON.stringify(customCapabilities, null, 2)}
  );
  
  console.log('Using User-Agent:', capabilities['shadowua:userAgent']);
  
  // Build driver with enhanced capabilities
  const driver = await new Builder()
    .usingServer('${hubUrl}')
    .withCapabilities(capabilities)
    .build();
  
  // Add stealth enhancements
  if (capabilities['shadowua:fingerprint']) {
    await driver.executeScript(\`
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      delete window.chrome.runtime.onConnect;
      delete window.chrome.runtime.onMessage;
    \`);
  }
  
  return driver;
}

async function humanLikeNavigation(driver, url) {
  // Add random delay before navigation
  const delay = Math.random() * 2000 + 1000; // 1-3 seconds
  await new Promise(resolve => setTimeout(resolve, delay));
  
  await driver.get(url);
  
  // Random mouse movements after page load
  await driver.executeScript(\`
    function randomMouseMovement() {
      const event = new MouseEvent('mousemove', {
        clientX: Math.random() * window.innerWidth,
        clientY: Math.random() * window.innerHeight
      });
      document.dispatchEvent(event);
    }
    
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        setTimeout(randomMouseMovement, i * 500);
      }
    }, 1000);
  \`);
}

// Usage example
async function example() {
  const driver = await createStealthDriver();
  
  try {
    await humanLikeNavigation(driver, 'https://example.com');
    
    // Your automation code here
    const title = await driver.getTitle();
    console.log('Page title:', title);
    
  } finally {
    await driver.quit();
  }
}

module.exports = {
  createStealthDriver,
  humanLikeNavigation,
  gridManager
};
`.trim();
}

/**
 * Generate Docker Compose for Selenium Grid with ShadowUA
 */
export function generateDockerCompose(
  browsers: Browser[] = [Browser.Chrome, Browser.Firefox],
  nodeCount: number = 2
): string {
  const services: string[] = [
    `  selenium-hub:
    image: selenium/hub:latest
    container_name: selenium-hub
    ports:
      - "4444:4444"
    environment:
      - GRID_MAX_SESSION=16
      - GRID_BROWSER_TIMEOUT=300
      - GRID_TIMEOUT=300
    volumes:
      - ./shadow-ua-config:/etc/selenium/shadow-ua`
  ];

  browsers.forEach((browser, browserIndex) => {
    for (let i = 0; i < nodeCount; i++) {
      const nodeId = `${browser.toLowerCase()}-node-${i + 1}`;
      const browserImage = browser === Browser.Chrome ? 'selenium/node-chrome:latest' :
                          browser === Browser.Firefox ? 'selenium/node-firefox:latest' :
                          browser === Browser.Edge ? 'selenium/node-edge:latest' :
                          'selenium/node-chrome:latest';

      services.push(`
  ${nodeId}:
    image: ${browserImage}
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - HUB_HOST=selenium-hub
      - HUB_PORT=4444
      - NODE_MAX_INSTANCES=2
      - NODE_MAX_SESSION=2
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
    volumes:
      - ./shadow-ua-scripts:/usr/local/shadow-ua
    command: >
      bash -c "
        # Install ShadowUA integration
        curl -o /usr/local/shadow-ua/integration.js https://raw.githubusercontent.com/shadowua/selenium-integration/main/integration.js
        
        # Start node with ShadowUA integration
        /opt/bin/entry_point.sh
      "`);
    }
  });

  return `version: '3.8'
services:
${services.join('\n')}

networks:
  default:
    name: selenium-grid

volumes:
  shadow-ua-config:
    driver: local
  shadow-ua-scripts:
    driver: local`;
}

export { SeleniumGridManager };