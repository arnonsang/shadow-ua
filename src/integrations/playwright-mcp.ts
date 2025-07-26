import { Browser, Platform, DeviceType } from '../types';
import { generateModularUA, UAComponents } from '../core/modular-generator';
import { generateBrowserFingerprint, generatePlaywrightConfig } from './browser-spoofing';
import { createTimingProtection } from '../core/timing-protection';
import { generateTLSConfig } from '../core/tls-fingerprinting';

export interface MCPPlaywrightConfig {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  locale: string;
  timezoneId: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  permissions?: string[];
  extraHTTPHeaders?: Record<string, string>;
  colorScheme?: 'light' | 'dark' | 'no-preference';
  reducedMotion?: 'reduce' | 'no-preference';
  fingerprint: {
    canvas: boolean;
    webrtc: boolean;
    webgl: boolean;
    fonts: boolean;
    audio: boolean;
  };
  stealth: {
    timingVariation: boolean;
    mouseJitter: boolean;
    keystrokeDelay: boolean;
    scrollBehavior: boolean;
  };
}

export interface MCPServer {
  name: string;
  version: string;
  capabilities: string[];
  tools: MCPTool[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface PlaywrightAutomationContext {
  browser: Browser;
  platform: Platform;
  deviceType: DeviceType;
  config: MCPPlaywrightConfig;
  timingProtection: any;
  fingerprint: any;
}

/**
 * Generate MCP server configuration for Playwright integration
 */
export function generateMCPServer(): MCPServer {
  return {
    name: 'shadow-ua-playwright',
    version: '1.0.0',
    capabilities: [
      'browser-automation',
      'fingerprint-spoofing',
      'timing-protection',
      'stealth-browsing',
      'multi-platform-support'
    ],
    tools: [
      {
        name: 'create_stealth_browser',
        description: 'Create a stealth Playwright browser instance with realistic fingerprinting',
        inputSchema: {
          type: 'object',
          properties: {
            browser: {
              type: 'string',
              enum: ['chrome', 'firefox', 'safari', 'edge'],
              description: 'Target browser to emulate'
            },
            platform: {
              type: 'string',
              enum: ['windows', 'macos', 'linux', 'android', 'ios'],
              description: 'Target platform to emulate'
            },
            deviceType: {
              type: 'string',
              enum: ['desktop', 'mobile', 'tablet'],
              description: 'Target device type'
            },
            stealthLevel: {
              type: 'string',
              enum: ['basic', 'advanced', 'maximum'],
              description: 'Level of stealth protection'
            },
            customConfig: {
              type: 'object',
              description: 'Custom configuration overrides'
            }
          },
          required: ['browser', 'platform']
        }
      },
      {
        name: 'navigate_with_stealth',
        description: 'Navigate to a URL with human-like timing and behavior',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to navigate to'
            },
            waitFor: {
              type: 'string',
              enum: ['load', 'domcontentloaded', 'networkidle'],
              description: 'Wait condition after navigation'
            },
            humanTiming: {
              type: 'boolean',
              description: 'Use human-like timing delays'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'interact_with_element',
        description: 'Interact with page elements using human-like behavior',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'CSS selector for the element'
            },
            action: {
              type: 'string',
              enum: ['click', 'type', 'hover', 'scroll'],
              description: 'Action to perform'
            },
            text: {
              type: 'string',
              description: 'Text to type (for type action)'
            },
            humanBehavior: {
              type: 'boolean',
              description: 'Use human-like mouse movements and timing'
            }
          },
          required: ['selector', 'action']
        }
      },
      {
        name: 'extract_data',
        description: 'Extract data from the page with stealth techniques',
        inputSchema: {
          type: 'object',
          properties: {
            selectors: {
              type: 'array',
              items: { type: 'string' },
              description: 'CSS selectors for data extraction'
            },
            waitForContent: {
              type: 'boolean',
              description: 'Wait for dynamic content to load'
            },
            respectRobots: {
              type: 'boolean',
              description: 'Check and respect robots.txt'
            }
          },
          required: ['selectors']
        }
      },
      {
        name: 'analyze_detection_risk',
        description: 'Analyze current fingerprint for detection risks',
        inputSchema: {
          type: 'object',
          properties: {
            checkCanvasFingerprint: {
              type: 'boolean',
              description: 'Check canvas fingerprint uniqueness'
            },
            checkTimingPatterns: {
              type: 'boolean',
              description: 'Analyze request timing patterns'
            },
            checkBehaviorPatterns: {
              type: 'boolean',
              description: 'Analyze mouse/keyboard behavior'
            }
          }
        }
      }
    ]
  };
}

/**
 * Create Playwright automation context with advanced stealth features
 */
export function createPlaywrightContext(
  browser: Browser,
  platform: Platform,
  deviceType: DeviceType = DeviceType.Desktop,
  stealthLevel: 'basic' | 'advanced' | 'maximum' = 'advanced'
): PlaywrightAutomationContext {
  // Generate UA components
  const uaComponents = generateModularUA({ browser, platform, deviceType });
  
  // Generate browser fingerprint
  const fingerprint = generateBrowserFingerprint(uaComponents);
  
  // Generate Playwright config
  const baseConfig = generatePlaywrightConfig(uaComponents);
  
  // Create timing protection
  const timingProtection = createTimingProtection(browser, platform, {
    distributionType: 'normal',
    burstProtection: true,
    adaptive: true
  });
  
  // Enhanced MCP config with stealth features
  const mcpConfig: MCPPlaywrightConfig = {
    ...baseConfig,
    fingerprint: {
      canvas: stealthLevel !== 'basic',
      webrtc: stealthLevel !== 'basic',
      webgl: stealthLevel === 'maximum',
      fonts: stealthLevel === 'maximum',
      audio: stealthLevel === 'maximum'
    },
    stealth: {
      timingVariation: true,
      mouseJitter: stealthLevel !== 'basic',
      keystrokeDelay: true,
      scrollBehavior: stealthLevel !== 'basic'
    }
  };
  
  return {
    browser,
    platform,
    deviceType,
    config: mcpConfig,
    timingProtection,
    fingerprint
  };
}

/**
 * Generate Playwright browser launch options with stealth configuration
 */
export function generatePlaywrightLaunchOptions(context: PlaywrightAutomationContext): {
  headless: boolean;
  args: string[];
  ignoreDefaultArgs: string[];
  env: Record<string, string>;
} {
  const { browser, platform, config } = context;
  
  const baseArgs = [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection'
  ];
  
  // Browser-specific arguments
  const browserArgs = {
    [Browser.Chrome]: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-extensions-except=/path/to/extension',
      '--disable-extensions',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--disable-features=VizDisplayCompositor'
    ],
    [Browser.Firefox]: [
      '--new-instance',
      '--no-remote',
      '--foreground',
      '--setDefaultBrowser'
    ],
    [Browser.Safari]: [],
    [Browser.Edge]: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox'
    ]
  };
  
  // Platform-specific arguments
  const platformArgs = {
    [Platform.Windows]: ['--high-dpi-support=1', '--force-device-scale-factor=1'],
    [Platform.macOS]: ['--enable-font-antialiasing', '--disable-lcd-text'],
    [Platform.Linux]: ['--enable-font-antialiasing', '--no-sandbox'],
    [Platform.Android]: ['--touch-events=enabled', '--enable-viewport-meta'],
    [Platform.iOS]: ['--touch-events=enabled', '--enable-viewport-meta']
  };
  
  const args = [
    ...baseArgs,
    ...browserArgs[browser],
    ...platformArgs[platform],
    `--user-agent="${config.userAgent}"`,
    `--window-size=${config.viewport.width},${config.viewport.height}`
  ];
  
  const ignoreDefaultArgs = [
    '--enable-automation',
    '--enable-blink-features=IdleDetection',
    '--export-tagged-pdf'
  ];
  
  const env = {
    TZ: config.timezoneId,
    LANG: config.locale.replace('-', '_') + '.UTF-8',
    LC_ALL: config.locale.replace('-', '_') + '.UTF-8'
  };
  
  return {
    headless: false, // For maximum stealth, run in headed mode
    args: args.filter(Boolean),
    ignoreDefaultArgs,
    env
  };
}

/**
 * Generate stealth page setup script for Playwright
 */
export function generateStealthPageScript(context: PlaywrightAutomationContext): string {
  const { config, fingerprint } = context;
  
  return `
// Playwright stealth setup script
async function setupStealthPage(page) {
  // Remove webdriver detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    
    // Remove automation indicators
    delete window.chrome.runtime.onConnect;
    delete window.chrome.runtime.onMessage;
    
    // Override plugin detection
    Object.defineProperty(navigator, 'plugins', {
      get: () => ${JSON.stringify(fingerprint.plugins)},
    });
    
    // Override language detection
    Object.defineProperty(navigator, 'languages', {
      get: () => ${JSON.stringify(fingerprint.navigator.languages)},
    });
  });
  
  ${config.fingerprint.canvas ? `
  // Canvas fingerprint protection
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
      const context = originalGetContext.call(this, contextType, ...args);
      
      if (contextType === '2d' && context) {
        const originalGetImageData = context.getImageData;
        context.getImageData = function(sx, sy, sw, sh) {
          const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
          
          // Add subtle noise
          for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * ${fingerprint.canvas.noiseLevel} * 255;
            imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + noise));
            imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + noise));
            imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + noise));
          }
          
          return imageData;
        };
      }
      
      return context;
    };
  });
  ` : ''}
  
  ${config.fingerprint.webrtc ? `
  // WebRTC IP masking
  await page.addInitScript(() => {
    const originalRTCPeerConnection = window.RTCPeerConnection;
    const fakeLocalIPs = ${JSON.stringify(fingerprint.webrtc.localIPs)};
    
    window.RTCPeerConnection = function(configuration, ...args) {
      const pc = new originalRTCPeerConnection(configuration, ...args);
      
      const originalCreateOffer = pc.createOffer;
      pc.createOffer = function(...args) {
        return originalCreateOffer.apply(this, args).then(offer => {
          if (offer.sdp) {
            let modifiedSdp = offer.sdp;
            fakeLocalIPs.forEach(fakeIP => {
              modifiedSdp = modifiedSdp.replace(
                /a=candidate:([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+typ\\s+host/g,
                \`a=candidate:$1 $2 $3 $4 \${fakeIP} $6 typ host\`
              );
            });
            return { ...offer, sdp: modifiedSdp };
          }
          return offer;
        });
      };
      
      return pc;
    };
  });
  ` : ''}
  
  // Human-like timing setup
  ${config.stealth.timingVariation ? `
  await page.addInitScript(() => {
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(callback, delay, ...args) {
      const jitter = (Math.random() - 0.5) * 20;
      const adjustedDelay = Math.max(0, delay + jitter);
      return originalSetTimeout.call(this, callback, adjustedDelay, ...args);
    };
  });
  ` : ''}
  
  // Set up stealth headers
  await page.setExtraHTTPHeaders({
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': '${config.locale},en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '${fingerprint.navigator.doNotTrack || '0'}',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    ...config.extraHTTPHeaders
  });
  
  // Set up geolocation if provided
  ${config.geolocation ? `
  await page.context().setGeolocation({
    latitude: ${config.geolocation.latitude},
    longitude: ${config.geolocation.longitude}
  });
  ` : ''}
  
  // Set up permissions
  if (${JSON.stringify(config.permissions)}.length > 0) {
    await page.context().grantPermissions(${JSON.stringify(config.permissions)});
  }
}

// Export setup function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupStealthPage };
} else if (typeof window !== 'undefined') {
  window.setupStealthPage = setupStealthPage;
}
`.trim();
}

/**
 * Generate human-like interaction helpers for Playwright
 */
export function generateHumanInteractionScript(context: PlaywrightAutomationContext): string {
  return `
// Human-like interaction helpers
class HumanInteraction {
  constructor(page, timingProtection) {
    this.page = page;
    this.timingProtection = timingProtection;
  }
  
  async humanClick(selector, options = {}) {
    const element = await this.page.locator(selector);
    
    // Wait for element to be visible
    await element.waitFor({ state: 'visible' });
    
    // Get element position for realistic mouse movement
    const box = await element.boundingBox();
    if (!box) throw new Error('Element not visible');
    
    // Calculate target position with slight randomization
    const targetX = box.x + box.width / 2 + (Math.random() - 0.5) * 10;
    const targetY = box.y + box.height / 2 + (Math.random() - 0.5) * 10;
    
    // Human-like mouse movement
    const currentMouse = await this.page.mouse.position();
    const steps = Math.max(3, Math.floor(Math.random() * 8) + 3);
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const x = currentMouse.x + (targetX - currentMouse.x) * progress;
      const y = currentMouse.y + (targetY - currentMouse.y) * progress;
      
      await this.page.mouse.move(x, y);
      await this.page.waitForTimeout(Math.random() * 50 + 10);
    }
    
    // Add slight pause before click
    const timing = this.timingProtection.generateTiming();
    await this.page.waitForTimeout(timing.delay + timing.jitter);
    
    // Perform click with realistic timing
    await this.page.mouse.down();
    await this.page.waitForTimeout(Math.random() * 100 + 50);
    await this.page.mouse.up();
  }
  
  async humanType(selector, text, options = {}) {
    const element = await this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    
    // Click to focus (if not already focused)
    await this.humanClick(selector);
    
    // Clear existing content
    await this.page.keyboard.press('Control+A');
    await this.page.waitForTimeout(50);
    
    // Type with human-like timing
    const keyTimings = this.timingProtection.generateKeystrokeTiming(text);
    
    for (let i = 0; i < text.length; i++) {
      await this.page.keyboard.type(text[i]);
      if (i < keyTimings.length) {
        await this.page.waitForTimeout(keyTimings[i]);
      }
    }
  }
  
  async humanScroll(direction = 'down', distance = 300) {
    const scrollSteps = Math.floor(distance / 50) + Math.floor(Math.random() * 3);
    const stepDistance = distance / scrollSteps;
    
    for (let i = 0; i < scrollSteps; i++) {
      const deltaY = direction === 'down' ? stepDistance : -stepDistance;
      await this.page.mouse.wheel(0, deltaY);
      
      // Variable timing between scroll steps
      const delay = Math.random() * 100 + 50;
      await this.page.waitForTimeout(delay);
    }
  }
  
  async humanHover(selector) {
    const element = await this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    
    const box = await element.boundingBox();
    if (!box) throw new Error('Element not visible');
    
    // Random point within element
    const targetX = box.x + Math.random() * box.width;
    const targetY = box.y + Math.random() * box.height;
    
    // Smooth movement to target
    await this.page.mouse.move(targetX, targetY, { steps: Math.floor(Math.random() * 5) + 3 });
    
    // Brief pause on hover
    await this.page.waitForTimeout(Math.random() * 200 + 100);
  }
  
  async randomMouseMovement() {
    const viewport = this.page.viewportSize();
    if (!viewport) return;
    
    const x = Math.random() * viewport.width;
    const y = Math.random() * viewport.height;
    
    await this.page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
  }
}

// Export class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HumanInteraction };
} else if (typeof window !== 'undefined') {
  window.HumanInteraction = HumanInteraction;
}
`.trim();
}

/**
 * Generate complete MCP tool implementation
 */
export function generateMCPToolImplementation(): string {
  return `
// Complete MCP tool implementation for Playwright
const { chromium, firefox, webkit } = require('playwright');
const ShadowUA = require('shadow-ua');

class ShadowUAPlaywrightMCP {
  constructor() {
    this.contexts = new Map();
    this.browsers = new Map();
  }
  
  async createStealthBrowser(args) {
    const { browser, platform, deviceType = 'desktop', stealthLevel = 'advanced', customConfig = {} } = args;
    
    // Create automation context
    const context = ShadowUA.createPlaywrightContext(
      browser, 
      platform, 
      deviceType, 
      stealthLevel
    );
    
    // Apply custom config overrides
    Object.assign(context.config, customConfig);
    
    // Get launch options
    const launchOptions = ShadowUA.generatePlaywrightLaunchOptions(context);
    
    // Launch browser based on type
    let playwrightBrowser;
    switch (browser.toLowerCase()) {
      case 'chrome':
      case 'edge':
        playwrightBrowser = await chromium.launch(launchOptions);
        break;
      case 'firefox':
        playwrightBrowser = await firefox.launch(launchOptions);
        break;
      case 'safari':
        playwrightBrowser = await webkit.launch(launchOptions);
        break;
      default:
        throw new Error(\`Unsupported browser: \${browser}\`);
    }
    
    // Create browser context with fingerprinting
    const browserContext = await playwrightBrowser.newContext({
      userAgent: context.config.userAgent,
      viewport: context.config.viewport,
      deviceScaleFactor: context.config.deviceScaleFactor,
      isMobile: context.config.isMobile,
      hasTouch: context.config.hasTouch,
      locale: context.config.locale,
      timezoneId: context.config.timezoneId,
      geolocation: context.config.geolocation,
      permissions: context.config.permissions,
      extraHTTPHeaders: context.config.extraHTTPHeaders,
      colorScheme: context.config.colorScheme,
      reducedMotion: context.config.reducedMotion
    });
    
    // Create page and set up stealth features
    const page = await browserContext.newPage();
    
    // Apply stealth scripts
    const stealthScript = ShadowUA.generateStealthPageScript(context);
    await page.addInitScript(stealthScript);
    
    const contextId = \`\${browser}-\${platform}-\${Date.now()}\`;
    this.contexts.set(contextId, {
      browser: playwrightBrowser,
      context: browserContext,
      page,
      shadowContext: context,
      humanInteraction: new (eval(ShadowUA.generateHumanInteractionScript(context))).HumanInteraction(
        page, 
        context.timingProtection
      )
    });
    
    return {
      contextId,
      userAgent: context.config.userAgent,
      viewport: context.config.viewport,
      fingerprint: {
        canvas: context.config.fingerprint.canvas,
        webrtc: context.config.fingerprint.webrtc,
        stealth: context.config.stealth
      }
    };
  }
  
  async navigateWithStealth(args) {
    const { contextId, url, waitFor = 'load', humanTiming = true } = args;
    const ctx = this.contexts.get(contextId);
    
    if (!ctx) {
      throw new Error('Browser context not found');
    }
    
    // Add pre-navigation timing delay if requested
    if (humanTiming) {
      const timing = ctx.shadowContext.timingProtection.generateTiming();
      await new Promise(resolve => setTimeout(resolve, timing.delay + timing.jitter));
    }
    
    // Navigate with stealth
    const response = await ctx.page.goto(url, { 
      waitUntil: waitFor,
      timeout: 30000 
    });
    
    // Random mouse movement after page load
    if (humanTiming) {
      setTimeout(() => {
        ctx.humanInteraction.randomMouseMovement().catch(() => {});
      }, Math.random() * 2000 + 1000);
    }
    
    return {
      status: response?.status(),
      url: ctx.page.url(),
      title: await ctx.page.title()
    };
  }
  
  async interactWithElement(args) {
    const { contextId, selector, action, text, humanBehavior = true } = args;
    const ctx = this.contexts.get(contextId);
    
    if (!ctx) {
      throw new Error('Browser context not found');
    }
    
    try {
      switch (action) {
        case 'click':
          if (humanBehavior) {
            await ctx.humanInteraction.humanClick(selector);
          } else {
            await ctx.page.click(selector);
          }
          break;
          
        case 'type':
          if (!text) throw new Error('Text required for type action');
          if (humanBehavior) {
            await ctx.humanInteraction.humanType(selector, text);
          } else {
            await ctx.page.fill(selector, text);
          }
          break;
          
        case 'hover':
          if (humanBehavior) {
            await ctx.humanInteraction.humanHover(selector);
          } else {
            await ctx.page.hover(selector);
          }
          break;
          
        case 'scroll':
          if (humanBehavior) {
            await ctx.humanInteraction.humanScroll();
          } else {
            await ctx.page.evaluate(() => window.scrollBy(0, 300));
          }
          break;
          
        default:
          throw new Error(\`Unsupported action: \${action}\`);
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
  
  async extractData(args) {
    const { contextId, selectors, waitForContent = true, respectRobots = true } = args;
    const ctx = this.contexts.get(contextId);
    
    if (!ctx) {
      throw new Error('Browser context not found');
    }
    
    // Check robots.txt if requested
    if (respectRobots) {
      const currentUrl = new URL(ctx.page.url());
      const robotsUrl = \`\${currentUrl.origin}/robots.txt\`;
      
      try {
        const robotsResponse = await ctx.page.request.get(robotsUrl);
        if (robotsResponse.ok()) {
          const robotsText = await robotsResponse.text();
          // Simple robots.txt parsing - in production, use a proper parser
          if (robotsText.includes('Disallow: /') && robotsText.includes('User-agent: *')) {
            console.warn('Robots.txt may disallow this request');
          }
        }
      } catch (error) {
        // Robots.txt not found or inaccessible - continue
      }
    }
    
    // Wait for content if requested
    if (waitForContent) {
      await ctx.page.waitForLoadState('networkidle');
    }
    
    // Extract data from selectors
    const results = {};
    
    for (const selector of selectors) {
      try {
        const elements = await ctx.page.locator(selector).all();
        const data = [];
        
        for (const element of elements) {
          const text = await element.textContent();
          const attributes = await element.evaluate(el => {
            const attrs = {};
            for (const attr of el.attributes) {
              attrs[attr.name] = attr.value;
            }
            return attrs;
          });
          
          data.push({
            text: text?.trim(),
            attributes
          });
        }
        
        results[selector] = data;
      } catch (error) {
        results[selector] = { error: error.message };
      }
    }
    
    return results;
  }
  
  async analyzeDetectionRisk(args) {
    const { contextId, checkCanvasFingerprint = true, checkTimingPatterns = true, checkBehaviorPatterns = true } = args;
    const ctx = this.contexts.get(contextId);
    
    if (!ctx) {
      throw new Error('Browser context not found');
    }
    
    const analysis = {
      overallRisk: 'low',
      details: {},
      recommendations: []
    };
    
    if (checkTimingPatterns) {
      const timingAnalysis = ctx.shadowContext.timingProtection.analyzeRequestPattern();
      analysis.details.timing = timingAnalysis;
      
      if (timingAnalysis.isRobotic) {
        analysis.overallRisk = 'high';
        analysis.recommendations.push(...timingAnalysis.suggestions);
      }
    }
    
    if (checkCanvasFingerprint) {
      // Test canvas fingerprint stability
      const canvasTest = await ctx.page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Canvas fingerprint test', 2, 2);
        return canvas.toDataURL();
      });
      
      analysis.details.canvas = {
        fingerprint: canvasTest.slice(-20), // Last 20 chars for comparison
        protected: ctx.shadowContext.config.fingerprint.canvas
      };
    }
    
    return analysis;
  }
  
  async cleanup(contextId) {
    const ctx = this.contexts.get(contextId);
    if (ctx) {
      await ctx.context.close();
      await ctx.browser.close();
      this.contexts.delete(contextId);
    }
  }
  
  async cleanupAll() {
    for (const [contextId] of this.contexts) {
      await this.cleanup(contextId);
    }
  }
}

module.exports = ShadowUAPlaywrightMCP;
`.trim();
}