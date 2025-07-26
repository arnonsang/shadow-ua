# 🕵️ ShadowUA

[![npm version](https://img.shields.io/npm/v/shadow-ua)](https://www.npmjs.com/package/shadow-ua)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/arnonsang/shadow-ua/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![GitHub issues](https://img.shields.io/github/issues/arnonsang/shadow-ua)](https://github.com/arnonsang/shadow-ua/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/arnonsang/shadow-ua)](https://github.com/arnonsang/shadow-ua/pulls)
[![npm downloads](https://img.shields.io/npm/dm/shadow-ua)](https://www.npmjs.com/package/shadow-ua)
[![GitHub stars](https://img.shields.io/github/stars/arnonsang/shadow-ua?style=social)](https://github.com/arnonsang/shadow-ua/stargazers)

**A toolkit for generating realistic User-Agent strings with anti-detection features for defensive security testing, browser automation, and load testing.**

ShadowUA combines modern component-based User-Agent generation with sophisticated anti-detection capabilities including canvas fingerprint randomization, WebRTC IP masking, timing attack prevention, and intelligent request distribution patterns.

---

## ✨ **Key Features**

### 🎯 **Smart Generation**
- **Modular Components**: Mix & match OS, browser, engine, and device components
- **Weighted Randomness**: Based on real market share data with regional distributions
- **Realistic Combinations**: Ensures generated UAs match real-world patterns
- **Geolocation Aware**: Generate UAs based on regional browser preferences

### 🛡️ **Anti-Detection Suite**
- **Canvas Fingerprint Randomization**: Browser-specific noise injection patterns
- **WebRTC IP Masking**: Realistic local/public IP generation and SDP manipulation
- **Timing Attack Prevention**: Human-like request timing with statistical distributions
- **TLS Fingerprint Spoofing**: Real browser TLS handshake patterns
- **Intelligent Request Distribution**: 6 distribution strategies for rate limiting bypass

### 🔧 **Advanced Integrations**
- **Playwright MCP (Experimental)**: AI-powered browser automation with stealth capabilities
- **Selenium Grid**: Distributed testing with intelligent UA rotation
- **OWASP ZAP**: Native security scanner integration with timing protection
- **Async/Parallel Generation**: High-performance concurrent processing with caching
- **Streaming API**: Real-time UA rotation with Server-Sent Events

### 🖥️ **CLI & Library**
- **Interactive Wizard**: Step-by-step UA generation with 5 specialized modes
- **Fast CLI**: `shua` command with intuitive flags and aliases
- **Type-Safe API**: Full TypeScript support with comprehensive types
- **Multiple Formats**: Export to TXT, JSON, CSV, cURL, Burp Suite, k6, JMeter, Locust

---


## 🚀 **Quick Start**

### Installation

```bash
# Install globally for CLI usage
npm install -g shadow-ua

# Or install locally for library usage
npm install shadow-ua
```

### CLI Usage

```bash
# Interactive wizard mode
shua interactive  # or 'wizard', 'i'

# Generate a random User-Agent
shua generate --random

# Generate 5 Chrome UAs for Windows with stealth features
shua g -c 5 -b Chrome -p Windows --weighted

# Export 10 UAs for k6 load testing
shua export --format k6 --count 10 --save load-test.js

# Use custom UA pool
shua custom --load my-uas.txt --count 3

# Start REST API server with streaming support
shua serve --port 3000 --cors
```

### Library Usage

```typescript
import { 
  generateModularUA, 
  createGeoDistributionManager,
  generateBrowserFingerprint,
  Browser, 
  Platform 
} from 'shadow-ua';

// Basic generation with anti-detection
const ua = generateModularUA({
  browser: Browser.Chrome,
  platform: Platform.Windows,
  deviceType: DeviceType.Desktop
});

// Generate fingerprint with canvas randomization
const fingerprint = generateBrowserFingerprint(ua);

// Geolocation-based generation
const geoManager = createGeoDistributionManager();
const geoUA = geoManager.generateGeoUA({
  location: { countryCode: 'US', city: 'New York' }
});

console.log(ua.userAgent);
console.log(fingerprint.canvasFingerprint);
console.log(geoUA.headers['Accept-Language']);
```

---

## 📋 **CLI Commands**

| Command | Aliases | Description |
|---------|---------|-------------|
| `generate` | `gen`, `g` | Generate User-Agent strings with flexible filtering |
| `export` | `exp`, `e` | Export User-Agents in tool-specific formats |
| `custom` | `cust`, `c` | Load and use custom User-Agent pools from files |
| `serve` | `api`, `server` | Start REST API server with streaming support |
| `interactive` | `wizard`, `i` | Interactive User-Agent generation wizard |

### **Interactive Wizard**

The interactive wizard guides you through step-by-step User-Agent generation with 5 specialized modes:

```bash
shua wizard  # Start the wizard

# Available modes:
# 1. Basic - Simple UA generation
# 2. Advanced - Custom filters and market share weighting
# 3. Geolocation - Region-specific UAs with geo headers
# 4. Stealth - Anti-detection features enabled
# 5. Bulk - High-volume generation with concurrency control
```

### **Generate Command**

```bash
# Basic usage
shua gen [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `-r` | `--random` |  Generate a random User-Agent |
| `-c` | `--count <number>`  | Number of UAs to generate (default: 1) |
| `-n` | `--number <number>`  | Alias for --count |
| `-b` | `--browser <browser>`  | Filter by browser (Chrome, Firefox, Safari, Edge) |
| `-p` | `--platform <platform>`  | Filter by platform (Windows, macOS, Linux, Android, iOS) |
| `--os` | `--operating-system <os>`  | Alias for --platform |
| `-d` | `--device <device>`  | Filter by device type (desktop, mobile, tablet) |
| `-t` | `--type <type>`  | Alias for --device |
| `-w` | `--weighted`  | Use weighted random generation based on market share |
| `-f` | `--format <format>`  | Output format (txt, json, csv, curl) |
| `-o` | `--output <file>`  | Output file path |
| `-s` | `--save <file>`  | Alias for --output |

**Examples:**
```bash
# Generate 3 random UAs with market share weighting
shua gen -c 3 --weighted

# Chrome on Android mobile devices with geolocation context
shua g -b Chrome -p Android -t mobile -n 5

# Export to JSON file with stealth features
shua generate --browser Firefox --platform macOS --format json --save firefox-uas.json
```

### **Export Command**

Export User-Agents in various tool-specific formats including new stealth-enabled options.

```bash
# Basic usage
shua export [options]
shua exp [options]    # Short alias
shua e [options]      # Shortest alias

# Available formats: burp, k6, jmeter, locust
shua export --format k6 --count 20 --save load-test.js
shua e -f burp -c 50 -b Chrome -s burp-uas-stealth.txt
```

### **Serve Command (REST API + Streaming)**

Start a REST API server with new streaming capabilities and enhanced security.

```bash
# Basic usage
shua serve [options]
shua api [options]     # Short alias
shua server [options]  # Long alias

# Start server with streaming and enhanced features
shua serve --port 3000 --cors --rate-limit 1000
```

#### Enhanced API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /ua` | GET | Generate single User-Agent with anti-detection |
| `GET /uas?count=N` | GET | Generate multiple User-Agents |
| `POST /ua/export` | POST | Export UAs in various formats |
| `GET /ua/geo?region=us` | GET | Generate geo-localized User-Agents |
| `GET /stream/uas` | GET | Server-Sent Events stream for real-time UAs |
| `POST /ua/stealth` | POST | Generate UAs with full stealth features |
| `GET /stats` | GET | API usage statistics |
| `GET /components` | GET | Available components info |
| `GET /health` | GET | Health check endpoint |

**New Streaming Example:**
```bash
# Connect to UA streaming endpoint
curl -N http://localhost:3000/stream/uas

# Generate stealth UAs with full anti-detection
curl -X POST http://localhost:3000/ua/stealth \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "enableFingerprinting": true, "enableTiming": true}'
```

---

## 📚 **Advanced Library API**

### **Anti-Detection Features**

```typescript
import { 
  generateBrowserFingerprint,
  createTimingProtection,
  generateTLSFingerprint,
  createRequestDistribution
} from 'shadow-ua';

// Canvas fingerprint randomization
const ua = generateModularUA({ browser: Browser.Chrome });
const fingerprint = generateBrowserFingerprint(ua);

console.log(fingerprint.canvasFingerprint);
console.log(fingerprint.webRTCConfig);
console.log(fingerprint.screenResolution);

// Timing attack prevention
const timingProtection = createTimingProtection(Browser.Chrome, Platform.Windows, {
  distributionType: 'normal',
  burstProtection: true,
  adaptive: true
});

const delay = await timingProtection.generateDelay();
const script = timingProtection.generateTimingScript();

// TLS fingerprint spoofing
const tlsFingerprint = generateTLSFingerprint(Browser.Chrome, Platform.Windows);
const httpsConfig = generateHTTPSAgentConfig(tlsFingerprint);

// Intelligent request distribution
const distributor = createRequestDistribution({
  strategy: 'adaptive',
  maxRequestsPerUA: 10,
  cooldownPeriod: 300000,
  stealthSettings: {
    enableRandomDelay: true,
    minDelay: 1000,
    maxDelay: 3000,
    jitterFactor: 0.2
  }
});

const result = await distributor.getNextNode();
console.log(result.node.userAgent);
console.log(`Recommended delay: ${result.recommendedDelay}ms`);
```

### **Geolocation-Based Generation**

```typescript
import { 
  createGeoDistributionManager,
  generateGeoUA
} from 'shadow-ua';

// Create geo-distribution manager
const geoManager = createGeoDistributionManager();

// Generate region-specific UAs
const results = geoManager.generateGeoDistributedUAs(5, {
  regions: ['north-america', 'europe'],
  accuracy: 'city',
  localization: {
    enableRegionalHeaders: true,
    enableCurrencyHeaders: true,
    enableTimezoneHeaders: true
  }
});

results.forEach(result => {
  console.log(`UA: ${result.userAgent}`);
  console.log(`Location: ${result.geoData.city}, ${result.geoData.country}`);
  console.log(`Headers:`, result.headers);
});

// Quick geo UA generation
const geoUA = generateGeoUA('tokyo', {
  localization: { enableRegionalHeaders: true }
});
```

### **Async/Parallel Generation**

```typescript
import { 
  createAsyncGenerator,
  generateParallel
} from 'shadow-ua';

// High-performance async generation
const asyncGen = createAsyncGenerator({
  concurrency: 10,
  batchSize: 100,
  rateLimit: {
    maxPerSecond: 50,
    burstSize: 100
  },
  caching: {
    enabled: true,
    maxSize: 1000,
    ttl: 300000
  }
});

// Generate large batches efficiently
const batch = await asyncGen.generateBatch(1000);
console.log(`Generated ${batch.results.length} UAs in ${batch.generationTime}ms`);

// Parallel generation with different strategies
const parallelResults = await generateParallel([
  { count: 100, browser: Browser.Chrome },
  { count: 100, browser: Browser.Firefox },
  { count: 100, browser: Browser.Safari }
]);
```

### **Streaming API Integration**

```typescript
import { 
  createStreamingManager,
  generateClientScript
} from 'shadow-ua';

// Create streaming manager
const streamManager = createStreamingManager({
  rotationInterval: 30000,
  maxConnections: 100,
  enableAuthentication: true,
  rateLimiting: {
    windowMs: 60000,
    maxRequests: 1000
  }
});

// Start streaming server
streamManager.startServer(3001);

// Generate client-side code
const clientScript = generateClientScript({
  serverUrl: 'http://localhost:3001',
  enableReconnection: true,
  rotationCallback: (newUA) => {
    console.log('New UA received:', newUA);
  }
});
```

### **Tool Integrations**

```typescript
import { 
  generateMCPServer,
  createSeleniumGridManager,
  createZAPIntegration
} from 'shadow-ua';

// Playwright MCP integration for AI automation (Experimental)
const mcpServer = generateMCPServer({
  name: 'ShadowUA-Playwright',
  version: '1.0.0',
  stealthMode: true,
  tools: ['stealth_navigate', 'rotate_ua', 'bypass_detection']
});

// Selenium Grid with UA rotation
const gridManager = createSeleniumGridManager({
  hubUrl: 'http://selenium-hub:4444',
  rotationStrategy: 'adaptive',
  nodeHealthCheck: true,
  sessionTimeout: 300000
});

// OWASP ZAP integration
const zapIntegration = createZAPIntegration({
  zapUrl: 'http://localhost:8080',
  enableStealth: true,
  rotationInterval: 60000,
  timingProtection: true
});
```

---

## 🎨 **Enhanced Output Formats**

### **Stealth-Enabled k6 Script**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

// Generated with anti-detection features
const userAgents = [
  {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
    fingerprint: { canvas: "...", webRTC: "..." },
    timing: { min: 1200, max: 3400, jitter: 0.15 }
  }
];

export default function () {
  const config = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  // Apply human-like timing
  const delay = config.timing.min + Math.random() * 
    (config.timing.max - config.timing.min);
  
  const params = {
    headers: { 
      'User-Agent': config.ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  };
  
  const response = http.get('https://httpbin.org/user-agent', params);
  check(response, { 'status is 200': (r) => r.status === 200 });
  
  sleep(delay / 1000); // Convert to seconds
}
```

### **Enhanced Burp Suite Integration**
```
# ShadowUA Enhanced Export for Burp Suite
# Generated with anti-detection features and timing data
# Usage: Load into Burp Suite Intruder with delays

Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36|1200-3400ms
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15|800-2100ms
```

---

## 🛡️ **Security & Anti-Detection**

### **Defensive Use**
ShadowUA is designed exclusively for **defensive security purposes**:
- ✅ Penetration testing with realistic browser behavior
- ✅ Load testing with anti-bot detection bypass
- ✅ Security research and automation testing
- ✅ Browser automation with stealth capabilities
- ❌ Malicious scraping or unauthorized access
- ❌ Circumventing legitimate security measures

### **Anti-Detection Capabilities**
- **Canvas Fingerprinting**: Browser-specific noise injection patterns
- **WebRTC Masking**: Realistic IP generation and SDP manipulation  
- **Timing Patterns**: Human-like request timing with statistical distributions
- **TLS Fingerprints**: Real browser TLS handshake patterns
- **Request Distribution**: Intelligent rotation strategies to avoid detection
- **Geolocation Aware**: Regional browser preferences and headers

### **Best Practices**
- Always implement proper rate limiting and respect robots.txt
- Use geolocation-appropriate UAs for realistic traffic patterns
- Apply timing protection to avoid automated detection
- Rotate UAs intelligently based on success rates and cooldown periods
- Monitor request distribution patterns to maintain stealth

---

## 📊 **Supported Platforms & Browsers**

| Platform | Browsers | Device Types | Anti-Detection Features |
|----------|----------|--------------|-------------------------|
| Windows | Chrome, Firefox, Edge | Desktop | Canvas, WebRTC, TLS, Timing |
| macOS | Chrome, Firefox, Safari | Desktop | Canvas, WebRTC, TLS, Timing |
| Linux | Chrome, Firefox | Desktop | Canvas, WebRTC, TLS, Timing |
| Android | Chrome, Firefox | Mobile, Tablet | Canvas, WebRTC, Geo Headers |
| iOS | Safari, Chrome* | Mobile, Tablet | Canvas, WebRTC, Geo Headers |

*Chrome on iOS uses Safari engine (WebKit)

### **Regional Market Share Data**
- **North America**: Chrome (65.2%), Safari (18.1%), Edge (10.8%), Firefox (5.9%)
- **Europe**: Chrome (62.8%), Firefox (14.3%), Edge (11.7%), Safari (11.2%)
- **Asia Pacific**: Chrome (68.9%), Safari (15.8%), Edge (8.2%), Firefox (7.1%)
- **Additional regions**: South America, Africa & Middle East with realistic distributions

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**

```bash
# Clone the repository
git clone https://github.com/arnonsang/shadow-ua.git
cd shadow-ua

# Install dependencies
npm install

# Build the project
npm run build

# Run tests (comprehensive test suite)
npm test

# Start development mode
npm run dev

# Start REST API server with streaming
npm run serve
```

### **Tech Stack**
- **TypeScript 5.7+**: Full type safety and modern JavaScript features
- **Node.js 18+**: Latest LTS runtime with ES modules support
- **Vitest 3.2+**: Fast, modern testing framework
- **Express v5**: Next-generation web framework with async support
- **Commander.js 14**: Modern CLI argument parsing
- **Advanced Libraries**: Playwright, Selenium WebDriver, OWASP ZAP integration

---

<div align="center">

MIT License - see [LICENSE](LICENSE) file for details.

[⭐ Star us on GitHub](https://github.com/arnonsang/shadow-ua) • [📦 npm Package](https://www.npmjs.com/package/shadow-ua)

</div>