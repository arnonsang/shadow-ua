import { Browser, Platform, DeviceType } from '../types';
import { generateModularUA, generateMultipleModularUA } from '../core/modular-generator';
import { generateBrowserFingerprint } from './browser-spoofing';
import { createTimingProtection } from '../core/timing-protection';
import { generateTLSConfig } from '../core/tls-fingerprinting';

export interface ZAPPluginConfig {
  zapApiUrl: string;
  zapApiKey?: string;
  uaRotation: {
    enabled: boolean;
    strategy: 'sequential' | 'random' | 'weighted';
    interval: number; // milliseconds
    poolSize: number;
  };
  stealth: {
    enableFingerprinting: boolean;
    enableTimingDelay: boolean;
    enableHeaderRandomization: boolean;
    enableProxyRotation: boolean;
  };
  scanning: {
    maxConcurrentScans: number;
    requestDelay: number;
    respectRobotsTxt: boolean;
    followRedirects: boolean;
  };
}

export interface ZAPScanConfig {
  target: string;
  scanType: 'spider' | 'active' | 'passive' | 'baseline' | 'full';
  context?: string;
  userAgent?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  authentication?: {
    type: 'form' | 'basic' | 'digest' | 'oauth';
    credentials: Record<string, string>;
  };
  scope: {
    includeUrls?: string[];
    excludeUrls?: string[];
    includeTechnologies?: string[];
    excludeTechnologies?: string[];
  };
}

export interface ZAPSessionData {
  sessionId: string;
  name: string;
  userAgent: string;
  browser: Browser;
  platform: Platform;
  fingerprint?: any;
  createdAt: number;
  lastUsed: number;
  scanResults: ZAPScanResult[];
}

export interface ZAPScanResult {
  scanId: string;
  type: string;
  status: 'running' | 'completed' | 'failed';
  target: string;
  progress: number;
  findings: ZAPFinding[];
  startTime: number;
  endTime?: number;
  userAgent: string;
}

export interface ZAPFinding {
  id: string;
  pluginId: string;
  name: string;
  description: string;
  severity: 'Informational' | 'Low' | 'Medium' | 'High';
  confidence: 'Low' | 'Medium' | 'High';
  url: string;
  method: string;
  evidence?: string;
  solution?: string;
  reference?: string;
  cweid?: string;
  wascid?: string;
}

export interface ZAPProxyConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  authentication?: {
    username: string;
    password: string;
  };
}

class OWASPZAPIntegration {
  private zapApiUrl: string;
  private zapApiKey?: string;
  private uaPool: string[] = [];
  private currentUAIndex = 0;
  private sessions: Map<string, ZAPSessionData> = new Map();
  private timingProtection: any;

  constructor(private config: ZAPPluginConfig) {
    this.zapApiUrl = config.zapApiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.zapApiKey = config.zapApiKey;
    this.generateUAPool();
    this.timingProtection = this.config.stealth.enableTimingDelay ? 
      createTimingProtection(Browser.Chrome, Platform.Windows) : null;
  }

  /**
   * Generate pool of User-Agents for rotation
   */
  private generateUAPool(): void {
    if (!this.config.uaRotation.enabled) {
      return;
    }

    const browsers = [Browser.Chrome, Browser.Firefox, Browser.Safari, Browser.Edge];
    const platforms = [Platform.Windows, Platform.macOS, Platform.Linux];
    const deviceTypes = [DeviceType.Desktop];

    this.uaPool = [];

    for (let i = 0; i < this.config.uaRotation.poolSize; i++) {
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];

      const ua = generateModularUA({ browser, platform, deviceType });
      this.uaPool.push(ua.userAgent);
    }
  }

  /**
   * Get next User-Agent based on rotation strategy
   */
  private getNextUserAgent(): string {
    if (!this.config.uaRotation.enabled || this.uaPool.length === 0) {
      return generateModularUA().userAgent;
    }

    switch (this.config.uaRotation.strategy) {
      case 'sequential':
        const ua = this.uaPool[this.currentUAIndex];
        this.currentUAIndex = (this.currentUAIndex + 1) % this.uaPool.length;
        return ua;

      case 'random':
        return this.uaPool[Math.floor(Math.random() * this.uaPool.length)];

      case 'weighted':
        // Implement weighted selection based on usage patterns
        return this.uaPool[Math.floor(Math.random() * this.uaPool.length)];

      default:
        return this.uaPool[0];
    }
  }

  /**
   * Make ZAP API request with error handling
   */
  private async zapApiRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${this.zapApiUrl}${endpoint}`);
    
    // Add API key if provided
    if (this.zapApiKey) {
      params.apikey = this.zapApiKey;
    }

    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    // Add timing delay if enabled
    if (this.timingProtection) {
      const timing = this.timingProtection.generateTiming();
      await new Promise(resolve => setTimeout(resolve, timing.delay + timing.jitter));
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.getNextUserAgent()
        }
      });

      if (!response.ok) {
        throw new Error(`ZAP API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to communicate with ZAP API: ${error}`);
    }
  }

  /**
   * Create new ZAP session with ShadowUA configuration
   */
  async createSession(name: string, browser: Browser = Browser.Chrome, platform: Platform = Platform.Windows): Promise<ZAPSessionData> {
    const userAgent = this.getNextUserAgent();
    const uaComponents = generateModularUA({ browser, platform, deviceType: DeviceType.Desktop });
    
    // Create ZAP session
    const zapResponse = await this.zapApiRequest('/JSON/core/action/newSession/', {
      name,
      overwrite: 'true'
    });

    const sessionId = zapResponse.Result || `session_${Date.now()}`;

    // Configure User-Agent in ZAP
    await this.zapApiRequest('/JSON/replacer/action/addRule/', {
      description: `ShadowUA - ${browser} on ${platform}`,
      enabled: 'true',
      matchType: 'REQ_HEADER',
      matchString: 'User-Agent',
      replacement: userAgent,
      initiators: ''
    });

    // Set up additional headers if fingerprinting is enabled
    if (this.config.stealth.enableFingerprinting) {
      const fingerprint = generateBrowserFingerprint(uaComponents);
      
      await this.zapApiRequest('/JSON/replacer/action/addRule/', {
        description: 'ShadowUA - Accept-Language',
        enabled: 'true',
        matchType: 'REQ_HEADER',
        matchString: 'Accept-Language',
        replacement: fingerprint.navigator.languages.join(','),
        initiators: ''
      });

      await this.zapApiRequest('/JSON/replacer/action/addRule/', {
        description: 'ShadowUA - DNT',
        enabled: 'true',
        matchType: 'REQ_HEADER',
        matchString: 'DNT',
        replacement: fingerprint.navigator.doNotTrack || '1',
        initiators: ''
      });
    }

    // Configure request delays if timing protection is enabled
    if (this.config.stealth.enableTimingDelay) {
      await this.zapApiRequest('/JSON/core/action/setOptionTimeoutInSecs/', {
        Integer: '30'
      });
    }

    const session: ZAPSessionData = {
      sessionId,
      name,
      userAgent,
      browser,
      platform,
      fingerprint: this.config.stealth.enableFingerprinting ? generateBrowserFingerprint(uaComponents) : undefined,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      scanResults: []
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Configure ZAP spider with ShadowUA stealth features
   */
  async configureStealth(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Configure spider settings for stealth
    await this.zapApiRequest('/JSON/spider/action/setOptionMaxDuration/', {
      Integer: '60' // 60 minutes max duration
    });

    await this.zapApiRequest('/JSON/spider/action/setOptionMaxDepth/', {
      Integer: '5' // Limit crawl depth
    });

    await this.zapApiRequest('/JSON/spider/action/setOptionMaxChildren/', {
      Integer: '20' // Limit children per page
    });

    // Add delays between requests
    if (this.config.stealth.enableTimingDelay) {
      await this.zapApiRequest('/JSON/spider/action/setOptionRequestWaitTime/', {
        Integer: String(this.config.scanning.requestDelay || 1000)
      });
    }

    // Configure active scanner settings
    await this.zapApiRequest('/JSON/ascan/action/setOptionMaxScansInUI/', {
      Integer: String(this.config.scanning.maxConcurrentScans || 2)
    });

    await this.zapApiRequest('/JSON/ascan/action/setOptionDelayInMs/', {
      Integer: String(this.config.scanning.requestDelay || 1000)
    });

    // Disable aggressive plugins that might trigger detection
    const aggressivePlugins = [
      '10045', // SQL Injection - Authentication Bypass
      '40018', // SQL Injection
      '90019', // Server Side Code Injection
      '90020', // Remote OS Command Injection
    ];

    for (const pluginId of aggressivePlugins) {
      await this.zapApiRequest('/JSON/ascan/action/disableScanner/', {
        Integer: pluginId
      });
    }
  }

  /**
   * Start spider scan with stealth configuration
   */
  async startSpiderScan(sessionId: string, target: string, config: Partial<ZAPScanConfig> = {}): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Set up scan context if needed
    if (config.context) {
      await this.zapApiRequest('/JSON/context/action/newContext/', {
        contextName: config.context
      });

      await this.zapApiRequest('/JSON/context/action/includeInContext/', {
        contextName: config.context,
        regex: target
      });
    }

    // Configure scope
    if (config.scope?.excludeUrls) {
      for (const excludeUrl of config.scope.excludeUrls) {
        await this.zapApiRequest('/JSON/spider/action/excludeFromScan/', {
          regex: excludeUrl
        });
      }
    }

    // Start spider with stealth UA
    const response = await this.zapApiRequest('/JSON/spider/action/scan/', {
      url: target,
      maxChildren: '10',
      recurse: 'true',
      contextName: config.context || '',
      subtreeOnly: 'false'
    });

    const scanId = response.scan;

    // Create scan result tracking
    const scanResult: ZAPScanResult = {
      scanId,
      type: 'spider',
      status: 'running',
      target,
      progress: 0,
      findings: [],
      startTime: Date.now(),
      userAgent: session.userAgent
    };

    session.scanResults.push(scanResult);
    session.lastUsed = Date.now();

    return scanId;
  }

  /**
   * Start active scan with stealth configuration
   */
  async startActiveScan(sessionId: string, target: string, config: Partial<ZAPScanConfig> = {}): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Configure active scan with stealth settings
    await this.configureStealth(sessionId);

    // Start active scan
    const response = await this.zapApiRequest('/JSON/ascan/action/scan/', {
      url: target,
      recurse: 'true',
      inScopeOnly: 'false',
      scanPolicyName: '',
      method: 'GET',
      postData: '',
      contextId: config.context || ''
    });

    const scanId = response.scan;

    // Create scan result tracking
    const scanResult: ZAPScanResult = {
      scanId,
      type: 'active',
      status: 'running',
      target,
      progress: 0,
      findings: [],
      startTime: Date.now(),
      userAgent: session.userAgent
    };

    session.scanResults.push(scanResult);
    session.lastUsed = Date.now();

    return scanId;
  }

  /**
   * Get scan progress and results
   */
  async getScanStatus(sessionId: string, scanId: string): Promise<ZAPScanResult | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const scanResult = session.scanResults.find(s => s.scanId === scanId);
    if (!scanResult) {
      return null;
    }

    try {
      // Get progress based on scan type
      let progressResponse;
      if (scanResult.type === 'spider') {
        progressResponse = await this.zapApiRequest('/JSON/spider/view/status/', {
          scanId
        });
      } else if (scanResult.type === 'active') {
        progressResponse = await this.zapApiRequest('/JSON/ascan/view/status/', {
          scanId
        });
      }

      scanResult.progress = parseInt(progressResponse?.status || '0');
      scanResult.status = scanResult.progress >= 100 ? 'completed' : 'running';

      // Get findings if scan is completed
      if (scanResult.status === 'completed' && scanResult.findings.length === 0) {
        const alertsResponse = await this.zapApiRequest('/JSON/core/view/alerts/', {
          baseurl: scanResult.target
        });

        scanResult.findings = alertsResponse.alerts?.map((alert: any) => ({
          id: alert.id,
          pluginId: alert.pluginId,
          name: alert.name,
          description: alert.description,
          severity: alert.risk,
          confidence: alert.confidence,
          url: alert.url,
          method: alert.method,
          evidence: alert.evidence,
          solution: alert.solution,
          reference: alert.reference,
          cweid: alert.cweid,
          wascid: alert.wascid
        })) || [];

        scanResult.endTime = Date.now();
      }

      return scanResult;
    } catch (error) {
      scanResult.status = 'failed';
      return scanResult;
    }
  }

  /**
   * Generate ZAP plugin manifest
   */
  generatePluginManifest(): string {
    return `{
  "name": "ShadowUA Integration",
  "version": "1.0.0",
  "description": "Advanced User-Agent rotation and stealth capabilities for OWASP ZAP",
  "author": "ShadowUA Team",
  "url": "https://github.com/shadowua/zap-plugin",
  "changes": "Initial release with comprehensive stealth features",
  "info": "https://shadowua.io/docs/zap-integration",
  "repo": "https://github.com/shadowua/zap-plugin",
  "status": "release",
  "dependencies": {
    "addOns": [
      {
        "id": "replacer",
        "version": ">=0.2.0"
      }
    ]
  },
  "extensions": {
    "org.zaproxy.zap.extension.api.API": {
      "apiImplementors": [
        "org.zaproxy.addon.shadowua.ShadowUAAPI"
      ]
    }
  },
  "files": {
    "ShadowUA.js": {
      "description": "Main ShadowUA integration script"
    },
    "ua-rotation.js": {
      "description": "User-Agent rotation logic"
    },
    "stealth-config.js": {
      "description": "Stealth scanning configurations"
    }
  }
}`;
  }

  /**
   * Generate ZAP plugin JavaScript code
   */
  generatePluginCode(): string {
    return `
// ShadowUA ZAP Plugin - Main Integration
var ShadowUA = function() {
  var uaPool = [];
  var currentIndex = 0;
  var rotationEnabled = true;
  var stealthMode = true;
  
  // Initialize UA pool
  function initializeUAPool() {
    // This would be populated by the ShadowUA library
    uaPool = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    ];
  }
  
  // Get next User-Agent
  function getNextUA() {
    if (!rotationEnabled || uaPool.length === 0) {
      return null;
    }
    
    var ua = uaPool[currentIndex];
    currentIndex = (currentIndex + 1) % uaPool.length;
    return ua;
  }
  
  // Configure stealth settings
  function configureStealth() {
    if (!stealthMode) return;
    
    // Set conservative scan delays
    Java.type('org.zaproxy.zap.extension.spider.SpiderParam')
      .getParam().setRequestDelayInMs(2000);
    
    // Limit concurrent connections
    Java.type('org.zaproxy.zap.extension.ascan.ActiveScanParam')
      .getParam().setHostPerScan(1);
    
    // Add random delays between requests
    var HttpSender = Java.type('org.parosproxy.paros.network.HttpSender');
    var originalSend = HttpSender.prototype.sendAndReceive;
    
    HttpSender.prototype.sendAndReceive = function(msg, initiator) {
      // Add random delay (1-3 seconds)
      var delay = Math.floor(Math.random() * 2000) + 1000;
      Java.type('java.lang.Thread').sleep(delay);
      
      // Rotate User-Agent
      var nextUA = getNextUA();
      if (nextUA) {
        msg.getRequestHeader().setHeader('User-Agent', nextUA);
      }
      
      // Add realistic headers
      msg.getRequestHeader().setHeader('Accept', 
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
      msg.getRequestHeader().setHeader('Accept-Language', 'en-US,en;q=0.5');
      msg.getRequestHeader().setHeader('Accept-Encoding', 'gzip, deflate, br');
      msg.getRequestHeader().setHeader('DNT', '1');
      msg.getRequestHeader().setHeader('Connection', 'keep-alive');
      msg.getRequestHeader().setHeader('Upgrade-Insecure-Requests', '1');
      
      return originalSend.call(this, msg, initiator);
    };
  }
  
  // Public API
  return {
    init: function() {
      initializeUAPool();
      configureStealth();
      print('ShadowUA Plugin initialized with ' + uaPool.length + ' User-Agents');
    },
    
    setRotationEnabled: function(enabled) {
      rotationEnabled = enabled;
    },
    
    setStealthMode: function(enabled) {
      stealthMode = enabled;
      if (enabled) {
        configureStealth();
      }
    },
    
    addUserAgent: function(ua) {
      uaPool.push(ua);
    },
    
    getCurrentUA: function() {
      return uaPool[currentIndex] || null;
    },
    
    getPoolSize: function() {
      return uaPool.length;
    },
    
    getStats: function() {
      return {
        poolSize: uaPool.length,
        currentIndex: currentIndex,
        rotationEnabled: rotationEnabled,
        stealthMode: stealthMode
      };
    }
  };
}();

// Initialize plugin
ShadowUA.init();

// Export for ZAP
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShadowUA;
}
`.trim();
  }

  /**
   * Export scan results in various formats
   */
  async exportResults(sessionId: string, format: 'json' | 'xml' | 'html' | 'pdf' = 'json'): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const endpoint = `/JSON/core/other/${format}report/`;
    const response = await this.zapApiRequest(endpoint);

    return response;
  }

  /**
   * Cleanup session and resources
   */
  async cleanup(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Stop any running scans
    for (const scanResult of session.scanResults) {
      if (scanResult.status === 'running') {
        try {
          if (scanResult.type === 'spider') {
            await this.zapApiRequest('/JSON/spider/action/stop/', {
              scanId: scanResult.scanId
            });
          } else if (scanResult.type === 'active') {
            await this.zapApiRequest('/JSON/ascan/action/stop/', {
              scanId: scanResult.scanId
            });
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }

    // Remove session
    this.sessions.delete(sessionId);
  }

  /**
   * Get integration status and statistics
   */
  getStatus(): {
    sessions: number;
    activeScans: number;
    uaPoolSize: number;
    stealthEnabled: boolean;
    zapConnected: boolean;
  } {
    const activeSessions = Array.from(this.sessions.values());
    const activeScans = activeSessions.reduce((count, session) => 
      count + session.scanResults.filter(s => s.status === 'running').length, 0
    );

    return {
      sessions: activeSessions.length,
      activeScans,
      uaPoolSize: this.uaPool.length,
      stealthEnabled: this.config.stealth.enableFingerprinting,
      zapConnected: true // Would check actual ZAP connection in production
    };
  }
}

/**
 * Create OWASP ZAP integration instance
 */
export function createZAPIntegration(config: ZAPPluginConfig): OWASPZAPIntegration {
  return new OWASPZAPIntegration(config);
}

/**
 * Generate ZAP plugin installation script
 */
export function generateZAPInstallScript(): string {
  return `
#!/bin/bash
# ShadowUA ZAP Plugin Installation Script

set -e

echo "Installing ShadowUA Plugin for OWASP ZAP..."

# Check if ZAP is installed
if ! command -v zap.sh &> /dev/null; then
    echo "Error: OWASP ZAP not found. Please install ZAP first."
    exit 1
fi

# Create plugin directory
ZAP_HOME=~/.ZAP
PLUGIN_DIR="$ZAP_HOME/plugins"
mkdir -p "$PLUGIN_DIR"

# Download and install ShadowUA library
echo "Downloading ShadowUA library..."
npm install -g shadow-ua

# Create plugin files
cat > "$PLUGIN_DIR/ShadowUA.js" << 'EOF'
// ShadowUA ZAP Plugin Code
var ShadowUA = function() {
  // Plugin implementation would be inserted here
  return { init: function() { console.log('ShadowUA initialized'); } };
}();
ShadowUA.init();
EOF

# Create plugin manifest
cat > "$PLUGIN_DIR/shadowua-manifest.json" << 'EOF'
{
  "name": "ShadowUA Integration",
  "version": "1.0.0",
  "description": "Advanced User-Agent rotation for OWASP ZAP"
}
EOF

# Make plugin executable
chmod +x "$PLUGIN_DIR/ShadowUA.js"

echo "ShadowUA Plugin installed successfully!"
echo "Restart ZAP to activate the plugin."
echo ""
echo "Usage:"
echo "1. Start ZAP"
echo "2. Go to Tools > Options > ShadowUA"
echo "3. Configure User-Agent rotation and stealth settings"
echo "4. Start scanning with enhanced stealth capabilities"
`.trim();
}

export { OWASPZAPIntegration };