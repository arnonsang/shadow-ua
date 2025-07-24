import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateRandomUA,
  generateFilteredUA,
  generateWeightedRandomUA,
  generateWeightedFilteredUA,
  loadCustomUAPool,
  generateFromCustomPool,
  getCustomUAPool,
  resetCustomUAPool,
} from '../../src/core/generator';
import { Platform, Browser, DeviceType } from '../../src/types';
import { writeFileSync, unlinkSync } from 'fs';

describe('UA Generator', () => {
  describe('generateRandomUA', () => {
    it('should generate a valid User-Agent string', () => {
      const ua = generateRandomUA();
      expect(ua).toBeDefined();
      expect(typeof ua).toBe('string');
      expect(ua.length).toBeGreaterThan(0);
      expect(ua).toMatch(/Mozilla/);
    });

    it('should generate different UAs on multiple calls', () => {
      const uas = new Set();
      for (let i = 0; i < 20; i++) {
        uas.add(generateRandomUA());
      }
      // Should have some variety (at least 2 different UAs in 20 attempts)
      expect(uas.size).toBeGreaterThan(1);
    });
  });

  describe('generateFilteredUA', () => {
    it('should generate UAs filtered by platform', () => {
      const uas = generateFilteredUA({ platform: Platform.Windows }, 5);
      expect(uas).toHaveLength(5);
      uas.forEach(ua => {
        expect(ua).toMatch(/Windows/);
      });
    });

    it('should generate UAs filtered by browser', () => {
      const uas = generateFilteredUA({ browser: Browser.Chrome }, 3);
      expect(uas).toHaveLength(3);
      uas.forEach(ua => {
        expect(ua).toMatch(/Chrome/);
      });
    });

    it('should generate UAs filtered by device type', () => {
      const uas = generateFilteredUA({ deviceType: DeviceType.Mobile }, 3);
      expect(uas).toHaveLength(3);
      uas.forEach(ua => {
        expect(ua).toMatch(/Mobile/);
      });
    });

    it('should generate UAs with multiple filters', () => {
      const uas = generateFilteredUA({
        platform: Platform.Android,
        browser: Browser.Chrome,
        deviceType: DeviceType.Mobile,
      }, 2);
      
      expect(uas).toHaveLength(2);
      uas.forEach(ua => {
        expect(ua).toMatch(/Android/);
        expect(ua).toMatch(/Chrome/);
        expect(ua).toMatch(/Mobile/);
      });
    });

    it('should handle impossible filter combinations gracefully', () => {
      // The new modular generator should gracefully handle impossible combinations
      // by falling back to compatible options instead of throwing errors
      const result = generateFilteredUA({
        platform: Platform.iOS,
        browser: Browser.Chrome, // Chrome on iOS with desktop - will fallback to mobile iOS
        deviceType: DeviceType.Desktop,
      });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/iPhone|iPad/); // Should fallback to iOS mobile/tablet
      expect(result[0]).toMatch(/Chrome/); // Chrome is actually available on iOS
    });
  });

  describe('generateWeightedRandomUA', () => {
    it('should generate a weighted random UA', () => {
      const ua = generateWeightedRandomUA();
      expect(ua).toBeDefined();
      expect(typeof ua).toBe('string');
      expect(ua.length).toBeGreaterThan(0);
    });

    it('should respect filters in weighted generation', () => {
      const ua = generateWeightedRandomUA({ platform: Platform.macOS });
      expect(ua).toMatch(/Mac/);
    });

    it('should generate multiple weighted UAs', () => {
      const uas = generateWeightedFilteredUA({ browser: Browser.Safari }, 3);
      expect(uas).toHaveLength(3);
      uas.forEach(ua => {
        expect(ua).toMatch(/Safari/);
      });
    });
  });

  describe('Custom UA Pool', () => {
    const testUAFile = '/tmp/test-ua-pool.txt';
    const testUAs = [
      'Mozilla/5.0 (Test) TestBrowser/1.0',
      'Mozilla/5.0 (Another Test) AnotherBrowser/2.0',
      'Custom User Agent String',
    ];

    beforeEach(() => {
      // Clean up any existing custom pool
      try {
        unlinkSync(testUAFile);
      } catch (e) {
        // File doesn't exist, ignore
      }
    });

    afterEach(() => {
      try {
        unlinkSync(testUAFile);
      } catch (e) {
        // File doesn't exist, ignore
      }
    });

    it('should load custom UA pool from file', () => {
      writeFileSync(testUAFile, testUAs.join('\n'));
      
      loadCustomUAPool(testUAFile);
      const pool = getCustomUAPool();
      
      expect(pool).toHaveLength(3);
      expect(pool.map(ua => ua.userAgent)).toEqual(testUAs);
    });

    it('should generate UAs from custom pool', () => {
      writeFileSync(testUAFile, testUAs.join('\n'));
      
      loadCustomUAPool(testUAFile);
      const uas = generateFromCustomPool(5);
      
      expect(uas).toHaveLength(5);
      uas.forEach(ua => {
        expect(testUAs).toContain(ua);
      });
    });

    it('should throw error when generating from empty custom pool', () => {
      // Reset custom pool to ensure it's empty for this test
      resetCustomUAPool();
      
      expect(() => {
        generateFromCustomPool(1);
      }).toThrow('No custom UA pool loaded');
    });

    it('should throw error for non-existent file', () => {
      expect(() => {
        loadCustomUAPool('/non/existent/file.txt');
      }).toThrow();
    });
  });

  describe('Platform Detection', () => {
    it('should detect Windows platform', () => {
      writeFileSync('/tmp/windows-ua.txt', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      loadCustomUAPool('/tmp/windows-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].platform).toBe(Platform.Windows);
      unlinkSync('/tmp/windows-ua.txt');
    });

    it('should detect macOS platform', () => {
      writeFileSync('/tmp/macos-ua.txt', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      loadCustomUAPool('/tmp/macos-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].platform).toBe(Platform.macOS);
      unlinkSync('/tmp/macos-ua.txt');
    });

    it('should detect Android platform', () => {
      writeFileSync('/tmp/android-ua.txt', 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36');
      loadCustomUAPool('/tmp/android-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].platform).toBe(Platform.Android);
      unlinkSync('/tmp/android-ua.txt');
    });
  });

  describe('Browser Detection', () => {
    it('should detect Chrome browser', () => {
      writeFileSync('/tmp/chrome-ua.txt', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      loadCustomUAPool('/tmp/chrome-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].browser).toBe(Browser.Chrome);
      unlinkSync('/tmp/chrome-ua.txt');
    });

    it('should detect Firefox browser', () => {
      writeFileSync('/tmp/firefox-ua.txt', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0');
      loadCustomUAPool('/tmp/firefox-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].browser).toBe(Browser.Firefox);
      unlinkSync('/tmp/firefox-ua.txt');
    });

    it('should detect Edge browser', () => {
      writeFileSync('/tmp/edge-ua.txt', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0');
      loadCustomUAPool('/tmp/edge-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].browser).toBe(Browser.Edge);
      unlinkSync('/tmp/edge-ua.txt');
    });
  });

  describe('Device Type Detection', () => {
    it('should detect mobile device type', () => {
      writeFileSync('/tmp/mobile-ua.txt', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1');
      loadCustomUAPool('/tmp/mobile-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].deviceType).toBe(DeviceType.Mobile);
      unlinkSync('/tmp/mobile-ua.txt');
    });

    it('should detect tablet device type', () => {
      writeFileSync('/tmp/tablet-ua.txt', 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1');
      loadCustomUAPool('/tmp/tablet-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].deviceType).toBe(DeviceType.Tablet);
      unlinkSync('/tmp/tablet-ua.txt');
    });

    it('should default to desktop device type', () => {
      writeFileSync('/tmp/desktop-ua.txt', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      loadCustomUAPool('/tmp/desktop-ua.txt');
      const pool = getCustomUAPool();
      expect(pool[0].deviceType).toBe(DeviceType.Desktop);
      unlinkSync('/tmp/desktop-ua.txt');
    });
  });
});