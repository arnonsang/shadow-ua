import { describe, it, expect } from 'vitest';
import {
  generateModularUA,
  generateModularUAString,
  generateMultipleModularUA,
  generateMultipleModularUAStrings,
  getAvailableCombinations,
  OS_COMPONENTS,
  BROWSER_COMPONENTS,
  ENGINE_COMPONENTS,
  DEVICE_COMPONENTS,
} from '../../src/core/modular-generator';
import { Platform, Browser, DeviceType } from '../../src/types';

describe('Modular UA Generator', () => {
  describe('generateModularUA', () => {
    it('should generate a complete UA with all components', () => {
      const result = generateModularUA();
      
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('browser');
      expect(result).toHaveProperty('deviceType');
      expect(result).toHaveProperty('userAgent');
      expect(result).toHaveProperty('browserVersion');
      expect(result).toHaveProperty('engineVersion');
      expect(result).toHaveProperty('osString');
      
      expect(result.userAgent).toBeDefined();
      expect(typeof result.userAgent).toBe('string');
      expect(result.userAgent.length).toBeGreaterThan(0);
      expect(result.userAgent).toMatch(/Mozilla/);
    });

    it('should respect platform filter', () => {
      const result = generateModularUA({ platform: Platform.Windows });
      
      expect(result.platform).toBe(Platform.Windows);
      expect(result.deviceType).toBe(DeviceType.Desktop); // Windows should be desktop
      expect(result.userAgent).toMatch(/Windows/);
    });

    it('should respect browser filter', () => {
      const result = generateModularUA({ browser: Browser.Chrome });
      
      expect(result.browser).toBe(Browser.Chrome);
      expect(result.userAgent).toMatch(/Chrome/);
    });

    it('should respect device type filter', () => {
      const result = generateModularUA({ deviceType: DeviceType.Mobile });
      
      expect(result.deviceType).toBe(DeviceType.Mobile);
      expect([Platform.Android, Platform.iOS]).toContain(result.platform);
      expect(result.userAgent).toMatch(/Mobile|iPhone|Android/);
    });

    it('should generate mobile UAs with device models', () => {
      const result = generateModularUA({ 
        platform: Platform.Android, 
        deviceType: DeviceType.Mobile 
      });
      
      expect(result.platform).toBe(Platform.Android);
      expect(result.deviceType).toBe(DeviceType.Mobile);
      expect(result.deviceModel).toBeDefined();
      expect(result.userAgent).toContain(result.deviceModel);
    });

    it('should generate tablet UAs with device models', () => {
      const result = generateModularUA({ 
        platform: Platform.iOS, 
        deviceType: DeviceType.Tablet 
      });
      
      expect(result.platform).toBe(Platform.iOS);
      expect(result.deviceType).toBe(DeviceType.Tablet);
      expect(result.deviceModel).toBeDefined();
      expect(result.userAgent).toMatch(/iPad/);
    });

    it('should handle complex filter combinations', () => {
      const result = generateModularUA({
        platform: Platform.macOS,
        browser: Browser.Safari,
        deviceType: DeviceType.Desktop
      });
      
      expect(result.platform).toBe(Platform.macOS);
      expect(result.browser).toBe(Browser.Safari);
      expect(result.deviceType).toBe(DeviceType.Desktop);
      expect(result.userAgent).toMatch(/Macintosh/);
      expect(result.userAgent).toMatch(/Safari/);
    });

    it('should use weighted generation by default', () => {
      const results = Array.from({ length: 50 }, () => generateModularUA());
      
      // Chrome should appear more frequently due to higher weight
      const chromeCount = results.filter(r => r.browser === Browser.Chrome).length;
      const firefoxCount = results.filter(r => r.browser === Browser.Firefox).length;
      
      expect(chromeCount).toBeGreaterThan(firefoxCount);
    });

    it('should support non-weighted generation', () => {
      const result = generateModularUA(undefined, false);
      
      expect(result.userAgent).toBeDefined();
      expect(typeof result.userAgent).toBe('string');
    });
  });

  describe('generateModularUAString', () => {
    it('should return just the UA string', () => {
      const ua = generateModularUAString();
      
      expect(typeof ua).toBe('string');
      expect(ua.length).toBeGreaterThan(0);
      expect(ua).toMatch(/Mozilla/);
    });

    it('should respect filters in string generation', () => {
      const ua = generateModularUAString({ browser: Browser.Firefox });
      
      expect(ua).toMatch(/Firefox/);
    });
  });

  describe('generateMultipleModularUA', () => {
    it('should generate multiple UAs with components', () => {
      const results = generateMultipleModularUA(5);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('userAgent');
        expect(result).toHaveProperty('platform');
        expect(result).toHaveProperty('browser');
        expect(result.userAgent).toMatch(/Mozilla/);
      });
    });

    it('should respect filters for multiple generation', () => {
      const results = generateMultipleModularUA(3, { platform: Platform.Windows });
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.platform).toBe(Platform.Windows);
        expect(result.userAgent).toMatch(/Windows/);
      });
    });
  });

  describe('generateMultipleModularUAStrings', () => {
    it('should generate multiple UA strings', () => {
      const uas = generateMultipleModularUAStrings(4);
      
      expect(uas).toHaveLength(4);
      uas.forEach(ua => {
        expect(typeof ua).toBe('string');
        expect(ua).toMatch(/Mozilla/);
      });
    });

    it('should generate unique UAs', () => {
      const uas = generateMultipleModularUAStrings(10);
      const uniqueUAs = new Set(uas);
      
      // Should have some variety (at least 3 different UAs in 10 attempts)
      expect(uniqueUAs.size).toBeGreaterThan(2);
    });
  });

  describe('Component Data Validation', () => {
    it('should have valid OS components', () => {
      expect(OS_COMPONENTS).toBeDefined();
      expect(Array.isArray(OS_COMPONENTS)).toBe(true);
      expect(OS_COMPONENTS.length).toBeGreaterThan(0);
      
      OS_COMPONENTS.forEach(os => {
        expect(os).toHaveProperty('platform');
        expect(os).toHaveProperty('name');
        expect(os).toHaveProperty('versions');
        expect(os).toHaveProperty('weight');
        expect(Array.isArray(os.versions)).toBe(true);
        expect(os.versions.length).toBeGreaterThan(0);
        expect(typeof os.weight).toBe('number');
        expect(os.weight).toBeGreaterThan(0);
      });
    });

    it('should have valid browser components', () => {
      expect(BROWSER_COMPONENTS).toBeDefined();
      expect(Array.isArray(BROWSER_COMPONENTS)).toBe(true);
      expect(BROWSER_COMPONENTS.length).toBeGreaterThan(0);
      
      BROWSER_COMPONENTS.forEach(browser => {
        expect(browser).toHaveProperty('browser');
        expect(browser).toHaveProperty('name');
        expect(browser).toHaveProperty('versions');
        expect(browser).toHaveProperty('engines');
        expect(browser).toHaveProperty('platforms');
        expect(browser).toHaveProperty('weight');
        expect(Array.isArray(browser.versions)).toBe(true);
        expect(Array.isArray(browser.engines)).toBe(true);
        expect(Array.isArray(browser.platforms)).toBe(true);
        expect(browser.versions.length).toBeGreaterThan(0);
        expect(browser.engines.length).toBeGreaterThan(0);
        expect(browser.platforms.length).toBeGreaterThan(0);
      });
    });

    it('should have valid engine components', () => {
      expect(ENGINE_COMPONENTS).toBeDefined();
      expect(Array.isArray(ENGINE_COMPONENTS)).toBe(true);
      expect(ENGINE_COMPONENTS.length).toBeGreaterThan(0);
      
      ENGINE_COMPONENTS.forEach(engine => {
        expect(engine).toHaveProperty('name');
        expect(engine).toHaveProperty('versions');
        expect(engine).toHaveProperty('browsers');
        expect(engine).toHaveProperty('weight');
        expect(Array.isArray(engine.versions)).toBe(true);
        expect(Array.isArray(engine.browsers)).toBe(true);
        expect(engine.versions.length).toBeGreaterThan(0);
        expect(engine.browsers.length).toBeGreaterThan(0);
      });
    });

    it('should have valid device components', () => {
      expect(DEVICE_COMPONENTS).toBeDefined();
      expect(Array.isArray(DEVICE_COMPONENTS)).toBe(true);
      expect(DEVICE_COMPONENTS.length).toBeGreaterThan(0);
      
      DEVICE_COMPONENTS.forEach(device => {
        expect(device).toHaveProperty('platform');
        expect(device).toHaveProperty('deviceType');
        expect(device).toHaveProperty('models');
        expect(device).toHaveProperty('weight');
        expect(Array.isArray(device.models)).toBe(true);
        expect(device.models.length).toBeGreaterThan(0);
        expect(typeof device.weight).toBe('number');
        expect(device.weight).toBeGreaterThan(0);
      });
    });
  });

  describe('getAvailableCombinations', () => {
    it('should return combination statistics', () => {
      const stats = getAvailableCombinations();
      
      expect(stats).toHaveProperty('platforms');
      expect(stats).toHaveProperty('browsers');
      expect(stats).toHaveProperty('devices');
      expect(stats).toHaveProperty('totalCombinations');
      
      expect(Array.isArray(stats.platforms)).toBe(true);
      expect(Array.isArray(stats.browsers)).toBe(true);
      expect(Array.isArray(stats.devices)).toBe(true);
      expect(typeof stats.totalCombinations).toBe('number');
      expect(stats.totalCombinations).toBeGreaterThan(1000); // Should be many combinations
    });

    it('should respect filters in combination counting', () => {
      const stats = getAvailableCombinations({ platform: Platform.Windows });
      
      expect(stats.platforms).toEqual([Platform.Windows]);
      expect(stats.totalCombinations).toBeGreaterThan(0);
    });
  });

  describe('Platform-Browser Compatibility', () => {
    it('should not generate Safari on non-Apple platforms', () => {
      const results = generateMultipleModularUA(20, { 
        platform: Platform.Windows,
        browser: Browser.Safari 
      });
      
      // Should fallback to compatible browsers for Windows
      results.forEach(result => {
        expect(result.platform).toBe(Platform.Windows);
        expect([Browser.Chrome, Browser.Firefox, Browser.Edge]).toContain(result.browser);
      });
    });

    it('should not generate desktop UAs for mobile platforms', () => {
      const result = generateModularUA({ 
        platform: Platform.Android,
        deviceType: DeviceType.Desktop 
      });
      
      // Should fallback to mobile for Android
      expect(result.platform).toBe(Platform.Android);
      expect([DeviceType.Mobile, DeviceType.Tablet]).toContain(result.deviceType);
    });
  });

  describe('Browser-specific Template Validation', () => {
    it('should generate valid Chrome UAs', () => {
      const results = generateMultipleModularUA(10, { browser: Browser.Chrome });
      
      results.forEach(result => {
        expect(result.browser).toBe(Browser.Chrome);
        expect(result.userAgent).toMatch(/Chrome\/[\d.]+/);
        expect(result.userAgent).toMatch(/Safari\/[\d.]+/);
        expect(result.userAgent).toMatch(/AppleWebKit\/[\d.]+/);
      });
    });

    it('should generate valid Firefox UAs', () => {
      const results = generateMultipleModularUA(10, { browser: Browser.Firefox });
      
      results.forEach(result => {
        expect(result.browser).toBe(Browser.Firefox);
        expect(result.userAgent).toMatch(/Firefox\/[\d.]+/);
        expect(result.userAgent).toMatch(/Gecko\/\d+/);
        expect(result.userAgent).toMatch(/rv:[\d.]+/);
      });
    });

    it('should generate valid Safari UAs', () => {
      const results = generateMultipleModularUA(10, { browser: Browser.Safari });
      
      results.forEach(result => {
        expect(result.browser).toBe(Browser.Safari);
        expect(result.userAgent).toMatch(/Safari\/[\d.]+/);
        expect(result.userAgent).toMatch(/Version\/[\d.]+/);
        expect(result.userAgent).toMatch(/AppleWebKit\/[\d.]+/);
      });
    });

    it('should generate valid Edge UAs', () => {
      const results = generateMultipleModularUA(10, { browser: Browser.Edge });
      
      results.forEach(result => {
        expect(result.browser).toBe(Browser.Edge);
        expect(result.userAgent).toMatch(/Edg\/[\d.]+/);
        expect(result.userAgent).toMatch(/Chrome\/[\d.]+/);
        expect(result.userAgent).toMatch(/AppleWebKit\/[\d.]+/);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle impossible filter combinations gracefully', () => {
      // This should not throw but fallback to compatible combinations
      expect(() => {
        generateModularUA({
          platform: Platform.iOS,
          browser: Browser.Firefox,  // Firefox not typically on iOS
          deviceType: DeviceType.Desktop // iOS not desktop
        });
      }).not.toThrow();
    });
  });
});