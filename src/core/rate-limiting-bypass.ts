import { Browser, Platform, DeviceType } from '../types';
import { generateModularUA, generateMultipleModularUA } from './modular-generator';
import { createTimingProtection } from './timing-protection';
import { generateBrowserFingerprint } from '../integrations/browser-spoofing';

export interface RequestDistributionConfig {
  strategy: 'round-robin' | 'weighted' | 'adaptive' | 'geographic' | 'burst-control' | 'stealth';
  maxRequestsPerUA: number;
  cooldownPeriod: number; // milliseconds
  adaptiveThreshold: number; // error rate threshold for adaptive strategy
  burstSettings?: {
    maxBurst: number;
    burstWindow: number; // milliseconds
    recoveryTime: number; // milliseconds
  };
  geoDistribution?: {
    regions: string[];
    weights: Record<string, number>;
  };
  stealthSettings?: {
    enableRandomDelay: boolean;
    minDelay: number;
    maxDelay: number;
    jitterFactor: number;
  };
}

export interface DistributionNode {
  id: string;
  userAgent: string;
  browser: Browser;
  platform: Platform;
  deviceType: DeviceType;
  fingerprint?: any;
  requestCount: number;
  errorCount: number;
  successRate: number;
  lastUsed: number;
  createdAt: number;
  cooldownUntil: number;
  isActive: boolean;
  metadata: {
    region?: string;
    proxy?: string;
    timingProfile: any;
  };
}

export interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  currentErrorRate: number;
  activeNodes: number;
  requestsPerSecond: number;
  lastRequestTime: number;
}

export interface DistributionResult {
  node: DistributionNode;
  recommendedDelay: number;
  confidence: number;
  alternativeNodes: DistributionNode[];
  metadata: {
    strategy: string;
    selectionTime: number;
    poolHealth: number;
  };
}

class RequestDistributionManager {
  private nodes: Map<string, DistributionNode> = new Map();
  private metrics: RequestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    currentErrorRate: 0,
    activeNodes: 0,
    requestsPerSecond: 0,
    lastRequestTime: 0
  };
  private roundRobinIndex = 0;
  private burstTracker: Map<string, number[]> = new Map();
  private timingProtection: any;

  constructor(private config: RequestDistributionConfig) {
    this.timingProtection = createTimingProtection(Browser.Chrome, Platform.Windows, {
      distributionType: 'normal',
      burstProtection: true,
      adaptive: true
    });
    
    this.initializeNodePool();
    this.startHealthMonitoring();
  }

  /**
   * Initialize node pool with diverse User-Agents
   */
  private initializeNodePool(): void {
    const browsers = [Browser.Chrome, Browser.Firefox, Browser.Safari, Browser.Edge];
    const platforms = [Platform.Windows, Platform.macOS, Platform.Linux, Platform.Android, Platform.iOS];
    const deviceTypes = [DeviceType.Desktop, DeviceType.Mobile, DeviceType.Tablet];
    
    // Generate 50 diverse nodes for distribution
    const nodeCount = 50;
    const regions = this.config.geoDistribution?.regions || ['us-east', 'us-west', 'eu-west', 'ap-southeast'];
    
    for (let i = 0; i < nodeCount; i++) {
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      
      const ua = generateModularUA({ browser, platform, deviceType });
      const fingerprint = generateBrowserFingerprint(ua);
      const region = regions[Math.floor(Math.random() * regions.length)];
      
      const node: DistributionNode = {
        id: `node_${i}_${Date.now()}`,
        userAgent: ua.userAgent,
        browser,
        platform,
        deviceType,
        fingerprint,
        requestCount: 0,
        errorCount: 0,
        successRate: 1.0,
        lastUsed: 0,
        createdAt: Date.now(),
        cooldownUntil: 0,
        isActive: true,
        metadata: {
          region,
          timingProfile: this.timingProtection
        }
      };
      
      this.nodes.set(node.id, node);
    }
    
    this.metrics.activeNodes = this.nodes.size;
  }

  /**
   * Get next node based on distribution strategy
   */
  async getNextNode(): Promise<DistributionResult> {
    const startTime = Date.now();
    let selectedNode: DistributionNode;
    let confidence = 0.8; // Default confidence
    
    // Filter active nodes that are not in cooldown
    const availableNodes = Array.from(this.nodes.values()).filter(node => 
      node.isActive && 
      Date.now() > node.cooldownUntil &&
      node.requestCount < this.config.maxRequestsPerUA
    );
    
    if (availableNodes.length === 0) {
      // Emergency: reset cooldowns and generate new nodes if needed
      await this.handleEmergencyRotation();
      return this.getNextNode(); // Retry
    }
    
    switch (this.config.strategy) {
      case 'round-robin':
        selectedNode = this.selectRoundRobin(availableNodes);
        confidence = 0.9;
        break;
        
      case 'weighted':
        selectedNode = this.selectWeighted(availableNodes);
        confidence = 0.85;
        break;
        
      case 'adaptive':
        selectedNode = this.selectAdaptive(availableNodes);
        confidence = this.calculateAdaptiveConfidence(selectedNode);
        break;
        
      case 'geographic':
        selectedNode = this.selectGeographic(availableNodes);
        confidence = 0.8;
        break;
        
      case 'burst-control':
        selectedNode = await this.selectBurstControl(availableNodes);
        confidence = 0.75;
        break;
        
      case 'stealth':
        selectedNode = await this.selectStealth(availableNodes);
        confidence = 0.95;
        break;
        
      default:
        selectedNode = availableNodes[0];
        break;
    }
    
    // Calculate recommended delay
    const recommendedDelay = this.calculateRecommendedDelay(selectedNode);
    
    // Get alternative nodes
    const alternativeNodes = availableNodes
      .filter(node => node.id !== selectedNode.id)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);
    
    // Update node usage
    selectedNode.lastUsed = Date.now();
    selectedNode.requestCount++;
    this.metrics.totalRequests++;
    this.metrics.lastRequestTime = Date.now();
    
    // Calculate pool health
    const poolHealth = this.calculatePoolHealth();
    
    return {
      node: selectedNode,
      recommendedDelay,
      confidence,
      alternativeNodes,
      metadata: {
        strategy: this.config.strategy,
        selectionTime: Date.now() - startTime,
        poolHealth
      }
    };
  }

  /**
   * Round-robin selection
   */
  private selectRoundRobin(nodes: DistributionNode[]): DistributionNode {
    const node = nodes[this.roundRobinIndex % nodes.length];
    this.roundRobinIndex++;
    return node;
  }

  /**
   * Weighted selection based on success rate and usage
   */
  private selectWeighted(nodes: DistributionNode[]): DistributionNode {
    const weights = nodes.map(node => {
      const successWeight = node.successRate * 100;
      const usageWeight = Math.max(1, this.config.maxRequestsPerUA - node.requestCount);
      const recentnessWeight = Math.max(1, 10 - Math.floor((Date.now() - node.lastUsed) / 60000));
      
      return successWeight * usageWeight * recentnessWeight;
    });
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < nodes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return nodes[i];
      }
    }
    
    return nodes[0]; // Fallback
  }

  /**
   * Adaptive selection based on current performance
   */
  private selectAdaptive(nodes: DistributionNode[]): DistributionNode {
    // Sort by success rate and recent performance
    const sortedNodes = [...nodes].sort((a, b) => {
      const aScore = a.successRate * (1 - a.errorCount / Math.max(1, a.requestCount));
      const bScore = b.successRate * (1 - b.errorCount / Math.max(1, b.requestCount));
      return bScore - aScore;
    });
    
    // Select from top 25% performers with some randomization
    const topPerformers = sortedNodes.slice(0, Math.max(1, Math.floor(sortedNodes.length * 0.25)));
    return topPerformers[Math.floor(Math.random() * topPerformers.length)];
  }

  /**
   * Geographic distribution selection
   */
  private selectGeographic(nodes: DistributionNode[]): DistributionNode {
    if (!this.config.geoDistribution) {
      return this.selectWeighted(nodes);
    }
    
    const { regions, weights } = this.config.geoDistribution;
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedRegion = regions[0];
    for (const region of regions) {
      random -= weights[region] || 0;
      if (random <= 0) {
        selectedRegion = region;
        break;
      }
    }
    
    // Find nodes from selected region
    const regionNodes = nodes.filter(node => node.metadata.region === selectedRegion);
    if (regionNodes.length === 0) {
      return this.selectWeighted(nodes); // Fallback
    }
    
    return this.selectWeighted(regionNodes);
  }

  /**
   * Burst control selection
   */
  private async selectBurstControl(nodes: DistributionNode[]): Promise<DistributionNode> {
    if (!this.config.burstSettings) {
      return this.selectWeighted(nodes);
    }
    
    const { maxBurst, burstWindow } = this.config.burstSettings;
    const now = Date.now();
    
    // Filter nodes that haven't exceeded burst limits
    const availableNodes = nodes.filter(node => {
      const nodeId = node.id;
      const requests = this.burstTracker.get(nodeId) || [];
      
      // Remove old requests outside the burst window
      const recentRequests = requests.filter(time => now - time < burstWindow);
      this.burstTracker.set(nodeId, recentRequests);
      
      return recentRequests.length < maxBurst;
    });
    
    if (availableNodes.length === 0) {
      // Wait for burst recovery
      await new Promise(resolve => setTimeout(resolve, this.config.burstSettings!.recoveryTime));
      return this.selectWeighted(nodes);
    }
    
    const selectedNode = this.selectWeighted(availableNodes);
    
    // Track this request
    const requests = this.burstTracker.get(selectedNode.id) || [];
    requests.push(now);
    this.burstTracker.set(selectedNode.id, requests);
    
    return selectedNode;
  }

  /**
   * Stealth selection with advanced randomization
   */
  private async selectStealth(nodes: DistributionNode[]): Promise<DistributionNode> {
    // Add randomization to make selection unpredictable
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    
    // Select from nodes with different characteristics to avoid patterns
    const diverseNodes = this.selectDiverseNodes(shuffled, 5);
    
    // Apply stealth timing if configured
    if (this.config.stealthSettings?.enableRandomDelay) {
      const { minDelay, maxDelay } = this.config.stealthSettings;
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return this.selectWeighted(diverseNodes);
  }

  /**
   * Select diverse nodes to avoid fingerprinting patterns
   */
  private selectDiverseNodes(nodes: DistributionNode[], count: number): DistributionNode[] {
    const diverse: DistributionNode[] = [];
    const usedCombinations = new Set<string>();
    
    for (const node of nodes) {
      const combination = `${node.browser}-${node.platform}-${node.deviceType}`;
      
      if (!usedCombinations.has(combination) && diverse.length < count) {
        diverse.push(node);
        usedCombinations.add(combination);
      }
    }
    
    // Fill remaining slots with best performing nodes
    if (diverse.length < count) {
      const remaining = nodes
        .filter(node => !diverse.includes(node))
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, count - diverse.length);
      
      diverse.push(...remaining);
    }
    
    return diverse;
  }

  /**
   * Calculate recommended delay between requests
   */
  private calculateRecommendedDelay(node: DistributionNode): number {
    const baseDelay = 1000; // 1 second base
    
    // Adjust based on node performance
    const performanceMultiplier = 1 + (1 - node.successRate);
    
    // Adjust based on recent usage
    const usageMultiplier = 1 + (node.requestCount / this.config.maxRequestsPerUA) * 0.5;
    
    // Adjust based on current error rate
    const errorMultiplier = 1 + this.metrics.currentErrorRate * 2;
    
    // Add randomization to avoid patterns
    const jitter = this.config.stealthSettings?.jitterFactor || 0.2;
    const jitterMultiplier = 1 + (Math.random() - 0.5) * jitter;
    
    return Math.floor(baseDelay * performanceMultiplier * usageMultiplier * errorMultiplier * jitterMultiplier);
  }

  /**
   * Calculate adaptive confidence based on node performance
   */
  private calculateAdaptiveConfidence(node: DistributionNode): number {
    const baseConfidence = 0.5;
    const successRateBonus = node.successRate * 0.4;
    const usagePenalty = (node.requestCount / this.config.maxRequestsPerUA) * 0.1;
    const recentnesBonus = Math.max(0, 0.1 - (Date.now() - node.lastUsed) / 3600000); // Bonus for recent use
    
    return Math.min(1.0, Math.max(0.1, baseConfidence + successRateBonus - usagePenalty + recentnesBonus));
  }

  /**
   * Calculate overall pool health
   */
  private calculatePoolHealth(): number {
    const totalNodes = this.nodes.size;
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.isActive).length;
    const availableNodes = Array.from(this.nodes.values()).filter(n => 
      n.isActive && Date.now() > n.cooldownUntil && n.requestCount < this.config.maxRequestsPerUA
    ).length;
    
    const healthScore = (availableNodes / totalNodes) * 100;
    return Math.round(healthScore);
  }

  /**
   * Report request result and update metrics
   */
  reportResult(nodeId: string, success: boolean, responseTime: number): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    if (success) {
      this.metrics.successfulRequests++;
      node.successRate = (node.successRate * node.requestCount + 1) / (node.requestCount + 1);
    } else {
      this.metrics.failedRequests++;
      node.errorCount++;
      node.successRate = (node.successRate * node.requestCount) / (node.requestCount + 1);
      
      // Apply cooldown if error rate is high
      if (node.errorCount / node.requestCount > this.config.adaptiveThreshold) {
        node.cooldownUntil = Date.now() + this.config.cooldownPeriod;
      }
    }
    
    // Update global metrics
    this.metrics.currentErrorRate = this.metrics.failedRequests / this.metrics.totalRequests;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / this.metrics.totalRequests;
    
    // Calculate requests per second
    const timeDiff = Date.now() - this.metrics.lastRequestTime;
    if (timeDiff > 0) {
      this.metrics.requestsPerSecond = 1000 / timeDiff;
    }
  }

  /**
   * Handle emergency rotation when no nodes are available
   */
  private async handleEmergencyRotation(): Promise<void> {
    console.warn('Emergency rotation: No available nodes, generating new pool...');
    
    // Reset cooldowns for best performing nodes
    const sortedNodes = Array.from(this.nodes.values())
      .sort((a, b) => b.successRate - a.successRate);
    
    const topNodes = sortedNodes.slice(0, Math.min(10, sortedNodes.length));
    topNodes.forEach(node => {
      node.cooldownUntil = 0;
      node.requestCount = 0;
    });
    
    // Generate additional nodes if pool is too small
    if (this.nodes.size < 20) {
      this.initializeNodePool();
    }
  }

  /**
   * Start health monitoring and cleanup
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
      this.cleanupInactiveNodes();
      this.refreshUnderperformingNodes();
    }, 60000); // Every minute
  }

  /**
   * Perform periodic health check
   */
  private performHealthCheck(): void {
    let activeCount = 0;
    
    for (const node of this.nodes.values()) {
      // Reactivate nodes that have recovered
      if (!node.isActive && node.successRate > 0.7) {
        node.isActive = true;
        node.cooldownUntil = 0;
      }
      
      if (node.isActive) {
        activeCount++;
      }
    }
    
    this.metrics.activeNodes = activeCount;
    
    // Generate new nodes if pool is unhealthy
    if (activeCount < 10) {
      this.initializeNodePool();
    }
  }

  /**
   * Clean up inactive nodes
   */
  private cleanupInactiveNodes(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [nodeId, node] of this.nodes.entries()) {
      if (!node.isActive && node.lastUsed < cutoffTime) {
        this.nodes.delete(nodeId);
      }
    }
  }

  /**
   * Refresh underperforming nodes
   */
  private refreshUnderperformingNodes(): void {
    const underperformers = Array.from(this.nodes.values())
      .filter(node => node.successRate < 0.3 && node.requestCount > 10);
    
    underperformers.forEach(node => {
      // Generate new UA for underperforming node
      const ua = generateModularUA({ 
        browser: node.browser, 
        platform: node.platform, 
        deviceType: node.deviceType 
      });
      
      node.userAgent = ua.userAgent;
      node.fingerprint = generateBrowserFingerprint(ua);
      node.requestCount = 0;
      node.errorCount = 0;
      node.successRate = 1.0;
      node.isActive = true;
      node.cooldownUntil = 0;
    });
  }

  /**
   * Get current metrics and statistics
   */
  getMetrics(): RequestMetrics & {
    nodeStats: {
      total: number;
      active: number;
      inCooldown: number;
      averageSuccessRate: number;
      averageRequestCount: number;
    };
  } {
    const nodes = Array.from(this.nodes.values());
    const activeNodes = nodes.filter(n => n.isActive);
    const cooldownNodes = nodes.filter(n => Date.now() < n.cooldownUntil);
    
    const avgSuccessRate = activeNodes.length > 0 ? 
      activeNodes.reduce((sum, n) => sum + n.successRate, 0) / activeNodes.length : 0;
    
    const avgRequestCount = nodes.length > 0 ?
      nodes.reduce((sum, n) => sum + n.requestCount, 0) / nodes.length : 0;
    
    return {
      ...this.metrics,
      nodeStats: {
        total: nodes.length,
        active: activeNodes.length,
        inCooldown: cooldownNodes.length,
        averageSuccessRate: avgSuccessRate,
        averageRequestCount: avgRequestCount
      }
    };
  }

  /**
   * Get node details for monitoring
   */
  getNodeDetails(): DistributionNode[] {
    return Array.from(this.nodes.values())
      .sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Manually rotate a specific node
   */
  rotateNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    
    const ua = generateModularUA({ 
      browser: node.browser, 
      platform: node.platform, 
      deviceType: node.deviceType 
    });
    
    node.userAgent = ua.userAgent;
    node.fingerprint = generateBrowserFingerprint(ua);
    node.requestCount = 0;
    node.errorCount = 0;
    node.successRate = 1.0;
    node.cooldownUntil = 0;
    node.isActive = true;
    
    return true;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.nodes.clear();
    this.burstTracker.clear();
  }
}

/**
 * Create request distribution manager
 */
export function createRequestDistribution(config: RequestDistributionConfig): RequestDistributionManager {
  return new RequestDistributionManager(config);
}

/**
 * Generate HTTP client with intelligent request distribution
 */
export function generateHTTPClientWithDistribution(config: RequestDistributionConfig): string {
  return `
// HTTP Client with Intelligent Request Distribution
const axios = require('axios');
const ShadowUA = require('shadow-ua');

class DistributedHTTPClient {
  constructor(config) {
    this.distributionManager = ShadowUA.createRequestDistribution(config);
    this.requestQueue = [];
    this.isProcessing = false;
  }
  
  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const { url, options, resolve, reject } = this.requestQueue.shift();
      
      try {
        const result = await this.distributionManager.getNextNode();
        const { node, recommendedDelay } = result;
        
        // Apply recommended delay
        if (recommendedDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, recommendedDelay));
        }
        
        // Configure request with selected node
        const requestConfig = {
          ...options,
          headers: {
            'User-Agent': node.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            ...options.headers
          },
          timeout: 30000
        };
        
        const startTime = Date.now();
        
        try {
          const response = await axios({
            url,
            ...requestConfig
          });
          
          const responseTime = Date.now() - startTime;
          this.distributionManager.reportResult(node.id, true, responseTime);
          
          resolve(response);
        } catch (error) {
          const responseTime = Date.now() - startTime;
          this.distributionManager.reportResult(node.id, false, responseTime);
          
          reject(error);
        }
        
      } catch (error) {
        reject(error);
      }
    }
    
    this.isProcessing = false;
  }
  
  getMetrics() {
    return this.distributionManager.getMetrics();
  }
  
  getNodeDetails() {
    return this.distributionManager.getNodeDetails();
  }
}

// Usage example
const client = new DistributedHTTPClient({
  strategy: 'adaptive',
  maxRequestsPerUA: 10,
  cooldownPeriod: 300000, // 5 minutes
  adaptiveThreshold: 0.3,
  stealthSettings: {
    enableRandomDelay: true,
    minDelay: 1000,
    maxDelay: 3000,
    jitterFactor: 0.2
  }
});

module.exports = DistributedHTTPClient;
`.trim();
}

export { RequestDistributionManager };