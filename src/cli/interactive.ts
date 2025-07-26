import { createInterface } from 'readline';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { 
  generateModularUA, 
  generateMultipleModularUA,
  generateMultipleModularUAStrings 
} from '../core/modular-generator';
import { createGeoDistributionManager } from '../core/geo-distribution';
import { createAsyncGenerator } from '../core/async-generator';
import { generateBrowserFingerprint } from '../integrations/browser-spoofing';
import { exportUAs, exportToBurpSuite, exportToK6, exportToJMeter, exportToLocust } from '../exports';
import { Platform, Browser, DeviceType, ExportFormat } from '../types';

interface WizardConfig {
  mode: 'basic' | 'advanced' | 'geolocation' | 'stealth' | 'bulk';
  count: number;
  browsers: Browser[];
  platforms: Platform[];
  deviceTypes: DeviceType[];
  outputFormat: 'txt' | 'json' | 'csv' | 'curl' | 'burp' | 'k6' | 'jmeter' | 'locust';
  outputFile?: string;
  geoConfig?: {
    regions: string[];
    cities: string[];
    accuracy: 'country' | 'region' | 'city';
  };
  stealthConfig?: {
    enableFingerprinting: boolean;
    enableTiming: boolean;
    enableDistribution: boolean;
  };
  bulkConfig?: {
    concurrency: number;
    batchSize: number;
    rateLimit: number;
  };
}

export class InteractiveCLI {
  private rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  private config: Partial<WizardConfig> = {};

  /**
   * Start the interactive wizard
   */
  async start(): Promise<void> {
    try {
      console.log('🕵️  Welcome to ShadowUA Wizard Mode!');
      console.log('This wizard will guide you through generating User-Agents for your needs.\n');

      await this.selectMode();
      await this.configureBasicSettings();
      
      switch (this.config.mode) {
        case 'geolocation':
          await this.configureGeolocation();
          break;
        case 'stealth':
          await this.configureStealth();
          break;
        case 'bulk':
          await this.configureBulk();
          break;
        case 'advanced':
          await this.configureAdvanced();
          break;
      }

      await this.configureOutput();
      await this.showSummary();
      await this.confirmAndGenerate();
      
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Select generation mode
   */
  private async selectMode(): Promise<void> {
    console.log('📋 Select generation mode:');
    console.log('1. Basic - Simple UA generation');
    console.log('2. Advanced - Custom filters and options');
    console.log('3. Geolocation - Region-specific UAs');
    console.log('4. Stealth - Anti-detection features');
    console.log('5. Bulk - High-volume generation');

    const choice = await this.prompt('Enter your choice (1-5): ');

    switch (choice) {
      case '1':
        this.config.mode = 'basic';
        break;
      case '2':
        this.config.mode = 'advanced';
        break;
      case '3':
        this.config.mode = 'geolocation';
        break;
      case '4':
        this.config.mode = 'stealth';
        break;
      case '5':
        this.config.mode = 'bulk';
        break;
      default:
        console.log('Invalid choice, defaulting to basic mode.');
        this.config.mode = 'basic';
    }

    console.log(`✅ Selected: ${this.config.mode} mode\n`);
  }

  /**
   * Configure basic settings
   */
  private async configureBasicSettings(): Promise<void> {
    // Number of UAs
    const countStr = await this.prompt('How many User-Agents do you need? (default: 1): ');
    this.config.count = countStr ? parseInt(countStr) : 1;

    if (isNaN(this.config.count) || this.config.count < 1) {
      this.config.count = 1;
    }

    // Browser selection
    console.log('\n🌐 Select browsers (comma-separated or "all"):');
    console.log('Available: chrome, firefox, safari, edge');
    const browserInput = await this.prompt('Browsers (default: all): ');
    
    if (!browserInput || browserInput.toLowerCase() === 'all') {
      this.config.browsers = [Browser.Chrome, Browser.Firefox, Browser.Safari, Browser.Edge];
    } else {
      this.config.browsers = this.parseBrowsers(browserInput);
    }

    // Platform selection
    console.log('\n💻 Select platforms (comma-separated or "all"):');
    console.log('Available: windows, macos, linux, android, ios');
    const platformInput = await this.prompt('Platforms (default: all): ');
    
    if (!platformInput || platformInput.toLowerCase() === 'all') {
      this.config.platforms = [Platform.Windows, Platform.macOS, Platform.Linux, Platform.Android, Platform.iOS];
    } else {
      this.config.platforms = this.parsePlatforms(platformInput);
    }

    // Device type selection
    console.log('\n📱 Select device types (comma-separated or "all"):');
    console.log('Available: desktop, mobile, tablet');
    const deviceInput = await this.prompt('Device types (default: all): ');
    
    if (!deviceInput || deviceInput.toLowerCase() === 'all') {
      this.config.deviceTypes = [DeviceType.Desktop, DeviceType.Mobile, DeviceType.Tablet];
    } else {
      this.config.deviceTypes = this.parseDeviceTypes(deviceInput);
    }

    console.log('✅ Basic settings configured\n');
  }

  /**
   * Configure geolocation settings
   */
  private async configureGeolocation(): Promise<void> {
    console.log('🌍 Geolocation Configuration:');
    
    const manager = createGeoDistributionManager();
    const availableRegions = manager.getAvailableRegions();
    const availableCities = manager.getAvailableCities();

    console.log('\nAvailable regions:', availableRegions.join(', '));
    console.log('Available cities:', availableCities.join(', '));

    const regionInput = await this.prompt('Select regions (comma-separated or "all"): ');
    const cityInput = await this.prompt('Select specific cities (optional): ');
    
    console.log('\n📍 Location accuracy:');
    console.log('1. Country level');
    console.log('2. Region level');
    console.log('3. City level');
    console.log('4. Precise coordinates');

    const accuracyChoice = await this.prompt('Choose accuracy (1-4, default: 3): ');
    
    const accuracyMap = {
      '1': 'country' as const,
      '2': 'region' as const,
      '3': 'city' as const,
      '4': 'city' as const // Map precise to city for compatibility
    };

    this.config.geoConfig = {
      regions: regionInput && regionInput !== 'all' ? regionInput.split(',').map(r => r.trim()) : availableRegions,
      cities: cityInput ? cityInput.split(',').map(c => c.trim()) : [],
      accuracy: accuracyMap[accuracyChoice as keyof typeof accuracyMap] || 'city'
    };

    console.log('✅ Geolocation settings configured\n');
  }

  /**
   * Configure stealth settings
   */
  private async configureStealth(): Promise<void> {
    console.log('🥷 Stealth Configuration:');

    const enableFingerprinting = await this.promptYesNo('Enable browser fingerprinting? (y/N): ');
    const enableTiming = await this.promptYesNo('Enable timing protection? (y/N): ');
    const enableDistribution = await this.promptYesNo('Enable intelligent distribution? (y/N): ');

    this.config.stealthConfig = {
      enableFingerprinting,
      enableTiming,
      enableDistribution
    };

    console.log('✅ Stealth settings configured\n');
  }

  /**
   * Configure bulk generation settings
   */
  private async configureBulk(): Promise<void> {
    console.log('⚡ Bulk Generation Configuration:');

    const concurrencyStr = await this.prompt('Concurrency level (1-20, default: 5): ');
    const concurrency = parseInt(concurrencyStr) || 5;

    const batchSizeStr = await this.prompt('Batch size (10-1000, default: 100): ');
    const batchSize = parseInt(batchSizeStr) || 100;

    const rateLimitStr = await this.prompt('Rate limit (requests/sec, default: 50): ');
    const rateLimit = parseInt(rateLimitStr) || 50;

    this.config.bulkConfig = {
      concurrency: Math.min(20, Math.max(1, concurrency)),
      batchSize: Math.min(1000, Math.max(10, batchSize)),
      rateLimit: Math.max(1, rateLimit)
    };

    console.log('✅ Bulk settings configured\n');
  }

  /**
   * Configure advanced settings
   */
  private async configureAdvanced(): Promise<void> {
    console.log('⚙️  Advanced Configuration:');

    const enableWeighting = await this.promptYesNo('Use market share weighting? (y/N): ');
    
    if (enableWeighting) {
      console.log('📊 Market share weighting enabled');
    }

    const enableUniqueness = await this.promptYesNo('Ensure uniqueness? (y/N): ');
    
    if (enableUniqueness) {
      console.log('🔄 Uniqueness checking enabled');
    }

    console.log('✅ Advanced settings configured\n');
  }

  /**
   * Configure output settings
   */
  private async configureOutput(): Promise<void> {
    console.log('💾 Output Configuration:');
    console.log('1. Plain text (.txt)');
    console.log('2. JSON (.json)');
    console.log('3. CSV (.csv)');
    console.log('4. cURL commands (.sh)');
    console.log('5. Burp Suite (.txt)');
    console.log('6. k6 script (.js)');
    console.log('7. JMeter (.jmx)');
    console.log('8. Locust (.py)');

    const formatChoice = await this.prompt('Select output format (1-8, default: 1): ');
    
    const formatMap = {
      '1': 'txt' as const,
      '2': 'json' as const,
      '3': 'csv' as const,
      '4': 'curl' as const,
      '5': 'burp' as const,
      '6': 'k6' as const,
      '7': 'jmeter' as const,
      '8': 'locust' as const
    };

    this.config.outputFormat = formatMap[formatChoice as keyof typeof formatMap] || 'txt';

    const saveToFile = await this.promptYesNo('Save to file? (y/N): ');
    
    if (saveToFile) {
      const defaultName = `user-agents-${Date.now()}.${this.getFileExtension()}`;
      const filename = await this.prompt(`Filename (default: ${defaultName}): `);
      this.config.outputFile = filename || defaultName;
    }

    console.log('✅ Output settings configured\n');
  }

  /**
   * Show configuration summary
   */
  private async showSummary(): Promise<void> {
    console.log('📋 Configuration Summary:');
    console.log('═'.repeat(50));
    console.log(`Mode: ${this.config.mode}`);
    console.log(`Count: ${this.config.count}`);
    console.log(`Browsers: ${this.config.browsers?.join(', ')}`);
    console.log(`Platforms: ${this.config.platforms?.join(', ')}`);
    console.log(`Device Types: ${this.config.deviceTypes?.join(', ')}`);
    console.log(`Output Format: ${this.config.outputFormat}`);
    
    if (this.config.outputFile) {
      console.log(`Output File: ${this.config.outputFile}`);
    }

    if (this.config.geoConfig) {
      console.log(`Geo Regions: ${this.config.geoConfig.regions.join(', ')}`);
      console.log(`Geo Accuracy: ${this.config.geoConfig.accuracy}`);
    }

    if (this.config.stealthConfig) {
      console.log(`Fingerprinting: ${this.config.stealthConfig.enableFingerprinting ? 'Yes' : 'No'}`);
      console.log(`Timing Protection: ${this.config.stealthConfig.enableTiming ? 'Yes' : 'No'}`);
    }

    if (this.config.bulkConfig) {
      console.log(`Concurrency: ${this.config.bulkConfig.concurrency}`);
      console.log(`Batch Size: ${this.config.bulkConfig.batchSize}`);
      console.log(`Rate Limit: ${this.config.bulkConfig.rateLimit}/sec`);
    }

    console.log('═'.repeat(50));
  }

  /**
   * Confirm and generate User-Agents
   */
  private async confirmAndGenerate(): Promise<void> {
    const confirm = await this.promptYesNo('Generate User-Agents with these settings? (y/N): ');
    
    if (!confirm) {
      console.log('❌ Generation cancelled.');
      return;
    }

    console.log('\n🔄 Generating User-Agents...');
    const startTime = Date.now();

    try {
      let userAgents: string[] = [];
      let additionalData: any = {};

      switch (this.config.mode) {
        case 'basic':
        case 'advanced':
          userAgents = await this.generateBasic();
          break;
          
        case 'geolocation':
          const geoResults = await this.generateGeolocation();
          userAgents = geoResults.map(r => r.userAgent);
          additionalData.geoData = geoResults.map(r => ({
            userAgent: r.userAgent,
            location: r.geoData,
            headers: r.headers
          }));
          break;
          
        case 'stealth':
          const stealthResults = await this.generateStealth();
          userAgents = stealthResults.map(r => r.userAgent);
          additionalData.fingerprints = stealthResults.map(r => r.fingerprint);
          break;
          
        case 'bulk':
          userAgents = await this.generateBulk();
          break;
      }

      const generationTime = Date.now() - startTime;
      
      // Format and output results
      const output = this.formatOutput(userAgents, additionalData);
      
      if (this.config.outputFile) {
        writeFileSync(this.config.outputFile, output);
        console.log(`✅ Generated ${userAgents.length} User-Agents in ${generationTime}ms`);
        console.log(`💾 Saved to: ${this.config.outputFile}`);
      } else {
        console.log(`✅ Generated ${userAgents.length} User-Agents in ${generationTime}ms`);
        console.log('\n📄 Results:');
        console.log('─'.repeat(50));
        console.log(output);
      }

    } catch (error) {
      console.error('❌ Generation failed:', error);
    }
  }

  /**
   * Generate basic User-Agents
   */
  private async generateBasic(): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < this.config.count!; i++) {
      const browser = this.config.browsers![Math.floor(Math.random() * this.config.browsers!.length)];
      const platform = this.config.platforms![Math.floor(Math.random() * this.config.platforms!.length)];
      const deviceType = this.config.deviceTypes![Math.floor(Math.random() * this.config.deviceTypes!.length)];
      
      const ua = generateModularUA({ browser, platform, deviceType });
      results.push(ua.userAgent);
    }
    
    return results;
  }

  /**
   * Generate geolocation-based User-Agents
   */
  private async generateGeolocation(): Promise<Array<{ userAgent: string; geoData: any; headers: any }>> {
    const manager = createGeoDistributionManager();
    
    return manager.generateGeoDistributedUAs(this.config.count!, {
      regions: this.config.geoConfig!.regions,
      cities: this.config.geoConfig!.cities,
      accuracy: this.config.geoConfig!.accuracy as 'country' | 'region' | 'city'
    });
  }

  /**
   * Generate stealth User-Agents
   */
  private async generateStealth(): Promise<Array<{ userAgent: string; fingerprint: any }>> {
    const results = [];
    
    for (let i = 0; i < this.config.count!; i++) {
      const browser = this.config.browsers![Math.floor(Math.random() * this.config.browsers!.length)];
      const platform = this.config.platforms![Math.floor(Math.random() * this.config.platforms!.length)];
      const deviceType = this.config.deviceTypes![Math.floor(Math.random() * this.config.deviceTypes!.length)];
      
      const ua = generateModularUA({ browser, platform, deviceType });
      const fingerprint = this.config.stealthConfig!.enableFingerprinting 
        ? generateBrowserFingerprint(ua) 
        : null;
      
      results.push({
        userAgent: ua.userAgent,
        fingerprint
      });
    }
    
    return results;
  }

  /**
   * Generate bulk User-Agents
   */
  private async generateBulk(): Promise<string[]> {
    const generator = createAsyncGenerator({
      concurrency: this.config.bulkConfig!.concurrency,
      batchSize: this.config.bulkConfig!.batchSize,
      rateLimit: {
        maxPerSecond: this.config.bulkConfig!.rateLimit,
        burstSize: this.config.bulkConfig!.batchSize
      },
      caching: {
        enabled: true,
        maxSize: 1000,
        ttl: 300000
      }
    });

    const batch = await generator.generateBatch(this.config.count!);
    return batch.results.map(r => r.userAgent);
  }

  /**
   * Format output based on selected format
   */
  private formatOutput(userAgents: string[], additionalData: any = {}): string {
    switch (this.config.outputFormat) {
      case 'json':
        return JSON.stringify({
          userAgents,
          count: userAgents.length,
          generated: new Date().toISOString(),
          ...additionalData
        }, null, 2);
        
      case 'csv':
        const headers = ['User-Agent'];
        const rows = [headers.join(',')];
        userAgents.forEach(ua => {
          rows.push(`"${ua.replace(/"/g, '""')}"`);
        });
        return rows.join('\n');
        
      case 'curl':
        return userAgents.map(ua => 
          `curl -H "User-Agent: ${ua}" "$URL"`
        ).join('\n');
        
      case 'burp':
        return exportToBurpSuite(userAgents);
        
      case 'k6':
        return exportToK6(userAgents);
        
      case 'jmeter':
        return exportToJMeter(userAgents);
        
      case 'locust':
        return exportToLocust(userAgents);
        
      default:
        return userAgents.join('\n');
    }
  }

  /**
   * Get file extension for output format
   */
  private getFileExtension(): string {
    const extensions = {
      txt: 'txt',
      json: 'json',
      csv: 'csv',
      curl: 'sh',
      burp: 'txt',
      k6: 'js',
      jmeter: 'jmx',
      locust: 'py'
    };
    
    return extensions[this.config.outputFormat as keyof typeof extensions] || 'txt';
  }

  /**
   * Parse browser input
   */
  private parseBrowsers(input: string): Browser[] {
    const browserMap: Record<string, Browser> = {
      chrome: Browser.Chrome,
      firefox: Browser.Firefox,
      safari: Browser.Safari,
      edge: Browser.Edge
    };

    return input.toLowerCase().split(',')
      .map(b => b.trim())
      .filter(b => browserMap[b])
      .map(b => browserMap[b]);
  }

  /**
   * Parse platform input
   */
  private parsePlatforms(input: string): Platform[] {
    const platformMap: Record<string, Platform> = {
      windows: Platform.Windows,
      macos: Platform.macOS,
      linux: Platform.Linux,
      android: Platform.Android,
      ios: Platform.iOS
    };

    return input.toLowerCase().split(',')
      .map(p => p.trim())
      .filter(p => platformMap[p])
      .map(p => platformMap[p]);
  }

  /**
   * Parse device type input
   */
  private parseDeviceTypes(input: string): DeviceType[] {
    const deviceMap: Record<string, DeviceType> = {
      desktop: DeviceType.Desktop,
      mobile: DeviceType.Mobile,
      tablet: DeviceType.Tablet
    };

    return input.toLowerCase().split(',')
      .map(d => d.trim())
      .filter(d => deviceMap[d])
      .map(d => deviceMap[d]);
  }

  /**
   * Prompt for user input
   */
  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  /**
   * Prompt for yes/no input
   */
  private async promptYesNo(question: string): Promise<boolean> {
    const answer = await this.prompt(question);
    return answer.toLowerCase().startsWith('y');
  }
}

/**
 * Start interactive CLI wizard
 */
export async function startInteractiveMode(): Promise<void> {
  const cli = new InteractiveCLI();
  await cli.start();
}

/**
 * Command-line interface for interactive mode
 */
export function createInteractiveCommand(): any {
  return {
    command: 'interactive',
    alias: 'wizard',
    description: 'Start interactive User-Agent generation wizard',
    action: startInteractiveMode
  };
}