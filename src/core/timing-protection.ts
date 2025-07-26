import { Platform, Browser } from '../types';

export interface TimingConfig {
  minDelay: number;
  maxDelay: number;
  jitter: number;
  distributionType: 'uniform' | 'exponential' | 'normal' | 'poisson';
  burstProtection: boolean;
  adaptive: boolean;
}

export interface RequestTiming {
  delay: number;
  jitter: number;
  timestamp: number;
}

// Browser-specific timing patterns based on real-world behavior
const BROWSER_TIMING_PATTERNS = {
  [Browser.Chrome]: {
    baseDelay: { min: 50, max: 150 },
    jitter: { min: 5, max: 25 },
    burstLimit: 3,
    adaptiveThreshold: 0.8,
  },
  [Browser.Firefox]: {
    baseDelay: { min: 75, max: 200 },
    jitter: { min: 10, max: 30 },
    burstLimit: 2,
    adaptiveThreshold: 0.7,
  },
  [Browser.Safari]: {
    baseDelay: { min: 100, max: 250 },
    jitter: { min: 15, max: 35 },
    burstLimit: 2,
    adaptiveThreshold: 0.6,
  },
  [Browser.Edge]: {
    baseDelay: { min: 60, max: 180 },
    jitter: { min: 8, max: 28 },
    burstLimit: 3,
    adaptiveThreshold: 0.75,
  },
};

// Platform-specific network timing characteristics
const PLATFORM_NETWORK_PATTERNS = {
  [Platform.Windows]: {
    networkLatency: { min: 20, max: 80 },
    connectionOverhead: { min: 10, max: 30 },
  },
  [Platform.macOS]: {
    networkLatency: { min: 15, max: 60 },
    connectionOverhead: { min: 8, max: 25 },
  },
  [Platform.Linux]: {
    networkLatency: { min: 25, max: 100 },
    connectionOverhead: { min: 12, max: 35 },
  },
  [Platform.Android]: {
    networkLatency: { min: 100, max: 300 },
    connectionOverhead: { min: 30, max: 80 },
  },
  [Platform.iOS]: {
    networkLatency: { min: 80, max: 250 },
    connectionOverhead: { min: 25, max: 60 },
  },
};

class TimingProtection {
  private requestHistory: number[] = [];
  private lastRequestTime: number = 0;
  private burstCount: number = 0;
  private adaptiveMultiplier: number = 1.0;

  constructor(
    private browser: Browser,
    private platform: Platform,
    private config: Partial<TimingConfig> = {}
  ) {}

  /**
   * Generate realistic timing delay based on browser and platform characteristics
   */
  generateTiming(): RequestTiming {
    const browserPattern = BROWSER_TIMING_PATTERNS[this.browser];
    const platformPattern = PLATFORM_NETWORK_PATTERNS[this.platform];
    const now = Date.now();

    // Calculate base delay from browser patterns
    const baseMin = browserPattern.baseDelay.min + platformPattern.networkLatency.min;
    const baseMax = browserPattern.baseDelay.max + platformPattern.networkLatency.max;
    
    let delay: number;
    
    // Apply distribution type
    switch (this.config.distributionType || 'normal') {
      case 'uniform':
        delay = this.uniformRandom(baseMin, baseMax);
        break;
      case 'exponential':
        delay = this.exponentialRandom(baseMin, baseMax);
        break;
      case 'poisson':
        delay = this.poissonRandom(baseMin, baseMax);
        break;
      case 'normal':
      default:
        delay = this.normalRandom(baseMin, baseMax);
        break;
    }

    // Apply adaptive scaling if enabled
    if (this.config.adaptive !== false) {
      delay *= this.adaptiveMultiplier;
      this.updateAdaptiveMultiplier(now);
    }

    // Apply burst protection
    if (this.config.burstProtection !== false) {
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < 100) { // Rapid succession
        this.burstCount++;
        if (this.burstCount > browserPattern.burstLimit) {
          delay *= 2 + Math.random(); // Increase delay exponentially
        }
      } else {
        this.burstCount = 0;
      }
    }

    // Calculate jitter
    const jitterMin = browserPattern.jitter.min;
    const jitterMax = browserPattern.jitter.max;
    const jitter = this.uniformRandom(-jitterMax, jitterMax);

    // Apply final timing constraints
    delay = Math.max(delay, this.config.minDelay || baseMin);
    delay = Math.min(delay, this.config.maxDelay || baseMax * 3);

    // Record timing for analysis
    this.requestHistory.push(now);
    this.lastRequestTime = now;

    // Clean old history (keep last 100 requests)
    if (this.requestHistory.length > 100) {
      this.requestHistory = this.requestHistory.slice(-100);
    }

    return {
      delay: Math.round(delay),
      jitter: Math.round(jitter),
      timestamp: now,
    };
  }

  /**
   * Generate human-like mouse movement timing
   */
  generateMouseTiming(): { x: number; y: number; delay: number } {
    const browserPattern = BROWSER_TIMING_PATTERNS[this.browser];
    
    // Human mouse movements are typically 200-800ms apart
    const baseDelay = this.normalRandom(200, 800);
    const jitter = this.uniformRandom(-50, 50);
    
    return {
      x: Math.random() * 10 - 5, // Small movement variations
      y: Math.random() * 10 - 5,
      delay: Math.round(baseDelay + jitter),
    };
  }

  /**
   * Generate human-like keystroke timing
   */
  generateKeystrokeTiming(text: string): number[] {
    const timings: number[] = [];
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      let baseDelay: number;
      
      // Different timing for different character types
      if (char === ' ') {
        baseDelay = this.normalRandom(100, 200); // Space bar
      } else if (char >= 'A' && char <= 'Z') {
        baseDelay = this.normalRandom(150, 250); // Shift + letter
      } else if (/[0-9]/.test(char)) {
        baseDelay = this.normalRandom(120, 180); // Numbers
      } else if (/[.,!?;:]/.test(char)) {
        baseDelay = this.normalRandom(200, 300); // Punctuation (thinking pause)
      } else {
        baseDelay = this.normalRandom(80, 150); // Regular letters
      }
      
      // Add random variation
      const jitter = this.uniformRandom(-20, 20);
      timings.push(Math.round(baseDelay + jitter));
    }
    
    return timings;
  }

  /**
   * Analyze request patterns to detect potential bot behavior
   */
  analyzeRequestPattern(): {
    isRobotic: boolean;
    confidence: number;
    suggestions: string[];
  } {
    if (this.requestHistory.length < 10) {
      return {
        isRobotic: false,
        confidence: 0,
        suggestions: ['Insufficient data for analysis'],
      };
    }

    const intervals = [];
    for (let i = 1; i < this.requestHistory.length; i++) {
      intervals.push(this.requestHistory[i] - this.requestHistory[i - 1]);
    }

    // Calculate statistics
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficient = stdDev / mean;

    const suggestions: string[] = [];
    let roboticScore = 0;

    // Check for too regular patterns (low coefficient of variation)
    if (coefficient < 0.2) {
      roboticScore += 0.4;
      suggestions.push('Request timing is too regular - add more jitter');
    }

    // Check for suspiciously fast requests
    const fastRequests = intervals.filter(interval => interval < 50).length;
    if (fastRequests > intervals.length * 0.3) {
      roboticScore += 0.3;
      suggestions.push('Too many rapid-fire requests - slow down');
    }

    // Check for exact timing repetitions
    const uniqueIntervals = new Set(intervals);
    if (uniqueIntervals.size < intervals.length * 0.7) {
      roboticScore += 0.3;
      suggestions.push('Timing patterns repeat too often - increase randomization');
    }

    return {
      isRobotic: roboticScore > 0.5,
      confidence: roboticScore,
      suggestions,
    };
  }

  /**
   * Update adaptive multiplier based on recent request patterns
   */
  private updateAdaptiveMultiplier(currentTime: number): void {
    const recentRequests = this.requestHistory.filter(
      time => currentTime - time < 60000 // Last minute
    );

    if (recentRequests.length > 20) {
      // High request rate - slow down
      this.adaptiveMultiplier = Math.min(this.adaptiveMultiplier * 1.1, 3.0);
    } else if (recentRequests.length < 5) {
      // Low request rate - can speed up slightly
      this.adaptiveMultiplier = Math.max(this.adaptiveMultiplier * 0.95, 0.5);
    }
  }

  // Statistical distribution functions
  private uniformRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private normalRandom(min: number, max: number): number {
    // Box-Muller transformation for normal distribution
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    
    const mean = (min + max) / 2;
    const stdDev = (max - min) / 6; // 99.7% of values within range
    
    let result = mean + z * stdDev;
    result = Math.max(min, Math.min(max, result));
    
    return result;
  }

  private exponentialRandom(min: number, max: number): number {
    const lambda = 1 / ((max - min) / 3);
    const u = Math.random();
    let result = -Math.log(1 - u) / lambda;
    
    result = Math.max(min, Math.min(max, result + min));
    return result;
  }

  private poissonRandom(min: number, max: number): number {
    const lambda = (max - min) / 4;
    let result = 0;
    let p = Math.exp(-lambda);
    let s = p;
    const u = Math.random();
    
    while (u > s) {
      result++;
      p *= lambda / result;
      s += p;
    }
    
    result = Math.max(min, Math.min(max, result * 10 + min));
    return result;
  }
}

/**
 * Create a timing protection instance for a specific browser/platform combination
 */
export function createTimingProtection(
  browser: Browser,
  platform: Platform,
  config?: Partial<TimingConfig>
): TimingProtection {
  return new TimingProtection(browser, platform, config);
}

/**
 * Generate a timing delay that mimics human behavior
 */
export function generateHumanTiming(browser: Browser, platform: Platform): number {
  const protection = createTimingProtection(browser, platform);
  const timing = protection.generateTiming();
  return timing.delay + timing.jitter;
}

/**
 * Create a delay function that can be used with async operations
 */
export function createHumanDelay(browser: Browser, platform: Platform) {
  const protection = createTimingProtection(browser, platform);
  
  return async (): Promise<void> => {
    const timing = protection.generateTiming();
    const totalDelay = timing.delay + timing.jitter;
    
    return new Promise(resolve => {
      setTimeout(resolve, totalDelay);
    });
  };
}

/**
 * Generate script for client-side timing protection
 */
export function generateTimingProtectionScript(browser: Browser, platform: Platform): string {
  const browserPattern = BROWSER_TIMING_PATTERNS[browser];
  const platformPattern = PLATFORM_NETWORK_PATTERNS[platform];
  
  return `
// Client-side timing protection
(function() {
  const BROWSER_DELAYS = ${JSON.stringify(browserPattern)};
  const PLATFORM_DELAYS = ${JSON.stringify(platformPattern)};
  
  let lastActionTime = 0;
  let actionCount = 0;
  
  // Override setTimeout to add realistic variations
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(callback, delay, ...args) {
    // Add browser-specific jitter to timeouts
    const jitter = (Math.random() - 0.5) * BROWSER_DELAYS.jitter.max;
    const adjustedDelay = Math.max(0, delay + jitter);
    
    return originalSetTimeout.call(this, callback, adjustedDelay, ...args);
  };
  
  // Override setInterval with similar protection
  const originalSetInterval = window.setInterval;
  window.setInterval = function(callback, delay, ...args) {
    const jitter = (Math.random() - 0.5) * BROWSER_DELAYS.jitter.max;
    const adjustedDelay = Math.max(1, delay + jitter);
    
    return originalSetInterval.call(this, callback, adjustedDelay, ...args);
  };
  
  // Add timing protection to common DOM events
  const addHumanTiming = (originalFunction, context) => {
    return function(...args) {
      const now = Date.now();
      const timeSinceLastAction = now - lastActionTime;
      
      // If actions are too rapid, add a small delay
      if (timeSinceLastAction < BROWSER_DELAYS.baseDelay.min) {
        actionCount++;
        const extraDelay = Math.min(actionCount * 10, 100);
        
        setTimeout(() => {
          originalFunction.apply(context, args);
        }, extraDelay);
      } else {
        actionCount = Math.max(0, actionCount - 1);
        originalFunction.apply(context, args);
      }
      
      lastActionTime = now;
    };
  };
  
  // Protect mouse events
  if (document.addEventListener) {
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = function(type, listener, options) {
      if (type === 'click' || type === 'mousedown' || type === 'mouseup') {
        listener = addHumanTiming(listener, this);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
  
  // Protect form submissions
  if (HTMLFormElement.prototype.submit) {
    const originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = addHumanTiming(originalSubmit, HTMLFormElement.prototype);
  }
})();
`.trim();
}

export { TimingProtection };