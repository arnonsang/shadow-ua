# 🕵️ ShadowUA

[![npm version](https://img.shields.io/npm/v/shadow-ua)](https://www.npmjs.com/package/shadow-ua)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/arnonsang/shadow-ua/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![GitHub issues](https://img.shields.io/github/issues/arnonsang/shadow-ua)](https://github.com/arnonsang/shadow-ua/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/arnonsang/shadow-ua)](https://github.com/arnonsang/shadow-ua/pulls)
[![npm downloads](https://img.shields.io/npm/dm/shadow-ua)](https://www.npmjs.com/package/shadow-ua)
[![GitHub stars](https://img.shields.io/github/stars/arnonsang/shadow-ua?style=social)](https://github.com/arnonsang/shadow-ua/stargazers)

**A tool for generating realistic User-Agent strings for mocking, load testing, defensive security testing, and browser spoofing.**

ShadowUA uses a modern component-based architecture to generate thousands of realistic User-Agent combinations from separate OS, browser, engine, and device components. Perfect for penetration testing, load testing, security research, and browser automation.

---

## ✨ **Key Features**

### 🎯 **Smart Generation**
- **Modular Components**: Mix & match OS, browser, engine, and device components
- **Weighted Randomness**: Based on real market share data
- **Realistic Combinations**: Ensures generated UAs match real-world patterns
- **Infinite Variety**: Thousands of possible combinations

### 🖥️ **CLI & Library**
- **Fast CLI**: `shua` command with intuitive flags and aliases
- **Type-Safe API**: Full TypeScript support with comprehensive types
- **Multiple Formats**: Export to TXT, JSON, CSV, cURL scripts

### 🔧 **Tool Integrations**
- **Security Tools**: Burp Suite, k6, JMeter, Locust exports
- **REST API**: Express v5 server with rate limiting and validation
- **Proxy Support**: HTTP/HTTPS/SOCKS with rotation strategies
- **Browser Automation**: Puppeteer/Playwright integration ready

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
# Generate a random User-Agent
shua generate --random

# Generate 5 Chrome UAs for Windows
shua g -c 5 -b Chrome -p Windows

# Export 10 UAs for k6 load testing
shua export --format k6 --count 10 --save load-test.js

# Use custom UA pool
shua custom --load my-uas.txt --count 3

# Start REST API server
shua serve --port 3000 --cors
```

### Library Usage

```typescript
import { generateModularUA, Browser, Platform } from 'shadow-ua';

// Generate with specific constraints
const ua = generateModularUA({
  browser: Browser.Chrome,
  platform: Platform.Windows,
  deviceType: DeviceType.Desktop
});

console.log(ua.userAgent);
// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...

// Access individual components
console.log(ua.browserVersion); // "120.0.0.0"
console.log(ua.platformVersion); // "NT 10.0; Win64; x64"
```

---

## 📋 **CLI Commands**

| Command | Aliases | Description |
|---------|---------|-------------|
| `generate` | `gen`, `g` | Generate User-Agent strings with flexible filtering |
| `export` | `exp`, `e` | Export User-Agents in tool-specific formats (k6, burp, etc.) |
| `custom` | `cust`, `c` | Load and use custom User-Agent pools from files |
| `serve` | `api`, `server` | Start REST API server for HTTP-based UA generation |

### **Generate Command**

Generate User-Agent strings with flexible filtering options.

```bash
# Basic usage
shua generate [options]
shua gen [options]    # Short alias
shua g [options]      # Shortest alias
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
| `-w` | `--weighted`  | Use weighted random generation |
| `-f` | `--format <format>`  | Output format (txt, json, csv, curl) |
| `-o` | `--output <file>`  | Output file path |
| `-s` | `--save <file>`  | Alias for --output |

**Examples:**
```bash
# Generate 3 random UAs
shua gen -c 3

# Chrome on Android mobile devices
shua g -b Chrome -p Android -t mobile -n 5

# Export to JSON file
shua generate --browser Firefox --platform macOS --format json --save firefox-uas.json
```

### **Export Command**

Export User-Agents in various tool-specific formats.

```bash
# Basic usage
shua export [options]
shua exp [options]    # Short alias
shua e [options]      # Shortest alias

# Available formats: burp, k6, jmeter, locust
shua export --format k6 --count 20 --save load-test.js
shua e -f burp -c 50 -b Chrome -s burp-uas.txt
```

### **Custom Command**

Load and use custom User-Agent pools from files.

```bash
# Basic usage
shua custom [options]
shua cust [options]   # Short alias
shua c [options]      # Shortest alias

# Load custom UA pool
shua custom --load my-user-agents.txt --count 5
shua c -i custom-uas.txt -n 10 -s output.txt
```

### **Serve Command (REST API)**

Start a REST API server for HTTP-based UA generation.

```bash
# Basic usage
shua serve [options]
shua api [options]     # Short alias
shua server [options]  # Long alias

# Start server with options
shua serve --port 3000 --cors --rate-limit 1000
```

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /ua` | GET | Generate single User-Agent |
| `GET /uas?count=N` | GET | Generate multiple User-Agents |
| `POST /ua/export` | POST | Export UAs in various formats |
| `GET /stats` | GET | API usage statistics |
| `GET /components` | GET | Available components info |
| `GET /health` | GET | Health check endpoint |

**Example API Usage:**
```bash
# Get single UA
curl http://localhost:3000/ua

# Get 5 Chrome UAs for Windows
curl "http://localhost:3000/uas?count=5&browser=Chrome&platform=Windows"

# Export for k6 testing
curl -X POST http://localhost:3000/ua/export \
  -H "Content-Type: application/json" \
  -d '{"count": 10, "format": "k6", "browser": "Firefox"}'
```

#### Environment Configuration

The API server can be configured using environment variables:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Server port | `3000` | `PORT=8080` |
| `HOST` | Server host | `localhost` | `HOST=0.0.0.0` |
| `CORS_ENABLED` | Enable CORS support | `false` | `CORS_ENABLED=true` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` | `CORS_ORIGINS=https://example.com,https://api.example.com` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) | `RATE_LIMIT_WINDOW_MS=600000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` | `RATE_LIMIT_MAX=1000` |
| `HELMET_ENABLED` | Enable security headers | `true` | `HELMET_ENABLED=false` |
| `TRUST_PROXY` | Trust proxy headers | `false` | `TRUST_PROXY=true` |

**Starting with environment variables:**

```bash
# Using environment variables directly
PORT=8080 CORS_ENABLED=true shua serve

# Using .env file (if you add dotenv support)
shua serve --env-file .env
```

---

## 📚 **Library API**

### **Core Generation**

```typescript
import { 
  generateModularUA, 
  generateMultipleModularUA,
  Browser, 
  Platform, 
  DeviceType 
} from 'shadow-ua';

// Generate single UA with components
const ua = generateModularUA({
  browser: Browser.Chrome,
  platform: Platform.Windows
});

// Generate multiple UAs
const uas = generateMultipleModularUA(5, {
  browser: Browser.Firefox,
  platform: Platform.macOS
});

// Access detailed components
console.log(ua.userAgent);      // Full UA string
console.log(ua.browserVersion); // Browser version
console.log(ua.engineVersion);  // Engine version
console.log(ua.osString);       // OS string
console.log(ua.deviceModel);    // Device model (mobile/tablet)
```

### **Export Functions**

```typescript
import { exportUAs, exportToK6, exportToBurpSuite } from 'shadow-ua';

const userAgents = ['Mozilla/5.0...', 'Mozilla/5.0...'];

// Export to different formats
const json = exportUAs(userAgents, { format: ExportFormat.JSON, count: 2 });
const k6Script = exportToK6(userAgents);
const burpList = exportToBurpSuite(userAgents);
```

### **Proxy Management**

```typescript
import { 
  loadProxyList, 
  rotateProxy, 
  formatProxyForCurl 
} from 'shadow-ua';

// Load proxies from file
const proxies = loadProxyList('proxies.txt');

// Rotate through proxies
const proxy1 = rotateProxy(proxies, 'round-robin');
const proxy2 = rotateProxy(proxies, 'random');

// Format for different tools
const curlProxy = formatProxyForCurl(proxy1);
const axiosProxy = formatProxyForAxios(proxy1);
```

---

## 🎨 **Output Formats**

### **Text Format**
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15...
```

### **JSON Format**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "count": 2,
  "userAgents": [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
  ]
}
```

### **k6 Load Testing Script**
```javascript
import http from 'k6/http';
import { check } from 'k6';

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
];

export default function () {
  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  const params = {
    headers: { 'User-Agent': randomUA }
  };
  
  const response = http.get('https://httpbin.org/user-agent', params);
  check(response, { 'status is 200': (r) => r.status === 200 });
}
```

---

## 🔧 **Advanced Usage**

### **Component Architecture**

ShadowUA uses a modular approach where User-Agents are built from separate components:

- **OS Components**: Windows versions, macOS versions, Linux distros, Android/iOS versions
- **Browser Components**: Chrome, Firefox, Safari, Edge with realistic version distributions  
- **Engine Components**: WebKit, Gecko, Blink with proper version mapping
- **Device Components**: Mobile and tablet device models with screen resolutions

```typescript
import { 
  OS_COMPONENTS, 
  BROWSER_COMPONENTS, 
  ENGINE_COMPONENTS,
  getAvailableCombinations 
} from 'shadow-ua';

// See available combinations
const stats = getAvailableCombinations({
  platform: Platform.Android,
  browser: Browser.Chrome
});

console.log(`Total possible combinations: ${stats.totalCombinations}`);
```

### **Custom UA Pools**

Load your own User-Agent lists:

```typescript
import { loadCustomUAPool, generateFromCustomPool } from 'shadow-ua';

// Load custom UAs from file
loadCustomUAPool('./my-custom-uas.txt');

// Generate from custom pool
const customUAs = generateFromCustomPool(5);
```

### **Proxy Integration**

```typescript
import { loadProxyList, rotateProxy } from 'shadow-ua';

// Load proxies (supports multiple formats)
const proxies = loadProxyList('proxies.txt');
// Formats supported:
// host:port
// protocol://host:port  
// protocol://user:pass@host:port
// host:port:user:pass

// Use with HTTP clients
const proxy = rotateProxy(proxies);
const axiosConfig = {
  proxy: formatProxyForAxios(proxy),
  headers: { 'User-Agent': generateModularUA().userAgent }
};
```

---

## 🛡️ **Security & Best Practices**

### **Defensive Use Only**
ShadowUA is designed exclusively for **defensive security purposes**:
- ✅ Penetration testing
- ✅ Load testing  
- ✅ Security research
- ✅ Browser automation testing
- ❌ Malicious scraping
- ❌ Circumventing security measures
- ❌ Unauthorized access

### **Realistic Patterns**
- UAs respect real-world browser/OS compatibility
- Version distributions based on actual market data
- Device models match real hardware
- Screen resolutions align with device types

### **Rate Limiting**
Always implement proper rate limiting and respect robots.txt when using generated UAs for web requests.

---

## 📊 **Supported Platforms & Browsers**

| Platform | Browsers | Device Types |
|----------|----------|--------------|
| Windows | Chrome, Firefox, Edge | Desktop |
| macOS | Chrome, Firefox, Safari | Desktop |  
| Linux | Chrome, Firefox | Desktop |
| Android | Chrome, Firefox | Mobile, Tablet |
| iOS | Safari, Chrome* | Mobile, Tablet |

*Chrome on iOS uses Safari engine (WebKit)

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

# Run tests (193 tests, 100% passing)
npm test

# Start development mode
npm run dev

# Start REST API server
npm run serve
```

### **Tech Stack (Dependencies)**
- **TypeScript 5.7+**: Full type safety and modern JavaScript features
- **Node.js 18+**: Latest LTS runtime with ES modules support
- **Vitest 3.2+**: Fast, modern testing framework
- **Express v5**: Next-generation web framework with async support
- **Commander.js 14**: Modern CLI argument parsing

---

<div align="center">

MIT License - see [LICENSE](LICENSE) file for details.

[⭐ Star us on GitHub](https://github.com/arnonsang/shadow-ua) • [📦 npm Package](https://www.npmjs.com/package/shadow-ua)

</div>