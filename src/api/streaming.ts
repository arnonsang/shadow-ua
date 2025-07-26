import { Request, Response } from 'express';
import { UAFilter } from '../types';
import { createAsyncGenerator, AsyncGenerationOptions, GenerationResult } from '../core/async-generator';
import { generateModularUA } from '../core/modular-generator';
import { createTimingProtection } from '../core/timing-protection';

export interface StreamingConfig {
  maxConnections: number;
  heartbeatInterval: number; // milliseconds
  uaRotationInterval: number; // milliseconds
  bufferSize: number;
  compression: boolean;
  authentication?: {
    enabled: boolean;
    apiKey?: string;
    token?: string;
  };
}

export interface StreamingClient {
  id: string;
  response: Response;
  filters?: UAFilter;
  lastActivity: number;
  isActive: boolean;
  generatedCount: number;
  startTime: number;
  options?: Partial<AsyncGenerationOptions>;
}

export interface StreamEvent {
  type: 'ua' | 'heartbeat' | 'error' | 'stats' | 'config';
  data: any;
  timestamp: number;
  id?: string;
}

class StreamingManager {
  private clients: Map<string, StreamingClient> = new Map();
  private asyncGenerator: any;
  private heartbeatTimer?: NodeJS.Timeout;
  private rotationTimer?: NodeJS.Timeout;
  private statistics = {
    totalConnections: 0,
    activeConnections: 0,
    totalUAGenerated: 0,
    totalDataTransferred: 0,
    averageConnectionDuration: 0
  };

  constructor(private config: StreamingConfig) {
    // Initialize async generator for high-performance UA generation
    try {
      this.asyncGenerator = createAsyncGenerator({
        concurrency: 5,
        batchSize: 50,
        rateLimit: {
          maxPerSecond: 1000,
          burstSize: 100
        },
        caching: {
          enabled: true,
          maxSize: 2000,
          ttl: 300000 // 5 minutes
        },
        validation: {
          enabled: true,
          uniquenessCheck: false, // Disable for performance in streaming
          formatValidation: true
        }
      });
    } catch (error) {
      console.error('Failed to initialize async generator:', error);
      // Fallback to null, we'll handle this in generateAndSendUA
      this.asyncGenerator = null;
    }

    this.startHeartbeat();
    this.startUARotation();
  }

  /**
   * Handle new SSE connection
   */
  handleConnection(req: Request, res: Response): void {
    // Validate authentication if enabled
    if (this.config.authentication?.enabled) {
      const authResult = this.validateAuthentication(req);
      if (!authResult.valid) {
        res.status(401).json({ error: 'Unauthorized', message: authResult.message });
        return;
      }
    }

    // Check connection limit
    if (this.clients.size >= this.config.maxConnections) {
      res.status(429).json({ 
        error: 'Too Many Connections',
        message: `Maximum ${this.config.maxConnections} concurrent connections allowed`
      });
      return;
    }

    // Parse query parameters
    const filters = this.parseFilters(req.query);
    const options = this.parseOptions(req.query);

    // Generate unique client ID
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Set up SSE headers - use res.setHeader instead of res.writeHead for better error handling
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    res.setHeader('X-Client-ID', clientId);

    // Enable compression if configured
    if (this.config.compression) {
      res.setHeader('Content-Encoding', 'gzip');
    }

    // Write status code after headers are set
    res.statusCode = 200;

    // Create client record
    const client: StreamingClient = {
      id: clientId,
      response: res,
      filters,
      lastActivity: Date.now(),
      isActive: true,
      generatedCount: 0,
      startTime: Date.now(),
      options
    };

    this.clients.set(clientId, client);
    this.statistics.totalConnections++;
    this.statistics.activeConnections++;

    // Send initial connection event
    this.sendEvent(client, {
      type: 'config',
      data: {
        clientId,
        filters,
        heartbeatInterval: this.config.heartbeatInterval,
        rotationInterval: this.config.uaRotationInterval
      },
      timestamp: Date.now(),
      id: 'connection'
    });

    // Send initial User-Agent
    this.generateAndSendUA(client);

    // Handle client disconnect
    req.on('close', () => {
      this.handleDisconnection(clientId);
    });

    req.on('error', (error) => {
      console.error(`SSE connection error for client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });
  }

  /**
   * Validate authentication
   */
  private validateAuthentication(req: Request): { valid: boolean; message?: string } {
    const { authentication } = this.config;
    
    if (!authentication?.enabled) {
      return { valid: true };
    }

    // Check API key
    if (authentication.apiKey) {
      const providedKey = req.headers['x-api-key'] || req.query.apikey;
      if (providedKey !== authentication.apiKey) {
        return { valid: false, message: 'Invalid API key' };
      }
    }

    // Check bearer token
    if (authentication.token) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, message: 'Bearer token required' };
      }

      const token = authHeader.substring(7);
      if (token !== authentication.token) {
        return { valid: false, message: 'Invalid bearer token' };
      }
    }

    return { valid: true };
  }

  /**
   * Parse filters from query parameters
   */
  private parseFilters(query: any): UAFilter | undefined {
    const filters: UAFilter = {};

    if (query.browser) {
      filters.browser = query.browser;
    }

    if (query.platform) {
      filters.platform = query.platform;
    }

    if (query.deviceType) {
      filters.deviceType = query.deviceType;
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }

  /**
   * Parse options from query parameters
   */
  private parseOptions(query: any): Partial<AsyncGenerationOptions> | undefined {
    const options: Partial<AsyncGenerationOptions> = {};

    if (query.concurrency) {
      options.concurrency = parseInt(query.concurrency, 10);
    }

    if (query.batchSize) {
      options.batchSize = parseInt(query.batchSize, 10);
    }

    return Object.keys(options).length > 0 ? options : undefined;
  }

  /**
   * Generate and send User-Agent to client
   */
  private async generateAndSendUA(client: StreamingClient): Promise<void> {
    if (!client.isActive) return;

    try {
      let result;
      
      if (this.asyncGenerator) {
        // Use async generator if available
        const batch = await this.asyncGenerator.generateBatch(1, client.filters, client.options);
        if (batch.results.length > 0) {
          result = batch.results[0];
        }
      } else {
        // Fallback to simple generation
        const uaComponents = generateModularUA(client.filters);
        result = {
          userAgent: uaComponents.userAgent,
          components: {
            platform: uaComponents.platform,
            browser: uaComponents.browser,
            deviceType: uaComponents.deviceType,
            browserVersion: uaComponents.browserVersion,
            engineVersion: uaComponents.engineVersion,
            osString: uaComponents.osString,
            deviceModel: uaComponents.deviceModel
          },
          fingerprint: null,
          metadata: { generated: new Date().toISOString() }
        };
      }

      if (result) {
        this.sendEvent(client, {
          type: 'ua',
          data: {
            userAgent: result.userAgent,
            components: result.components,
            fingerprint: result.fingerprint,
            metadata: result.metadata
          },
          timestamp: Date.now(),
          id: `ua_${client.generatedCount}`
        });

        client.generatedCount++;
        client.lastActivity = Date.now();
        this.statistics.totalUAGenerated++;
      }
    } catch (error) {
      this.sendEvent(client, {
        type: 'error',
        data: {
          message: 'Failed to generate User-Agent',
          error: error instanceof Error ? error.message : String(error)
        },
        timestamp: Date.now(),
        id: 'error'
      });
    }
  }

  /**
   * Send SSE event to client
   */
  private sendEvent(client: StreamingClient, event: StreamEvent): void {
    if (!client.isActive || client.response.destroyed) {
      return;
    }

    try {
      const eventData = `id: ${event.id || Date.now()}\n` +
                       `event: ${event.type}\n` +
                       `data: ${JSON.stringify(event.data)}\n\n`;

      client.response.write(eventData);
      this.statistics.totalDataTransferred += eventData.length;
    } catch (error) {
      console.error(`Error sending event to client ${client.id}:`, error);
      this.handleDisconnection(client.id);
    }
  }

  /**
   * Broadcast event to all active clients
   */
  private broadcastEvent(event: StreamEvent, filter?: (client: StreamingClient) => boolean): void {
    for (const client of this.clients.values()) {
      if (client.isActive && (!filter || filter(client))) {
        this.sendEvent(client, event);
      }
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.isActive = false;
      
      // Update statistics
      this.statistics.activeConnections--;
      const connectionDuration = Date.now() - client.startTime;
      this.statistics.averageConnectionDuration = 
        (this.statistics.averageConnectionDuration * (this.statistics.totalConnections - 1) + connectionDuration) /
        this.statistics.totalConnections;

      this.clients.delete(clientId);
      console.log(`Client ${clientId} disconnected. Generated ${client.generatedCount} User-Agents.`);
    }
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      
      // Send heartbeat to all active clients
      this.broadcastEvent({
        type: 'heartbeat',
        data: {
          timestamp: now,
          activeClients: this.statistics.activeConnections,
          uptime: process.uptime()
        },
        timestamp: now,
        id: 'heartbeat'
      });

      // Clean up inactive clients
      for (const [clientId, client] of this.clients.entries()) {
        if (now - client.lastActivity > this.config.heartbeatInterval * 3) {
          console.log(`Client ${clientId} timed out`);
          this.handleDisconnection(clientId);
        }
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Start UA rotation timer
   */
  private startUARotation(): void {
    this.rotationTimer = setInterval(() => {
      // Send new User-Agent to all active clients
      for (const client of this.clients.values()) {
        if (client.isActive) {
          this.generateAndSendUA(client);
        }
      }
    }, this.config.uaRotationInterval);
  }

  /**
   * Handle statistics request
   */
  handleStatsRequest(req: Request, res: Response): void {
    const generatorStats = this.asyncGenerator ? this.asyncGenerator.getStatistics() : { fallback: true };
    
    const stats = {
      streaming: this.statistics,
      generator: generatorStats,
      clients: {
        active: this.statistics.activeConnections,
        total: this.statistics.totalConnections,
        list: Array.from(this.clients.values()).map(client => ({
          id: client.id,
          generatedCount: client.generatedCount,
          connectionDuration: Date.now() - client.startTime,
          lastActivity: client.lastActivity,
          filters: client.filters
        }))
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage()
      }
    };

    res.json(stats);
  }

  /**
   * Handle bulk generation request
   */
  async handleBulkRequest(req: Request, res: Response): Promise<void> {
    const { count = 10, filters, options } = req.body;

    if (count > 1000) {
      res.status(400).json({ error: 'Count exceeds maximum limit of 1000' });
      return;
    }

    try {
      if (this.asyncGenerator) {
        const batch = await this.asyncGenerator.generateBatch(count, filters, options);
        res.json({
          success: true,
          batch,
          statistics: this.asyncGenerator.getStatistics()
        });
      } else {
        // Fallback to simple generation
        const results = [];
        for (let i = 0; i < count; i++) {
          const uaComponents = generateModularUA(filters);
          results.push({
            userAgent: uaComponents.userAgent,
            components: {
              platform: uaComponents.platform,
              browser: uaComponents.browser,
              deviceType: uaComponents.deviceType,
              browserVersion: uaComponents.browserVersion,
              engineVersion: uaComponents.engineVersion,
              osString: uaComponents.osString,
              deviceModel: uaComponents.deviceModel
            },
            fingerprint: null,
            metadata: { generated: new Date().toISOString() }
          });
        }
        
        res.json({
          success: true,
          batch: {
            id: `fallback_${Date.now()}`,
            results,
            statistics: {
              totalRequested: count,
              successCount: results.length,
              failureCount: 0,
              processingTime: 0
            }
          },
          statistics: { fallback: true }
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Bulk generation failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }

    // Close all client connections
    for (const client of this.clients.values()) {
      if (client.isActive) {
        this.sendEvent(client, {
          type: 'config',
          data: { message: 'Server shutting down' },
          timestamp: Date.now(),
          id: 'shutdown'
        });
        client.response.end();
      }
    }

    this.clients.clear();
  }

  /**
   * Get current statistics
   */
  getStatistics(): typeof this.statistics {
    return { ...this.statistics };
  }
}

/**
 * Create streaming manager instance
 */
export function createStreamingManager(config: StreamingConfig): StreamingManager {
  return new StreamingManager(config);
}

/**
 * Generate client-side JavaScript for SSE consumption
 */
export function generateClientScript(): string {
  return `
// ShadowUA Streaming Client
class ShadowUAStream {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnect: true,
      reconnectDelay: 1000,
      maxReconnectAttempts: 5,
      ...options
    };
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.listeners = {};
    this.isConnected = false;
  }

  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    console.log('Connecting to ShadowUA stream...');
    
    // Handle both absolute and relative URLs
    let urlString = this.url;
    if (!this.url.startsWith('http')) {
      // For relative URLs, construct from current location
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      urlString = new URL(this.url, baseUrl).toString();
    }
    
    const url = new URL(urlString);
    
    // Add filters as query parameters
    if (this.options.filters) {
      Object.entries(this.options.filters).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    this.eventSource = new EventSource(url.toString());

    this.eventSource.onopen = (event) => {
      console.log('Connected to ShadowUA stream');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connect', event);
    };

    this.eventSource.onerror = (event) => {
      console.error('ShadowUA stream error:', event);
      this.isConnected = false;
      this.emit('error', event);
      
      if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(\`Reconnecting in \${this.options.reconnectDelay}ms (attempt \${this.reconnectAttempts})\`);
        
        setTimeout(() => {
          this.connect();
        }, this.options.reconnectDelay * this.reconnectAttempts);
      }
    };

    // Handle User-Agent events
    this.eventSource.addEventListener('ua', (event) => {
      const data = JSON.parse(event.data);
      this.emit('ua', data);
    });

    // Handle heartbeat events
    this.eventSource.addEventListener('heartbeat', (event) => {
      const data = JSON.parse(event.data);
      this.emit('heartbeat', data);
    });

    // Handle configuration events
    this.eventSource.addEventListener('config', (event) => {
      const data = JSON.parse(event.data);
      this.emit('config', data);
    });

    // Handle error events
    this.eventSource.addEventListener('error', (event) => {
      const data = JSON.parse(event.data);
      this.emit('streamError', data);
    });

    // Handle statistics events
    this.eventSource.addEventListener('stats', (event) => {
      const data = JSON.parse(event.data);
      this.emit('stats', data);
    });
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('Disconnected from ShadowUA stream');
      this.emit('disconnect');
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Convenience method for getting current UA
  getCurrentUA() {
    return this.lastUA;
  }

  // Auto-update User-Agent for requests
  setupAutoUpdate(intervalMs = 30000) {
    this.on('ua', (data) => {
      this.lastUA = data.userAgent;
      
      // Update fetch default headers if available
      if (typeof window !== 'undefined' && window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(input, init = {}) {
          init.headers = {
            ...init.headers,
            'User-Agent': this.lastUA
          };
          return originalFetch.call(this, input, init);
        }.bind(this);
      }
    });
  }
}

// Usage example:
/*
const stream = new ShadowUAStream('/api/stream', {
  filters: { browser: 'Chrome', platform: 'Windows' },
  reconnect: true
});

stream.on('ua', (data) => {
  console.log('New User-Agent:', data.userAgent);
  // Update your requests with the new UA
});

stream.on('connect', () => {
  console.log('Stream connected');
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});

stream.connect();
*/

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShadowUAStream;
} else if (typeof window !== 'undefined') {
  window.ShadowUAStream = ShadowUAStream;
}
`.trim();
}

export { StreamingManager };