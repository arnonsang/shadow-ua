import { describe, it, expect, afterEach } from 'vitest';
import {
  generateModularUA,
  generateMultipleModularUAStrings,
  exportUAs,
  exportToK6,
  loadProxyList,
  rotateProxy,
  Browser,
  Platform,
  DeviceType,
  ExportFormat,
} from '../../src/index';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

describe('End-to-End Integration Tests', () => {
  // Clean up test files
  afterEach(() => {
    const testFiles = ['test-proxies.txt', 'test-uas.txt'];
    testFiles.forEach(file => {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should generate, filter, and export UAs for a security testing scenario', () => {
      // Scenario: Security tester needs Chrome UAs for Windows testing
      const filter = {
        browser: Browser.Chrome,
        platform: Platform.Windows,
        deviceType: DeviceType.Desktop,
      };

      // Generate multiple UAs
      const uas = generateMultipleModularUAStrings(10, filter, true);
      
      expect(uas).toHaveLength(10);
      uas.forEach(ua => {
        expect(ua).toMatch(/Mozilla\/5\.0/);
        expect(ua).toMatch(/Windows/);
        expect(ua).toMatch(/Chrome/);
        expect(ua).not.toMatch(/Mobile/);
      });

      // Export for different tools
      const k6Script = exportToK6(uas);
      expect(k6Script).toContain('import http from \'k6/http\';');
      expect(k6Script).toContain('const userAgents = [');
      
      const jsonExport = exportUAs(uas, { format: ExportFormat.JSON, count: 10 });
      const parsed = JSON.parse(jsonExport);
      expect(parsed.count).toBe(10);
      expect(parsed.userAgents).toHaveLength(10);
    });

    it('should handle mobile testing scenario with device variety', () => {
      // Scenario: Mobile app testing across different Android devices
      const filter = {
        platform: Platform.Android,
        deviceType: DeviceType.Mobile,
      };

      const components = Array.from({ length: 20 }, () => generateModularUA(filter));
      
      // Should have device models
      components.forEach(component => {
        expect(component.platform).toBe(Platform.Android);
        expect(component.deviceType).toBe(DeviceType.Mobile);
        expect(component.deviceModel).toBeDefined();
        expect(component.userAgent).toContain(component.deviceModel!);
        expect(component.userAgent).toMatch(/Android/);
        expect(component.userAgent).toMatch(/Mobile/);
      });

      // Should have variety in device models
      const deviceModels = new Set(components.map(c => c.deviceModel));
      expect(deviceModels.size).toBeGreaterThan(3); // Should have variety
    });

    it('should integrate with proxy rotation for realistic testing', () => {
      // Create test proxy file
      const proxyData = [
        '127.0.0.1:8080',
        '127.0.0.1:8081',
        'http://127.0.0.1:8082',
        'http://user:pass@127.0.0.1:8083',
      ].join('\n');
      writeFileSync('test-proxies.txt', proxyData);

      // Load proxies
      const proxies = loadProxyList('test-proxies.txt');
      expect(proxies).toHaveLength(4);

      // Generate UAs with proxy rotation
      const testRequests = Array.from({ length: 10 }, (_, i) => {
        const ua = generateModularUA({
          browser: Browser.Chrome,
          platform: Platform.Windows,
        });
        
        const proxy = rotateProxy(proxies, 'round-robin');
        
        return {
          userAgent: ua.userAgent,
          proxy: `${proxy.host}:${proxy.port}`,
          iteration: i,
        };
      });

      // Verify all components
      expect(testRequests).toHaveLength(10);
      testRequests.forEach(request => {
        expect(request.userAgent).toMatch(/Chrome/);
        expect(request.userAgent).toMatch(/Windows/);
        expect(request.proxy).toMatch(/127\.0\.0\.1:\d+/);
      });

      // Verify proxy rotation
      const uniqueProxies = new Set(testRequests.map(r => r.proxy));
      expect(uniqueProxies.size).toBeGreaterThan(1);
    });

    it('should support cross-platform browser testing', () => {
      // Scenario: Test same browser across different platforms
      const platforms = [Platform.Windows, Platform.macOS, Platform.Linux];
      const browser = Browser.Firefox;

      const results = platforms.map(platform => {
        const components = generateMultipleModularUAStrings(5, { browser, platform });
        return {
          platform,
          userAgents: components,
        };
      });

      expect(results).toHaveLength(3);
      
      results.forEach(({ platform, userAgents }) => {
        expect(userAgents).toHaveLength(5);
        userAgents.forEach(ua => {
          expect(ua).toMatch(/Firefox/);
          
          switch (platform) {
            case Platform.Windows:
              expect(ua).toMatch(/Windows/);
              break;
            case Platform.macOS:
              expect(ua).toMatch(/Macintosh/);
              break;
            case Platform.Linux:
              expect(ua).toMatch(/Linux/);
              break;
          }
        });
      });
    });

    it('should handle load testing scenario with weighted distribution', () => {
      // Scenario: Load testing with realistic browser distribution
      const uas = generateMultipleModularUAStrings(100, undefined, true);
      
      expect(uas).toHaveLength(100);
      
      // Analyze distribution
      const browserCounts = {
        Chrome: 0,
        Firefox: 0,
        Safari: 0,
        Edge: 0,
      };

      uas.forEach(ua => {
        if (ua.includes('Chrome/') && !ua.includes('Edg/')) browserCounts.Chrome++;
        else if (ua.includes('Firefox/')) browserCounts.Firefox++;
        else if (ua.includes('Safari/') && ua.includes('Version/')) browserCounts.Safari++;
        else if (ua.includes('Edg/')) browserCounts.Edge++;
      });

      // Chrome should dominate due to market share weighting
      expect(browserCounts.Chrome).toBeGreaterThan(browserCounts.Firefox);
      expect(browserCounts.Chrome).toBeGreaterThan(browserCounts.Edge);
      
      // Should have some variety
      const nonZeroBrowsers = Object.values(browserCounts).filter(count => count > 0);
      expect(nonZeroBrowsers.length).toBeGreaterThan(1);
    });

    it('should support custom UA pool workflow', () => {
      // Create custom UA file
      const customUAs = [
        'Mozilla/5.0 (Custom Test) TestBrowser/1.0',
        'Mozilla/5.0 (Another Custom) AnotherBrowser/2.0',
        'CustomUserAgent/3.0 (Testing Suite)',
      ];
      writeFileSync('test-uas.txt', customUAs.join('\n'));

      // This would be tested via CLI in real usage
      // For integration test, we verify the file exists and has correct format
      expect(existsSync('test-uas.txt')).toBe(true);
      
      // Verify export works with custom data
      const exported = exportUAs(customUAs, { format: ExportFormat.CSV, count: 3 });
      expect(exported).toContain('id,user_agent');
      expect(exported).toContain('TestBrowser');
      expect(exported).toContain('AnotherBrowser');
    });
  });

  describe('Performance and Scale Testing', () => {
    it('should handle large-scale UA generation efficiently', () => {
      const startTime = Date.now();
      
      // Generate 1000 UAs
      const uas = generateMultipleModularUAStrings(1000);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(uas).toHaveLength(1000);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      
      // Verify uniqueness
      const uniqueUAs = new Set(uas);
      expect(uniqueUAs.size).toBeGreaterThan(700); // Should have reasonable variety (70%+ unique)
    });

    it('should maintain quality with rapid generation', () => {
      // Generate many UAs quickly and verify they're all valid
      const rapidUAs = Array.from({ length: 100 }, () => generateModularUA());
      
      rapidUAs.forEach(ua => {
        // All should have required components
        expect(ua.userAgent).toMatch(/Mozilla\/5\.0/);
        expect(ua.browserVersion).toBeDefined();
        expect(ua.engineVersion).toBeDefined();
        expect(ua.osString).toBeDefined();
        
        // Platform should match expected patterns
        switch (ua.platform) {
          case Platform.Windows:
            expect(ua.userAgent).toMatch(/Windows/);
            break;
          case Platform.macOS:
            expect(ua.userAgent).toMatch(/Macintosh/);
            break;
          case Platform.Linux:
            expect(ua.userAgent).toMatch(/Linux/);
            break;
          case Platform.Android:
            expect(ua.userAgent).toMatch(/Android/);
            break;
          case Platform.iOS:
            expect(ua.userAgent).toMatch(/iPhone|iPad/);
            break;
        }
      });
    });
  });

  describe('Real-world Compatibility', () => {
    it('should generate UAs that pass basic parsing', () => {
      const uas = generateMultipleModularUAStrings(50);
      
      uas.forEach(ua => {
        // Should have basic Mozilla format
        expect(ua).toMatch(/^Mozilla\/\d+\.\d+/);
        
        // Should have engine info
        expect(ua).toMatch(/AppleWebKit\/[\d.]+|Gecko\/\d+/);
        
        // Should have browser info
        expect(ua).toMatch(/Chrome\/[\d.]+|Firefox\/[\d.]+|Safari\/[\d.]+|Edg\/[\d.]+|Version\/[\d.]+/);
        
        // Should not have malformed parentheses
        const openParens = (ua.match(/\(/g) || []).length;
        const closeParens = (ua.match(/\)/g) || []).length;
        expect(openParens).toBe(closeParens);
      });
    });

    it('should generate platform-appropriate UAs', () => {
      // Test each platform has appropriate characteristics
      const platformTests = [
        { platform: Platform.Windows, pattern: /Windows NT \d+\.\d+/ },
        { platform: Platform.macOS, pattern: /Intel Mac OS X \d+_\d+_\d+/ },
        { platform: Platform.Linux, pattern: /X11; Linux/ },
        { platform: Platform.Android, pattern: /Linux; Android \d+/ },
        { platform: Platform.iOS, pattern: /(iPhone|iPad); CPU .*OS \d+_\d+.*like Mac OS X/ },
      ];

      platformTests.forEach(({ platform, pattern }) => {
        const uas = generateMultipleModularUAStrings(10, { platform });
        
        uas.forEach(ua => {
          expect(ua).toMatch(pattern);
        });
      });
    });
  });

  describe('Export Integration', () => {
    it('should produce valid export formats for security tools', () => {
      const uas = generateMultipleModularUAStrings(5, {
        browser: Browser.Chrome,
        platform: Platform.Windows,
      });

      // Test k6 export
      const k6Export = exportToK6(uas);
      expect(k6Export).toContain('import http from \'k6/http\';');
      expect(k6Export).toContain('export default function ()');
      expect(k6Export).toContain('Math.floor(Math.random()');
      
      // Should contain actual UAs
      uas.forEach(ua => {
        expect(k6Export).toContain(ua.replace(/"/g, '\\"'));
      });

      // Test JSON export validity
      const jsonExport = exportUAs(uas, { format: ExportFormat.JSON, count: 5 });
      expect(() => JSON.parse(jsonExport)).not.toThrow();
      
      const parsed = JSON.parse(jsonExport);
      expect(parsed.userAgents).toEqual(uas);

      // Test CSV export structure
      const csvExport = exportUAs(uas, { format: ExportFormat.CSV, count: 5 });
      const lines = csvExport.split('\n');
      expect(lines[0]).toBe('id,user_agent');
      expect(lines.length).toBe(6); // Header + 5 data lines
    });
  });
});