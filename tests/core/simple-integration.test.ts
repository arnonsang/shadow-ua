import { describe, it, expect } from 'vitest';
import {
  generateModularUA,
  generateMultipleModularUAStrings,
  exportUAs,
  Browser,
  Platform,
  DeviceType,
  ExportFormat,
} from '../../src/index';

describe('Simple Integration Tests', () => {
  describe('Basic Generation', () => {
    it('should generate valid User-Agents', () => {
      const uas = generateMultipleModularUAStrings(10);
      
      expect(uas).toHaveLength(10);
      uas.forEach(ua => {
        expect(ua).toMatch(/Mozilla\/5\.0/);
        expect(ua.length).toBeGreaterThan(50);
      });
    });

    it('should generate Chrome UAs when requested', () => {
      const uas = generateMultipleModularUAStrings(5, { browser: Browser.Chrome });
      
      expect(uas).toHaveLength(5);
      uas.forEach(ua => {
        expect(ua).toMatch(/Chrome\/[\d.]+/);
      });
    });

    it('should generate Windows UAs when requested', () => {
      const uas = generateMultipleModularUAStrings(5, { platform: Platform.Windows });
      
      expect(uas).toHaveLength(5);
      uas.forEach(ua => {
        expect(ua).toMatch(/Windows/);
      });
    });

    it('should generate mobile UAs when requested', () => {
      const uas = generateMultipleModularUAStrings(5, { deviceType: DeviceType.Mobile });
      
      expect(uas).toHaveLength(5);
      uas.forEach(ua => {
        expect(ua).toMatch(/Mobile|iPhone|Android/);
      });
    });
  });

  describe('Component Details', () => {
    it('should return detailed components', () => {
      const result = generateModularUA();
      
      expect(result.userAgent).toBeDefined();
      expect(result.platform).toBeDefined();
      expect(result.browser).toBeDefined();
      expect(result.deviceType).toBeDefined();
      expect(result.browserVersion).toBeDefined();
      expect(result.engineVersion).toBeDefined();
      expect(result.osString).toBeDefined();
    });

    it('should have consistent component relationships', () => {
      const result = generateModularUA({ platform: Platform.Windows });
      
      expect(result.platform).toBe(Platform.Windows);
      expect(result.deviceType).toBe(DeviceType.Desktop);
      expect(result.osString).toContain('Windows');
      expect(result.userAgent).toContain(result.osString);
    });
  });

  describe('Export Functionality', () => {
    it('should export to different formats', () => {
      const uas = generateMultipleModularUAStrings(3);
      
      // JSON export
      const jsonOutput = exportUAs(uas, { format: ExportFormat.JSON, count: 3 });
      const parsed = JSON.parse(jsonOutput);
      expect(parsed.userAgents).toEqual(uas);
      expect(parsed.count).toBe(3);
      
      // CSV export
      const csvOutput = exportUAs(uas, { format: ExportFormat.CSV, count: 3 });
      expect(csvOutput).toContain('id,user_agent');
      expect(csvOutput).toContain(uas[0]);
      
      // Text export
      const txtOutput = exportUAs(uas, { format: ExportFormat.TXT, count: 3 });
      expect(txtOutput).toBe(uas.join('\n'));
    });
  });

  describe('Variety and Quality', () => {
    it('should generate variety in UAs', () => {
      const uas = generateMultipleModularUAStrings(20);
      const uniqueUAs = new Set(uas);
      
      expect(uniqueUAs.size).toBeGreaterThan(10); // Should have good variety
    });

    it('should generate realistic browser versions', () => {
      const results = Array.from({ length: 10 }, () => generateModularUA());
      
      results.forEach(result => {
        // Browser versions should be realistic
        const versionMatch = result.browserVersion.match(/^(\d+)/);
        if (versionMatch) {
          const majorVersion = parseInt(versionMatch[1]);
          
          // Different browsers have different version ranges
          if (result.browser === Browser.Safari) {
            expect(majorVersion).toBeGreaterThan(10); // Safari 10+
            expect(majorVersion).toBeLessThan(30); // Not too new
          } else {
            expect(majorVersion).toBeGreaterThan(80); // Chrome/Firefox/Edge 80+
            expect(majorVersion).toBeLessThan(150); // Not too new
          }
        }
      });
    });

    it('should have different platform distributions', () => {
      const results = Array.from({ length: 50 }, () => generateModularUA());
      const platforms = new Set(results.map(r => r.platform));
      
      expect(platforms.size).toBeGreaterThan(2); // Should have variety in platforms
    });
  });

  describe('Error Handling', () => {
    it('should handle valid filter combinations', () => {
      expect(() => {
        generateModularUA({
          browser: Browser.Chrome,
          platform: Platform.Windows,
          deviceType: DeviceType.Desktop,
        });
      }).not.toThrow();
    });

    it('should handle edge cases gracefully', () => {
      // Should not throw even with unusual combinations
      expect(() => {
        generateMultipleModularUAStrings(100);
      }).not.toThrow();
    });
  });
});