import { Browser, Platform, DeviceType, UAFilter } from '../types';
import { generateModularUA, generateMultipleModularUA, UAComponents } from './modular-generator';
import { generateBrowserFingerprint } from '../integrations/browser-spoofing';
import { createTimingProtection } from './timing-protection';

export interface AsyncGenerationOptions {
  concurrency: number;
  batchSize: number;
  rateLimit?: {
    maxPerSecond: number;
    burstSize: number;
  };
  caching?: {
    enabled: boolean;
    maxSize: number;
    ttl: number; // milliseconds
  };
  validation?: {
    enabled: boolean;
    uniquenessCheck: boolean;
    formatValidation: boolean;
  };
  distribution?: {
    browsers?: Record<Browser, number>; // weights
    platforms?: Record<Platform, number>; // weights
    deviceTypes?: Record<DeviceType, number>; // weights
  };
}

export interface GenerationResult {
  userAgent: string;
  components: UAComponents;
  fingerprint?: any;
  metadata: {
    generatedAt: number;
    generationTime: number;
    batchId: string;
    index: number;
  };
}

export interface BatchResult {
  batchId: string;
  results: GenerationResult[];
  statistics: {
    totalCount: number;
    successCount: number;
    failureCount: number;
    uniqueCount?: number;
    averageGenerationTime: number;
    totalTime: number;
  };
  errors: Array<{
    index: number;
    error: string;
  }>;
}

export interface GenerationCache {
  key: string;
  result: GenerationResult;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

class AsyncUAGenerator {
  private cache: Map<string, GenerationCache> = new Map();
  private rateLimitTokens: number = 0;
  private lastRateLimitRefill: number = Date.now();
  private generationStats = {
    totalGenerated: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageTime: 0
  };

  constructor(private options: AsyncGenerationOptions) {
    // Initialize rate limiting
    if (this.options.rateLimit) {
      this.rateLimitTokens = this.options.rateLimit.burstSize;
    }

    // Setup cache cleanup if caching is enabled
    if (this.options.caching?.enabled) {
      setInterval(() => this.cleanupCache(), 60000); // Cleanup every minute
    }
  }

  /**
   * Generate multiple User-Agents asynchronously with batching
   */
  async generateBatch(
    count: number,
    filters?: UAFilter,
    options?: Partial<AsyncGenerationOptions>
  ): Promise<BatchResult> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };
    
    const results: GenerationResult[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    // Split into chunks for parallel processing
    const chunkSize = mergedOptions.batchSize;
    const chunks = Math.ceil(count / chunkSize);
    
    // Process chunks in parallel with concurrency limit
    const semaphore = new Semaphore(mergedOptions.concurrency);
    const chunkPromises: Promise<void>[] = [];

    for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
      const startIndex = chunkIndex * chunkSize;
      const endIndex = Math.min(startIndex + chunkSize, count);
      const chunkCount = endIndex - startIndex;

      const chunkPromise = semaphore.acquire().then(async (release) => {
        try {
          const chunkResults = await this.generateChunk(
            chunkCount,
            startIndex,
            batchId,
            filters,
            mergedOptions
          );
          
          results.push(...chunkResults.results);
          errors.push(...chunkResults.errors);
        } catch (error) {
          for (let i = startIndex; i < endIndex; i++) {
            errors.push({ index: i, error: error instanceof Error ? error.message : String(error) });
          }
        } finally {
          release();
        }
      });

      chunkPromises.push(chunkPromise);
    }

    // Wait for all chunks to complete
    await Promise.all(chunkPromises);

    // Sort results by index to maintain order
    results.sort((a, b) => a.metadata.index - b.metadata.index);

    const totalTime = Date.now() - startTime;
    const successCount = results.length;
    const failureCount = errors.length;
    const averageGenerationTime = successCount > 0 ? 
      results.reduce((sum, r) => sum + r.metadata.generationTime, 0) / successCount : 0;

    // Calculate uniqueness if validation is enabled
    let uniqueCount: number | undefined;
    if (mergedOptions.validation?.uniquenessCheck) {
      const uniqueUAs = new Set(results.map(r => r.userAgent));
      uniqueCount = uniqueUAs.size;
    }

    return {
      batchId,
      results,
      statistics: {
        totalCount: count,
        successCount,
        failureCount,
        uniqueCount,
        averageGenerationTime,
        totalTime
      },
      errors
    };
  }

  /**
   * Generate a single chunk of User-Agents
   */
  private async generateChunk(
    count: number,
    startIndex: number,
    batchId: string,
    filters?: UAFilter,
    options?: AsyncGenerationOptions
  ): Promise<{ results: GenerationResult[]; errors: Array<{ index: number; error: string }> }> {
    const results: GenerationResult[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    const chunkPromises = Array.from({ length: count }, async (_, i) => {
      const globalIndex = startIndex + i;
      
      try {
        // Apply rate limiting
        await this.waitForRateLimit();
        
        const result = await this.generateSingle(globalIndex, batchId, filters, options);
        results.push(result);
      } catch (error) {
        errors.push({ 
          index: globalIndex, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    await Promise.all(chunkPromises);

    return { results, errors };
  }

  /**
   * Generate a single User-Agent with caching and validation
   */
  private async generateSingle(
    index: number,
    batchId: string,
    filters?: UAFilter,
    options?: AsyncGenerationOptions
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    // Create cache key if caching is enabled
    let cacheKey: string | null = null;
    if (options?.caching?.enabled) {
      cacheKey = this.createCacheKey(filters, index);
      const cached = this.cache.get(cacheKey);
      
      if (cached && !this.isCacheExpired(cached)) {
        cached.accessCount++;
        cached.lastAccessed = Date.now();
        this.generationStats.cacheHits++;
        
        return {
          ...cached.result,
          metadata: {
            ...cached.result.metadata,
            batchId,
            index
          }
        };
      }
    }

    this.generationStats.cacheMisses++;

    // Generate User-Agent based on distribution weights
    const { browser, platform, deviceType } = this.selectRandomComponents(filters, options);
    const components = generateModularUA({ browser, platform, deviceType });
    
    // Generate fingerprint if requested
    let fingerprint: any = undefined;
    if (options?.validation?.enabled) {
      fingerprint = generateBrowserFingerprint(components);
    }

    const generationTime = Date.now() - startTime;
    
    const result: GenerationResult = {
      userAgent: components.userAgent,
      components,
      fingerprint,
      metadata: {
        generatedAt: Date.now(),
        generationTime,
        batchId,
        index
      }
    };

    // Validate result if validation is enabled
    if (options?.validation?.enabled) {
      this.validateResult(result, options);
    }

    // Cache result if caching is enabled
    if (cacheKey && options?.caching?.enabled) {
      this.cache.set(cacheKey, {
        key: cacheKey,
        result,
        createdAt: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now()
      });
    }

    // Update statistics
    this.generationStats.totalGenerated++;
    this.generationStats.averageTime = 
      (this.generationStats.averageTime * (this.generationStats.totalGenerated - 1) + generationTime) / 
      this.generationStats.totalGenerated;

    return result;
  }

  /**
   * Select random components based on distribution weights
   */
  private selectRandomComponents(
    filters?: UAFilter,
    options?: AsyncGenerationOptions
  ): { browser: Browser; platform: Platform; deviceType: DeviceType } {
    // Use filters if provided, otherwise use distribution weights
    let browser: Browser, platform: Platform, deviceType: DeviceType;

    // Browser selection
    if (filters?.browser) {
      browser = filters.browser;
    } else if (options?.distribution?.browsers) {
      browser = this.weightedRandomSelection(options.distribution.browsers);
    } else {
      const browsers = [Browser.Chrome, Browser.Firefox, Browser.Safari, Browser.Edge];
      browser = browsers[Math.floor(Math.random() * browsers.length)];
    }

    // Platform selection
    if (filters?.platform) {
      platform = filters.platform;
    } else if (options?.distribution?.platforms) {
      platform = this.weightedRandomSelection(options.distribution.platforms);
    } else {
      const platforms = [Platform.Windows, Platform.macOS, Platform.Linux, Platform.Android, Platform.iOS];
      platform = platforms[Math.floor(Math.random() * platforms.length)];
    }

    // Device type selection
    if (filters?.deviceType) {
      deviceType = filters.deviceType;
    } else if (options?.distribution?.deviceTypes) {
      deviceType = this.weightedRandomSelection(options.distribution.deviceTypes);
    } else {
      const deviceTypes = [DeviceType.Desktop, DeviceType.Mobile, DeviceType.Tablet];
      deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    }

    return { browser, platform, deviceType };
  }

  /**
   * Weighted random selection helper
   */
  private weightedRandomSelection<T>(weights: Record<string, number>): T {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [key, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return key as T;
      }
    }

    // Fallback to first option
    return Object.keys(weights)[0] as T;
  }

  /**
   * Validate generation result
   */
  private validateResult(result: GenerationResult, options?: AsyncGenerationOptions): void {
    if (!options?.validation?.enabled) return;

    // Format validation
    if (options.validation.formatValidation) {
      const uaRegex = /^Mozilla\/[\d\.]+ \([^)]+\) AppleWebKit\/[\d\.]+ \(KHTML, like Gecko\)/;
      if (!uaRegex.test(result.userAgent)) {
        throw new Error(`Invalid User-Agent format: ${result.userAgent}`);
      }
    }

    // Additional validations can be added here
    if (result.userAgent.length < 50 || result.userAgent.length > 500) {
      throw new Error(`User-Agent length out of range: ${result.userAgent.length}`);
    }
  }

  /**
   * Create cache key from filters and index
   */
  private createCacheKey(filters?: UAFilter, index?: number): string {
    const filterStr = filters ? JSON.stringify(filters) : 'default';
    return `${filterStr}_${index || 'single'}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isCacheExpired(entry: GenerationCache): boolean {
    if (!this.options.caching?.ttl) return false;
    return Date.now() - entry.createdAt > this.options.caching.ttl;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    if (!this.options.caching?.enabled) return;

    const maxSize = this.options.caching.maxSize || 1000;
    const now = Date.now();

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isCacheExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // Remove least recently used entries if over max size
    if (this.cache.size > maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
      
      const toRemove = entries.slice(0, entries.length - maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Wait for rate limit token
   */
  private async waitForRateLimit(): Promise<void> {
    if (!this.options.rateLimit) return;

    const now = Date.now();
    const timeSinceLastRefill = now - this.lastRateLimitRefill;
    
    // Refill tokens based on time passed
    const tokensToAdd = Math.floor(
      (timeSinceLastRefill / 1000) * this.options.rateLimit.maxPerSecond
    );
    
    if (tokensToAdd > 0) {
      this.rateLimitTokens = Math.min(
        this.options.rateLimit.burstSize,
        this.rateLimitTokens + tokensToAdd
      );
      this.lastRateLimitRefill = now;
    }

    // Wait if no tokens available
    if (this.rateLimitTokens <= 0) {
      const waitTime = 1000 / this.options.rateLimit.maxPerSecond;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimitTokens = 1;
    } else {
      this.rateLimitTokens--;
    }
  }

  /**
   * Get generation statistics
   */
  getStatistics(): {
    totalGenerated: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    averageGenerationTime: number;
    cacheSize: number;
  } {
    const cacheHitRate = this.generationStats.totalGenerated > 0 ? 
      this.generationStats.cacheHits / (this.generationStats.cacheHits + this.generationStats.cacheMisses) : 0;

    return {
      totalGenerated: this.generationStats.totalGenerated,
      cacheHits: this.generationStats.cacheHits,
      cacheMisses: this.generationStats.cacheMisses,
      cacheHitRate,
      averageGenerationTime: this.generationStats.averageTime,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear cache and reset statistics
   */
  reset(): void {
    this.cache.clear();
    this.generationStats = {
      totalGenerated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageTime: 0
    };
  }
}

/**
 * Simple semaphore implementation for concurrency control
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<() => void> {
    return new Promise<() => void>((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve(() => this.release());
      } else {
        this.waiting.push(() => resolve(() => this.release()));
      }
    });
  }

  private release(): void {
    if (this.waiting.length > 0) {
      const next = this.waiting.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}

/**
 * Create async UA generator instance
 */
export function createAsyncGenerator(options: AsyncGenerationOptions): AsyncUAGenerator {
  return new AsyncUAGenerator(options);
}

/**
 * Generate User-Agents in parallel with optimized defaults
 */
export async function generateParallel(
  count: number,
  filters?: UAFilter,
  options?: Partial<AsyncGenerationOptions>
): Promise<string[]> {
  const defaultOptions: AsyncGenerationOptions = {
    concurrency: Math.min(count, 10),
    batchSize: Math.min(count, 100),
    rateLimit: {
      maxPerSecond: 100,
      burstSize: 50
    },
    caching: {
      enabled: true,
      maxSize: 1000,
      ttl: 300000 // 5 minutes
    },
    validation: {
      enabled: true,
      uniquenessCheck: true,
      formatValidation: true
    }
  };

  const generator = createAsyncGenerator({ ...defaultOptions, ...options });
  const batch = await generator.generateBatch(count, filters, options);
  
  return batch.results.map(result => result.userAgent);
}

/**
 * Create streaming generator for continuous UA generation
 */
export function createStreamingGenerator(
  options: AsyncGenerationOptions
): AsyncGenerator<GenerationResult, void, unknown> {
  return (async function* () {
    const generator = new AsyncUAGenerator(options);
    let index = 0;
    
    while (true) {
      try {
        const result = await generator['generateSingle'](
          index++,
          `stream_${Date.now()}`,
          undefined,
          options
        );
        yield result;
      } catch (error) {
        console.error('Error in streaming generator:', error);
        // Continue generating despite errors
      }
    }
  })();
}

export { AsyncUAGenerator, Semaphore };