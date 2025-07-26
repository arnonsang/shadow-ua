import { UAComponents } from '../core/modular-generator';
import { Platform, Browser, DeviceType } from '../types';

export interface BrowserFingerprint {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelDepth: number;
  };
  navigator: {
    language: string;
    languages: string[];
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: string | null;
    hardwareConcurrency: number;
    maxTouchPoints: number;
  };
  webgl: {
    vendor: string;
    renderer: string;
    version: string;
  };
  fonts: string[];
  plugins: Array<{
    name: string;
    filename: string;
    description: string;
  }>;
  timezone: string;
  webrtc: {
    publicIP?: string;
    localIPs: string[];
  };
  canvas: {
    noiseLevel: number;
    textMetrics: {
      fontList: string[];
      baselines: number[];
    };
    imageData: {
      r: number;
      g: number;
      b: number;
      a: number;
    }[];
  };
}

export interface PuppeteerConfig {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
  };
  extraHTTPHeaders?: Record<string, string>;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  permissions?: string[];
  timezoneId?: string;
}

export interface PlaywrightConfig {
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
}

// Screen resolutions based on real-world data
const SCREEN_RESOLUTIONS = {
  [DeviceType.Desktop]: [
    { width: 1920, height: 1080, usage: 22.2 },
    { width: 1366, height: 768, usage: 12.4 },
    { width: 1440, height: 900, usage: 9.1 },
    { width: 1536, height: 864, usage: 7.3 },
    { width: 1280, height: 720, usage: 5.9 },
    { width: 1600, height: 900, usage: 4.8 },
    { width: 2560, height: 1440, usage: 4.2 },
    { width: 1280, height: 1024, usage: 3.1 },
  ],
  [DeviceType.Mobile]: [
    { width: 393, height: 852, usage: 8.2 }, // iPhone 14 Pro
    { width: 390, height: 844, usage: 7.8 }, // iPhone 14
    { width: 414, height: 896, usage: 7.1 }, // iPhone 11 Pro Max
    { width: 375, height: 812, usage: 6.9 }, // iPhone X/XS
    { width: 360, height: 640, usage: 6.2 }, // Samsung Galaxy S5
    { width: 375, height: 667, usage: 5.8 }, // iPhone 6/7/8
    { width: 412, height: 915, usage: 5.1 }, // Pixel 7
    { width: 384, height: 854, usage: 4.9 }, // OnePlus 9
  ],
  [DeviceType.Tablet]: [
    { width: 820, height: 1180, usage: 15.3 }, // iPad Air 11"
    { width: 768, height: 1024, usage: 14.2 }, // iPad Mini
    { width: 834, height: 1194, usage: 13.1 }, // iPad Pro 11"
    { width: 1024, height: 1366, usage: 12.8 }, // iPad Pro 12.9"
    { width: 800, height: 1280, usage: 11.7 }, // Android tablets
    { width: 601, height: 962, usage: 8.9 }, // Surface Duo
  ],
};

// WebGL vendors and renderers based on real hardware
const WEBGL_CONFIGS = {
  [Browser.Chrome]: {
    [Platform.Windows]: [
      { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0, D3D11)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
      { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
      { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
    ],
    [Platform.macOS]: [
      { vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
      { vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, Apple M2, OpenGL 4.1)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
      { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel Iris Pro OpenGL Engine, OpenGL 4.1)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
    ],
    [Platform.Linux]: [
      { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 OpenGL 4.6.0, OpenGL 4.6.0)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
      { vendor: 'Google Inc. (Mesa)', renderer: 'ANGLE (Mesa, llvmpipe (LLVM 13.0.1, 256 bits), OpenGL 4.5 (Core Profile))', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
    ],
  },
  [Browser.Firefox]: {
    [Platform.Windows]: [
      { vendor: 'Mozilla', renderer: 'NVIDIA GeForce RTX 3070/PCIe/SSE2', version: 'WebGL 1.0' },
      { vendor: 'Mozilla', renderer: 'Intel(R) UHD Graphics 630', version: 'WebGL 1.0' },
      { vendor: 'Mozilla', renderer: 'AMD Radeon RX 6700 XT', version: 'WebGL 1.0' },
    ],
    [Platform.macOS]: [
      { vendor: 'Mozilla', renderer: 'Apple M1 Pro', version: 'WebGL 1.0' },
      { vendor: 'Mozilla', renderer: 'Apple M2', version: 'WebGL 1.0' },
      { vendor: 'Mozilla', renderer: 'Intel Iris Pro OpenGL Engine', version: 'WebGL 1.0' },
    ],
    [Platform.Linux]: [
      { vendor: 'Mozilla', renderer: 'NVIDIA GeForce RTX 3060/PCIe/SSE2', version: 'WebGL 1.0' },
      { vendor: 'Mozilla', renderer: 'llvmpipe (LLVM 13.0.1, 256 bits)', version: 'WebGL 1.0' },
    ],
  },
  [Browser.Safari]: {
    [Platform.macOS]: [
      { vendor: 'Apple Inc.', renderer: 'Apple GPU', version: 'WebGL 1.0 (OpenGL ES 2.0 Apple-1)' },
      { vendor: 'Apple Inc.', renderer: 'Apple M1 Pro', version: 'WebGL 1.0 (OpenGL ES 2.0 Apple-1)' },
      { vendor: 'Apple Inc.', renderer: 'Apple M2', version: 'WebGL 1.0 (OpenGL ES 2.0 Apple-1)' },
    ],
    [Platform.iOS]: [
      { vendor: 'Apple Inc.', renderer: 'Apple A15 GPU', version: 'WebGL 1.0 (OpenGL ES 2.0 Apple-1)' },
      { vendor: 'Apple Inc.', renderer: 'Apple A16 GPU', version: 'WebGL 1.0 (OpenGL ES 2.0 Apple-1)' },
      { vendor: 'Apple Inc.', renderer: 'Apple A14 GPU', version: 'WebGL 1.0 (OpenGL ES 2.0 Apple-1)' },
    ],
  },
  [Browser.Edge]: {
    [Platform.Windows]: [
      { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0, D3D11)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
      { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
      { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0, D3D11)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
    ],
    [Platform.macOS]: [
      { vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
      { vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, Apple M2, OpenGL 4.1)', version: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)' },
    ],
  },
};

// Common fonts by platform
const PLATFORM_FONTS = {
  [Platform.Windows]: [
    'Arial', 'Calibri', 'Cambria', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel',
    'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Microsoft Sans Serif',
    'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
  ],
  [Platform.macOS]: [
    'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
    'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Brush Script MT',
    'Chalkduster', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot',
    'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum',
    'Hoefler Text', 'Impact', 'Lucida Grande', 'Marker Felt', 'Monaco', 'Optima', 'Palatino',
    'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand',
    'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino'
  ],
  [Platform.Linux]: [
    'Abyssinica SIL', 'Africa', 'Aharoni', 'Alef', 'Andale Mono', 'Arial', 'Bitstream Charter',
    'Century Schoolbook L', 'Comic Sans MS', 'Courier 10 Pitch', 'Courier New', 'DejaVu Sans',
    'DejaVu Sans Mono', 'DejaVu Serif', 'Droid Sans', 'Droid Sans Mono', 'Droid Serif', 'FreeMono',
    'FreeSans', 'FreeSerif', 'Garuda', 'Georgia', 'Liberation Mono', 'Liberation Sans', 'Liberation Serif',
    'Lohit Bengali', 'Lohit Gujarati', 'Lohit Hindi', 'Nimbus Mono L', 'Nimbus Roman No9 L',
    'Nimbus Sans L', 'Noto Sans', 'Open Sans', 'OpenSymbol', 'Padauk', 'Source Code Pro',
    'Tahoma', 'Times New Roman', 'Ubuntu', 'Ubuntu Mono', 'Verdana'
  ],
  [Platform.Android]: [
    'Droid Sans', 'Droid Sans Mono', 'Droid Serif', 'Noto Color Emoji', 'Noto Sans', 'Noto Sans CJK JP',
    'Noto Sans CJK KR', 'Noto Sans CJK SC', 'Noto Sans CJK TC', 'Noto Serif', 'Roboto', 'Roboto Condensed',
    'Roboto Mono', 'Roboto Slab'
  ],
  [Platform.iOS]: [
    'Academy Engraved LET', 'Al Nile', 'American Typewriter', 'Apple Color Emoji', 'Apple SD Gothic Neo',
    'Arial', 'Arial Hebrew', 'Arial Rounded MT Bold', 'Avenir', 'Avenir Next', 'Avenir Next Condensed',
    'Baskerville', 'Bodoni 72', 'Bradley Hand', 'Chalkboard SE', 'Chalkduster', 'Cochin', 'Copperplate',
    'Courier', 'Courier New', 'Damascus', 'Didot', 'Euphemia UCAS', 'Futura', 'Geeza Pro', 'Georgia',
    'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Hiragino Mincho ProN', 'Hiragino Sans', 'Hoefler Text',
    'Kailasa', 'Kefa', 'Marker Felt', 'Menlo', 'Mishafi', 'Noteworthy', 'Optima', 'Palatino',
    'Papyrus', 'Party LET', 'PingFang HK', 'PingFang SC', 'PingFang TC', 'Savoye LET', 'Sinhala Sangam MN',
    'Snell Roundhand', 'Symbol', 'Thonburi', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Zapfino'
  ],
};

// Common browser plugins
const BROWSER_PLUGINS = {
  [Browser.Chrome]: [
    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
    { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
  ],
  [Browser.Firefox]: [
    { name: 'OpenH264 Video Codec provided by Cisco Systems, Inc.', filename: 'libgmpopenh264.so', description: 'GMP Plugin for OpenH264. (Provided by Cisco Systems, Inc.)' },
    { name: 'Widevine Content Decryption Module provided by Google Inc.', filename: 'libwidevinecdm.so', description: 'Enables Widevine licenses for playback of HTML audio/video content. (Provided by Google Inc.)' },
  ],
  [Browser.Safari]: [],
  [Browser.Edge]: [
    { name: 'Microsoft Edge PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
    { name: 'Microsoft Edge PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
  ],
};

// Hardware concurrency by device type
function getHardwareConcurrency(deviceType: DeviceType): number {
  switch (deviceType) {
    case DeviceType.Desktop:
      return [2, 4, 6, 8, 12, 16][Math.floor(Math.random() * 6)];
    case DeviceType.Mobile:
      return [2, 4, 6, 8][Math.floor(Math.random() * 4)];
    case DeviceType.Tablet:
      return [4, 6, 8][Math.floor(Math.random() * 3)];
    default:
      return 4;
  }
}

// Generate weighted screen resolution
function getScreenResolution(deviceType: DeviceType): { width: number; height: number } {
  const resolutions = SCREEN_RESOLUTIONS[deviceType];
  const totalUsage = resolutions.reduce((sum, r) => sum + r.usage, 0);
  const random = Math.random() * totalUsage;
  
  let currentUsage = 0;
  for (const resolution of resolutions) {
    currentUsage += resolution.usage;
    if (random <= currentUsage) {
      return { width: resolution.width, height: resolution.height };
    }
  }
  
  return resolutions[0]; // Fallback
}

// Generate WebRTC configuration with realistic IP masking
function generateWebRTCConfig(platform: Platform): {
  publicIP?: string;
  localIPs: string[];
} {
  // Generate realistic local IP addresses based on platform
  const commonNetworks = {
    [Platform.Windows]: [
      '192.168.1.',
      '192.168.0.',
      '10.0.0.',
      '172.16.0.',
    ],
    [Platform.macOS]: [
      '192.168.1.',
      '10.0.0.',
      '192.168.0.',
      '172.16.1.',
    ],
    [Platform.Linux]: [
      '192.168.1.',
      '10.0.0.',
      '192.168.0.',
      '172.16.0.',
      '127.0.0.',
    ],
    [Platform.Android]: [
      '192.168.1.',
      '192.168.43.', // Mobile hotspot
      '10.0.0.',
    ],
    [Platform.iOS]: [
      '192.168.1.',
      '192.168.43.',
      '10.0.0.',
    ],
  };
  
  const networks = commonNetworks[platform] || commonNetworks[Platform.Windows];
  const selectedNetwork = networks[Math.floor(Math.random() * networks.length)];
  
  // Generate multiple local IPs (common in corporate/complex networks)  
  const localIPs: string[] = [];
  const numIPs = Math.floor(Math.random() * 3) + 1; // 1-3 local IPs
  
  for (let i = 0; i < numIPs; i++) {
    const lastOctet = Math.floor(Math.random() * 254) + 1;
    localIPs.push(selectedNetwork + lastOctet.toString());
  }
  
  // Sometimes include IPv6 addresses
  if (Math.random() > 0.7) {
    const ipv6Prefixes = [
      'fe80::',
      '2001:db8::',
      'fc00::',
    ];
    const prefix = ipv6Prefixes[Math.floor(Math.random() * ipv6Prefixes.length)];
    const suffix = Math.floor(Math.random() * 0xffff).toString(16);
    localIPs.push(prefix + suffix);
  }
  
  // Rarely include public IP (simulates certain network configurations)
  let publicIP: string | undefined;
  if (Math.random() > 0.95) {
    // Generate realistic public IP ranges (avoiding private ranges)
    const publicRanges = [
      '8.8.8.',
      '1.1.1.',
      '208.67.222.',
      '156.154.70.',
    ];
    const range = publicRanges[Math.floor(Math.random() * publicRanges.length)];
    publicIP = range + (Math.floor(Math.random() * 254) + 1).toString();
  }
  
  return {
    localIPs,
    publicIP,
  };
}

// Generate canvas fingerprint noise
function generateCanvasFingerprint(browser: Browser, platform: Platform): {
  noiseLevel: number;
  textMetrics: { fontList: string[]; baselines: number[] };
  imageData: { r: number; g: number; b: number; a: number }[];
} {
  // Different browsers have slightly different canvas implementations
  const browserNoiseLevels = {
    [Browser.Chrome]: { min: 0.001, max: 0.003 },
    [Browser.Firefox]: { min: 0.002, max: 0.004 },
    [Browser.Safari]: { min: 0.001, max: 0.002 },
    [Browser.Edge]: { min: 0.001, max: 0.003 },
  };
  
  const noiseRange = browserNoiseLevels[browser];
  const noiseLevel = Math.random() * (noiseRange.max - noiseRange.min) + noiseRange.min;
  
  // Generate consistent but varied text metrics
  const fontList = (PLATFORM_FONTS[platform] || PLATFORM_FONTS[Platform.Windows]).slice(0, 10);
  const baselines = fontList.map(() => Math.random() * 2 + 10); // 10-12px typical baseline
  
  // Generate subtle image data variations (RGBA values)
  const imageData = Array.from({ length: 4 }, () => ({
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
    a: Math.floor(Math.random() * 256),
  }));
  
  return {
    noiseLevel,
    textMetrics: { fontList, baselines },
    imageData,
  };
}

// Generate realistic timezone
function getTimezone(platform: Platform): string {
  const timezones = {
    [Platform.Windows]: ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'],
    [Platform.macOS]: ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'],
    [Platform.Linux]: ['America/New_York', 'America/Los_Angeles', 'UTC', 'Europe/London', 'Europe/Berlin', 'Asia/Shanghai'],
    [Platform.Android]: ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney'],
    [Platform.iOS]: ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'],
  };
  
  const platformTimezones = timezones[platform];
  return platformTimezones[Math.floor(Math.random() * platformTimezones.length)];
}

// Generate language preferences
function getLanguages(platform: Platform): { language: string; languages: string[] } {
  const languagePrefs = {
    [Platform.Windows]: [
      { language: 'en-US', languages: ['en-US', 'en'] },
      { language: 'en-GB', languages: ['en-GB', 'en-US', 'en'] },
      { language: 'de-DE', languages: ['de-DE', 'de', 'en-US', 'en'] },
      { language: 'fr-FR', languages: ['fr-FR', 'fr', 'en-US', 'en'] },
      { language: 'es-ES', languages: ['es-ES', 'es', 'en-US', 'en'] },
    ],
    [Platform.macOS]: [
      { language: 'en-US', languages: ['en-US', 'en'] },
      { language: 'en-GB', languages: ['en-GB', 'en-US', 'en'] },
      { language: 'de-DE', languages: ['de-DE', 'de', 'en-US', 'en'] },
      { language: 'fr-FR', languages: ['fr-FR', 'fr', 'en-US', 'en'] },
      { language: 'ja-JP', languages: ['ja-JP', 'ja', 'en-US', 'en'] },
    ],
    [Platform.Linux]: [
      { language: 'en-US', languages: ['en-US', 'en'] },
      { language: 'en-GB', languages: ['en-GB', 'en-US', 'en'] },
      { language: 'de-DE', languages: ['de-DE', 'de', 'en'] },
      { language: 'zh-CN', languages: ['zh-CN', 'zh', 'en'] },
    ],
    [Platform.Android]: [
      { language: 'en-US', languages: ['en-US', 'en'] },
      { language: 'zh-CN', languages: ['zh-CN', 'zh', 'en'] },
      { language: 'ja-JP', languages: ['ja-JP', 'ja', 'en'] },
      { language: 'ko-KR', languages: ['ko-KR', 'ko', 'en'] },
    ],
    [Platform.iOS]: [
      { language: 'en-US', languages: ['en-US', 'en'] },
      { language: 'en-GB', languages: ['en-GB', 'en-US', 'en'] },
      { language: 'zh-CN', languages: ['zh-CN', 'zh', 'en'] },
      { language: 'ja-JP', languages: ['ja-JP', 'ja', 'en'] },
    ],
  };
  
  const prefs = languagePrefs[platform];
  return prefs[Math.floor(Math.random() * prefs.length)];
}

/**
 * Generate a comprehensive browser fingerprint from UA components
 */
export function generateBrowserFingerprint(components: UAComponents): BrowserFingerprint {
  const screen = getScreenResolution(components.deviceType);
  
  // Get WebGL config with proper type safety
  const browserConfigs = WEBGL_CONFIGS[components.browser];
  const platformConfigs = browserConfigs && browserConfigs[components.platform as keyof typeof browserConfigs];
  const webglConfigs = platformConfigs || [];
  const webgl = webglConfigs.length > 0 
    ? webglConfigs[Math.floor(Math.random() * webglConfigs.length)]
    : {
        vendor: 'Google Inc.',
        renderer: 'ANGLE (Unknown GPU)',
        version: 'WebGL 1.0'
      };
  
  const fonts = PLATFORM_FONTS[components.platform] || PLATFORM_FONTS[Platform.Windows];
  const plugins = BROWSER_PLUGINS[components.browser] || [];
  const languages = getLanguages(components.platform);
  const timezone = getTimezone(components.platform);
  const canvas = generateCanvasFingerprint(components.browser, components.platform);
  
  const isMobile = components.deviceType === DeviceType.Mobile;
  const isTablet = components.deviceType === DeviceType.Tablet;
  const hasTouch = isMobile || isTablet;
  
  // Viewport is typically smaller than screen resolution
  const viewportScale = isMobile ? 0.9 : (isTablet ? 0.85 : 0.95);
  const viewport = {
    width: Math.floor(screen.width * viewportScale),
    height: Math.floor(screen.height * viewportScale),
  };
  
  return {
    userAgent: components.userAgent,
    viewport: {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: isMobile ? (Math.random() > 0.5 ? 2 : 3) : 1,
      isMobile,
      hasTouch,
    },
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: 24,
      pixelDepth: 24,
    },
    navigator: {
      language: languages.language,
      languages: languages.languages,
      platform: components.platform,
      cookieEnabled: true,
      doNotTrack: Math.random() > 0.8 ? '1' : null,
      hardwareConcurrency: getHardwareConcurrency(components.deviceType),
      maxTouchPoints: hasTouch ? (isMobile ? 5 : 10) : 0,
    },
    webgl,
    fonts: fonts.slice(0, Math.floor(Math.random() * 10) + 15), // Random subset
    plugins,
    timezone,
    webrtc: generateWebRTCConfig(components.platform),
    canvas,
  };
}

/**
 * Convert browser fingerprint to Puppeteer configuration
 */
export function generatePuppeteerConfig(components: UAComponents): PuppeteerConfig {
  const fingerprint = generateBrowserFingerprint(components);
  
  return {
    userAgent: fingerprint.userAgent,
    viewport: fingerprint.viewport,
    extraHTTPHeaders: {
      'Accept-Language': fingerprint.navigator.languages.join(','),
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'DNT': fingerprint.navigator.doNotTrack || '0',
    },
    timezoneId: fingerprint.timezone,
    permissions: ['geolocation'],
  };
}

/**
 * Convert browser fingerprint to Playwright configuration
 */
export function generatePlaywrightConfig(components: UAComponents): PlaywrightConfig {
  const fingerprint = generateBrowserFingerprint(components);
  
  return {
    userAgent: fingerprint.userAgent,
    viewport: {
      width: fingerprint.viewport.width,
      height: fingerprint.viewport.height,
    },
    deviceScaleFactor: fingerprint.viewport.deviceScaleFactor,
    isMobile: fingerprint.viewport.isMobile,
    hasTouch: fingerprint.viewport.hasTouch,
    locale: fingerprint.navigator.language,
    timezoneId: fingerprint.timezone,
    extraHTTPHeaders: {
      'Accept-Language': fingerprint.navigator.languages.join(','),
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
    permissions: ['geolocation'],
    colorScheme: Math.random() > 0.7 ? 'dark' : 'light',
    reducedMotion: Math.random() > 0.95 ? 'reduce' : 'no-preference',
  };
}

/**
 * Generate JavaScript code to override fingerprint properties
 */
export function generateFingerprintOverrides(fingerprint: BrowserFingerprint): string {
  return `
// Browser fingerprint overrides
(function() {
  // Override screen properties
  Object.defineProperty(screen, 'width', { value: ${fingerprint.screen.width} });
  Object.defineProperty(screen, 'height', { value: ${fingerprint.screen.height} });
  Object.defineProperty(screen, 'colorDepth', { value: ${fingerprint.screen.colorDepth} });
  Object.defineProperty(screen, 'pixelDepth', { value: ${fingerprint.screen.pixelDepth} });
  
  // Override navigator properties
  Object.defineProperty(navigator, 'language', { value: '${fingerprint.navigator.language}' });
  Object.defineProperty(navigator, 'languages', { value: ${JSON.stringify(fingerprint.navigator.languages)} });
  Object.defineProperty(navigator, 'platform', { value: '${fingerprint.navigator.platform}' });
  Object.defineProperty(navigator, 'hardwareConcurrency', { value: ${fingerprint.navigator.hardwareConcurrency} });
  Object.defineProperty(navigator, 'maxTouchPoints', { value: ${fingerprint.navigator.maxTouchPoints} });
  Object.defineProperty(navigator, 'cookieEnabled', { value: ${fingerprint.navigator.cookieEnabled} });
  ${fingerprint.navigator.doNotTrack ? `Object.defineProperty(navigator, 'doNotTrack', { value: '${fingerprint.navigator.doNotTrack}' });` : ''}
  
  // Override WebGL fingerprint
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) return '${fingerprint.webgl.vendor}';
    if (parameter === 37446) return '${fingerprint.webgl.renderer}';
    if (parameter === 7938) return '${fingerprint.webgl.version}';
    return getParameter.call(this, parameter);
  };
  
  // Override timezone
  const originalDateTimeFormat = Intl.DateTimeFormat;
  Intl.DateTimeFormat = function(...args) {
    if (args.length === 0) args = ['en-US'];
    if (typeof args[1] === 'undefined') args[1] = {};
    if (typeof args[1].timeZone === 'undefined') args[1].timeZone = '${fingerprint.timezone}';
    return new originalDateTimeFormat(...args);
  };
  
  // Override WebRTC IP enumeration
  if (window.RTCPeerConnection) {
    const originalRTCPeerConnection = window.RTCPeerConnection;
    const localIPs = ${JSON.stringify(fingerprint.webrtc.localIPs)};
    ${fingerprint.webrtc.publicIP ? `const publicIP = '${fingerprint.webrtc.publicIP}';` : ''}
    
    window.RTCPeerConnection = function(configuration, ...args) {
      const pc = new originalRTCPeerConnection(configuration, ...args);
      
      // Override createOffer to inject custom ICE candidates
      const originalCreateOffer = pc.createOffer;
      pc.createOffer = function(...args) {
        return originalCreateOffer.apply(this, args).then(offer => {
          // Modify SDP to include our custom local IPs
          let sdp = offer.sdp;
          localIPs.forEach((ip, index) => {
            const candidateLine = \`a=candidate:1 1 UDP 2113667326 \${ip} 54400 typ host generation 0\\r\\n\`;
            sdp = sdp.replace(/a=candidate:[^\\r\\n]*/g, candidateLine);
          });
          
          ${fingerprint.webrtc.publicIP ? `
          // Add public IP candidate if available
          const publicCandidateLine = \`a=candidate:2 1 UDP 1677729535 \${publicIP} 54401 typ srflx raddr \${localIPs[0]} rport 54400 generation 0\\r\\n\`;
          sdp += publicCandidateLine;
          ` : ''}
          
          return { ...offer, sdp };
        });
      };
      
      // Override setLocalDescription to prevent IP leakage
      const originalSetLocalDescription = pc.setLocalDescription;
      pc.setLocalDescription = function(description, ...args) {
        if (description && description.sdp) {
          // Filter out real local IP candidates
          let modifiedSdp = description.sdp;
          localIPs.forEach(ip => {
            const candidateRegex = new RegExp(\`a=candidate:[^\\r\\n]*\${ip.replace(/\\./g, '\\\\.')}[^\\r\\n]*\\r?\\n\`, 'g');
            modifiedSdp = modifiedSdp.replace(candidateRegex, '');
          });
          
          description = { ...description, sdp: modifiedSdp };
        }
        
        return originalSetLocalDescription.call(this, description, ...args);
      };
      
      return pc;
    };
    
    // Also override the deprecated webkitRTCPeerConnection
    if (window.webkitRTCPeerConnection) {
      window.webkitRTCPeerConnection = window.RTCPeerConnection;
    }
  }
  
  // Override canvas fingerprinting
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
    const context = originalGetContext.call(this, contextType, ...args);
    
    if (contextType === '2d' && context) {
      const originalGetImageData = context.getImageData;
      context.getImageData = function(sx, sy, sw, sh) {
        const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
        
        // Add subtle noise to canvas data
        for (let i = 0; i < imageData.data.length; i += 4) {
          const noise = (Math.random() - 0.5) * ${fingerprint.canvas.noiseLevel} * 255;
          imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + noise));     // R
          imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + noise)); // G
          imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + noise)); // B
        }
        
        return imageData;
      };
      
      const originalFillText = context.fillText;
      context.fillText = function(text, x, y, maxWidth) {
        // Add micro-variations to text rendering
        const variation = (Math.random() - 0.5) * 0.01;
        return originalFillText.call(this, text, x + variation, y + variation, maxWidth);
      };
      
      const originalStrokeText = context.strokeText;
      context.strokeText = function(text, x, y, maxWidth) {
        const variation = (Math.random() - 0.5) * 0.01;
        return originalStrokeText.call(this, text, x + variation, y + variation, maxWidth);
      };
    }
    
    return context;
  };
  
  // Override toDataURL for canvas fingerprint protection
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    const originalResult = originalToDataURL.apply(this, args);
    
    // Add minimal variation to prevent exact matching
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(this, 0, 0);
      
      // Add single pixel noise
      const imageData = ctx.getImageData(0, 0, 1, 1);
      const noise = ${fingerprint.canvas.noiseLevel} * 255;
      imageData.data[0] = Math.min(255, Math.max(0, imageData.data[0] + (Math.random() - 0.5) * noise));
      ctx.putImageData(imageData, Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height));
      
      return canvas.toDataURL(...args);
    }
    
    return originalResult;
  };
})();
`.trim();
}

/**
 * Generate canvas fingerprint randomization script
 */
export function generateCanvasNoiseScript(browser: Browser, platform: Platform): string {
  const canvas = generateCanvasFingerprint(browser, platform);
  
  return `
// Canvas fingerprint randomization
(function() {
  const NOISE_LEVEL = ${canvas.noiseLevel};
  
  // Override 2D context methods
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
    const context = originalGetContext.call(this, contextType, ...args);
    
    if (contextType === '2d' && context) {
      // Randomize getImageData
      const originalGetImageData = context.getImageData;
      context.getImageData = function(sx, sy, sw, sh) {
        const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
        
        // Add browser-specific noise patterns
        for (let i = 0; i < imageData.data.length; i += 4) {
          const noise = (Math.random() - 0.5) * NOISE_LEVEL * 255;
          imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + noise));
          imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + noise));
          imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + noise));
        }
        
        return imageData;
      };
      
      // Randomize text rendering
      const originalFillText = context.fillText;
      context.fillText = function(text, x, y, maxWidth) {
        const variation = (Math.random() - 0.5) * 0.02;
        return originalFillText.call(this, text, x + variation, y + variation, maxWidth);
      };
      
      const originalStrokeText = context.strokeText;
      context.strokeText = function(text, x, y, maxWidth) {
        const variation = (Math.random() - 0.5) * 0.02;
        return originalStrokeText.call(this, text, x + variation, y + variation, maxWidth);
      };
    }
    
    return context;
  };
  
  // Override canvas data export methods
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    // Create temporary canvas with noise
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      tempCtx.drawImage(this, 0, 0);
      
      // Add minimal pixel-level variations
      const imageData = tempCtx.getImageData(0, 0, 1, 1);
      const noiseVariation = NOISE_LEVEL * 255;
      imageData.data[0] = Math.min(255, Math.max(0, imageData.data[0] + (Math.random() - 0.5) * noiseVariation));
      imageData.data[1] = Math.min(255, Math.max(0, imageData.data[1] + (Math.random() - 0.5) * noiseVariation));
      imageData.data[2] = Math.min(255, Math.max(0, imageData.data[2] + (Math.random() - 0.5) * noiseVariation));
      
      const x = Math.floor(Math.random() * tempCanvas.width);
      const y = Math.floor(Math.random() * tempCanvas.height);
      tempCtx.putImageData(imageData, x, y);
      
      return tempCanvas.toDataURL(...args);
    }
    
    return originalToDataURL.apply(this, args);
  };
})();
`.trim();
}

/**
 * Generate comprehensive anti-fingerprinting script
 */
export function generateAntiDetectionScript(fingerprint: BrowserFingerprint): string {
  return `
// Comprehensive anti-detection script
(function() {
  // Canvas protection
  ${generateCanvasNoiseScript(fingerprint.navigator.platform as any, fingerprint.navigator.platform as any)}
  
  // WebGL protection
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    // Add noise to WebGL parameters
    if (parameter === 37445) return '${fingerprint.webgl.vendor}';
    if (parameter === 37446) return '${fingerprint.webgl.renderer}';
    if (parameter === 7938) return '${fingerprint.webgl.version}';
    
    const result = getParameter.call(this, parameter);
    
    // Add subtle variations to numeric parameters
    if (typeof result === 'number' && Math.random() > 0.95) {
      return result + (Math.random() - 0.5) * 0.001;
    }
    
    return result;
  };
  
  // Audio context fingerprint protection
  if (window.AudioContext || window.webkitAudioContext) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    const originalCreateAnalyser = AudioContextConstructor.prototype.createAnalyser;
    
    AudioContextConstructor.prototype.createAnalyser = function() {
      const analyser = originalCreateAnalyser.call(this);
      const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
      
      analyser.getFloatFrequencyData = function(array) {
        originalGetFloatFrequencyData.call(this, array);
        
        // Add minimal audio fingerprint noise
        for (let i = 0; i < array.length; i++) {
          array[i] += (Math.random() - 0.5) * 0.0001;
        }
      };
      
      return analyser;
    };
  }
  
  // Performance timing protection
  if (window.performance && window.performance.now) {
    const originalNow = window.performance.now;
    let timeOffset = Math.random() * 0.1;
    
    window.performance.now = function() {
      return originalNow.call(this) + timeOffset + (Math.random() - 0.5) * 0.01;
    };
  }
})();
`.trim();
}

/**
 * Generate WebRTC IP masking script
 */
export function generateWebRTCMaskingScript(platform: Platform): string {
  const webrtcConfig = generateWebRTCConfig(platform);
  
  return `
// WebRTC IP masking script
(function() {
  const FAKE_LOCAL_IPS = ${JSON.stringify(webrtcConfig.localIPs)};
  ${webrtcConfig.publicIP ? `const FAKE_PUBLIC_IP = '${webrtcConfig.publicIP}';` : ''}
  
  if (window.RTCPeerConnection) {
    const OriginalRTCPeerConnection = window.RTCPeerConnection;
    
    window.RTCPeerConnection = function(configuration, ...args) {
      const pc = new OriginalRTCPeerConnection(configuration, ...args);
      
      // Override ICE candidate gathering
      const originalAddIceCandidate = pc.addIceCandidate;
      pc.addIceCandidate = function(candidate, ...args) {
        if (candidate && candidate.candidate) {
          // Replace real IPs with fake ones in ICE candidates
          let modifiedCandidate = candidate.candidate;
          
          FAKE_LOCAL_IPS.forEach((fakeIP, index) => {
            // Replace patterns that look like IP addresses
            modifiedCandidate = modifiedCandidate.replace(
              /\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b/g,
              fakeIP
            );
          });
          
          const modifiedCandidateObj = {
            ...candidate,
            candidate: modifiedCandidate
          };
          
          return originalAddIceCandidate.call(this, modifiedCandidateObj, ...args);
        }
        
        return originalAddIceCandidate.call(this, candidate, ...args);
      };
      
      // Override createOffer
      const originalCreateOffer = pc.createOffer;
      pc.createOffer = function(...args) {
        return originalCreateOffer.apply(this, args).then(offer => {
          if (offer.sdp) {
            let modifiedSdp = offer.sdp;
            
            // Replace IP addresses in SDP
            FAKE_LOCAL_IPS.forEach(fakeIP => {
              // Replace host candidates
              modifiedSdp = modifiedSdp.replace(
                /a=candidate:([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+typ\\s+host/g,
                \`a=candidate:$1 $2 $3 $4 \${fakeIP} $6 typ host\`
              );
            });
            
            ${webrtcConfig.publicIP ? `
            // Add fake public IP if configured
            if (FAKE_PUBLIC_IP) {
              const publicCandidate = \`a=candidate:2 1 UDP 1677729535 \${FAKE_PUBLIC_IP} 54401 typ srflx raddr \${FAKE_LOCAL_IPS[0]} rport 54400 generation 0\\r\\n\`;
              modifiedSdp += publicCandidate;
            }
            ` : ''}
            
            return { ...offer, sdp: modifiedSdp };
          }
          
          return offer;
        });
      };
      
      // Override createAnswer
      const originalCreateAnswer = pc.createAnswer;
      pc.createAnswer = function(...args) {
        return originalCreateAnswer.apply(this, args).then(answer => {
          if (answer.sdp) {
            let modifiedSdp = answer.sdp;
            
            // Replace IP addresses in answer SDP
            FAKE_LOCAL_IPS.forEach(fakeIP => {
              modifiedSdp = modifiedSdp.replace(
                /a=candidate:([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s+typ\\s+host/g,
                \`a=candidate:$1 $2 $3 $4 \${fakeIP} $6 typ host\`
              );
            });
            
            return { ...answer, sdp: modifiedSdp };
          }
          
          return answer;
        });
      };
      
      return pc;
    };
    
    // Copy static properties
    Object.setPrototypeOf(window.RTCPeerConnection, OriginalRTCPeerConnection);
    window.RTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
    
    // Handle deprecated webkit prefix
    if (window.webkitRTCPeerConnection) {
      window.webkitRTCPeerConnection = window.RTCPeerConnection;
    }
  }
  
  // Override getUserMedia to prevent media device fingerprinting
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    
    navigator.mediaDevices.getUserMedia = function(constraints) {
      // Add minimal constraints randomization
      const modifiedConstraints = { ...constraints };
      
      if (modifiedConstraints.audio === true) {
        modifiedConstraints.audio = {
          echoCancellation: Math.random() > 0.5,
          noiseSuppression: Math.random() > 0.5,
          autoGainControl: Math.random() > 0.5
        };
      }
      
      return originalGetUserMedia.call(this, modifiedConstraints);
    };
  }
})();
`.trim();
}