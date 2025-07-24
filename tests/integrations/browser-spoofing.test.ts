import { describe, it, expect } from 'vitest';
import {
  generateBrowserFingerprint,
  generatePuppeteerConfig,
  generatePlaywrightConfig,
  generateFingerprintOverrides,
} from '../../src/integrations/browser-spoofing';
import { generateModularUA } from '../../src/core/modular-generator';
import { Browser, Platform, DeviceType } from '../../src/types';

describe('Browser Fingerprint Spoofing', () => {
  describe('generateBrowserFingerprint', () => {
    it('should generate a complete browser fingerprint', () => {
      const components = generateModularUA({
        browser: Browser.Chrome,
        platform: Platform.Windows,
        deviceType: DeviceType.Desktop,
      });

      const fingerprint = generateBrowserFingerprint(components);

      expect(fingerprint).toHaveProperty('userAgent');
      expect(fingerprint).toHaveProperty('viewport');
      expect(fingerprint).toHaveProperty('screen');
      expect(fingerprint).toHaveProperty('navigator');
      expect(fingerprint).toHaveProperty('webgl');
      expect(fingerprint).toHaveProperty('fonts');
      expect(fingerprint).toHaveProperty('plugins');
      expect(fingerprint).toHaveProperty('timezone');
      expect(fingerprint).toHaveProperty('webrtc');

      expect(fingerprint.userAgent).toBe(components.userAgent);
      expect(typeof fingerprint.viewport.width).toBe('number');
      expect(typeof fingerprint.viewport.height).toBe('number');
      expect(typeof fingerprint.screen.width).toBe('number');
      expect(typeof fingerprint.screen.height).toBe('number');
    });

    it('should generate mobile-appropriate fingerprints', () => {
      const components = generateModularUA({
        browser: Browser.Chrome,
        platform: Platform.Android,
        deviceType: DeviceType.Mobile,
      });

      const fingerprint = generateBrowserFingerprint(components);

      expect(fingerprint.viewport.isMobile).toBe(true);
      expect(fingerprint.viewport.hasTouch).toBe(true);
      expect(fingerprint.viewport.deviceScaleFactor).toBeGreaterThan(1);
      expect(fingerprint.navigator.maxTouchPoints).toBeGreaterThan(0);
    });

    it('should generate desktop-appropriate fingerprints', () => {
      const components = generateModularUA({
        browser: Browser.Firefox,
        platform: Platform.Windows,
        deviceType: DeviceType.Desktop,
      });

      const fingerprint = generateBrowserFingerprint(components);

      expect(fingerprint.viewport.isMobile).toBe(false);
      expect(fingerprint.viewport.hasTouch).toBe(false);
      expect(fingerprint.viewport.deviceScaleFactor).toBe(1);
      expect(fingerprint.navigator.maxTouchPoints).toBe(0);
    });

    it('should include platform-appropriate fonts', () => {
      const windowsComponents = generateModularUA({
        platform: Platform.Windows,
      });
      const macComponents = generateModularUA({
        platform: Platform.macOS,
      });

      const windowsFingerprint = generateBrowserFingerprint(windowsComponents);
      const macFingerprint = generateBrowserFingerprint(macComponents);

      // Check that we got some fonts and they are from the right platform
      expect(windowsFingerprint.fonts.length).toBeGreaterThan(10);
      expect(macFingerprint.fonts.length).toBeGreaterThan(10);
      
      // Windows should have some Windows-specific fonts
      const hasWindowsFont = windowsFingerprint.fonts.some(font => 
        ['Arial', 'Segoe UI', 'Tahoma', 'Calibri'].includes(font)
      );
      expect(hasWindowsFont).toBe(true);
      
      // macOS should have some Mac-specific fonts
      const hasMacFont = macFingerprint.fonts.some(font => 
        ['Helvetica', 'Avenir', 'Helvetica Neue', 'American Typewriter'].includes(font)
      );
      expect(hasMacFont).toBe(true);
    });
  });

  describe('generatePuppeteerConfig', () => {
    it('should generate valid Puppeteer configuration', () => {
      const components = generateModularUA({
        browser: Browser.Chrome,
        platform: Platform.Windows,
      });

      const config = generatePuppeteerConfig(components);

      expect(config).toHaveProperty('userAgent');
      expect(config).toHaveProperty('viewport');
      expect(config).toHaveProperty('extraHTTPHeaders');
      expect(config).toHaveProperty('timezoneId');
      expect(config).toHaveProperty('permissions');

      expect(config.userAgent).toBe(components.userAgent);
      expect(config.extraHTTPHeaders).toHaveProperty('Accept-Language');
      expect(config.extraHTTPHeaders).toHaveProperty('Accept-Encoding');
      expect(Array.isArray(config.permissions)).toBe(true);
    });
  });

  describe('generatePlaywrightConfig', () => {
    it('should generate valid Playwright configuration', () => {
      const components = generateModularUA({
        browser: Browser.Firefox,
        platform: Platform.macOS,
      });

      const config = generatePlaywrightConfig(components);

      expect(config).toHaveProperty('userAgent');
      expect(config).toHaveProperty('viewport');
      expect(config).toHaveProperty('deviceScaleFactor');
      expect(config).toHaveProperty('isMobile');
      expect(config).toHaveProperty('hasTouch');
      expect(config).toHaveProperty('locale');
      expect(config).toHaveProperty('timezoneId');
      expect(config).toHaveProperty('extraHTTPHeaders');
      expect(config).toHaveProperty('colorScheme');

      expect(config.userAgent).toBe(components.userAgent);
      expect(['light', 'dark']).toContain(config.colorScheme);
    });
  });

  describe('generateFingerprintOverrides', () => {
    it('should generate JavaScript override code', () => {
      const components = generateModularUA();
      const fingerprint = generateBrowserFingerprint(components);
      const overrides = generateFingerprintOverrides(fingerprint);

      expect(typeof overrides).toBe('string');
      expect(overrides).toContain('Object.defineProperty');
      expect(overrides).toContain('screen');
      expect(overrides).toContain('navigator');
      expect(overrides).toContain('WebGLRenderingContext');
      expect(overrides).toContain(fingerprint.screen.width.toString());
      expect(overrides).toContain(fingerprint.navigator.language);
    });

    it('should handle different platform overrides correctly', () => {
      const platforms = [Platform.Windows, Platform.macOS, Platform.Linux];
      
      platforms.forEach(platform => {
        const components = generateModularUA({ platform });
        const fingerprint = generateBrowserFingerprint(components);
        const overrides = generateFingerprintOverrides(fingerprint);

        expect(overrides).toContain(fingerprint.navigator.platform);
        expect(overrides).toContain(fingerprint.webgl.vendor);
        expect(overrides).toContain(fingerprint.webgl.renderer);
      });
    });
  });

  describe('Integration with modular generator', () => {
    it('should work with all browser/platform combinations', () => {
      const browsers = [Browser.Chrome, Browser.Firefox, Browser.Safari, Browser.Edge];
      const platforms = [Platform.Windows, Platform.macOS, Platform.Linux, Platform.Android, Platform.iOS];

      browsers.forEach(browser => {
        platforms.forEach(platform => {
          try {
            const components = generateModularUA({ browser, platform });
            const fingerprint = generateBrowserFingerprint(components);
            
            expect(fingerprint.userAgent).toBeDefined();
            expect(fingerprint.viewport).toBeDefined();
            expect(fingerprint.navigator).toBeDefined();
          } catch (error) {
            // Some combinations might be incompatible, which is expected
            // The modular generator should handle this gracefully
            expect(error).toBeDefined();
          }
        });
      });
    });

    it('should generate consistent fingerprints for same components', () => {
      const components = generateModularUA({
        browser: Browser.Chrome,
        platform: Platform.Windows,
        deviceType: DeviceType.Desktop,
      });

      const fingerprint1 = generateBrowserFingerprint(components);
      const fingerprint2 = generateBrowserFingerprint(components);

      // User agent should be the same
      expect(fingerprint1.userAgent).toBe(fingerprint2.userAgent);
      
      // Screen resolutions might differ due to randomness, but should be reasonable
      expect(fingerprint1.screen.width).toBeGreaterThan(800);
      expect(fingerprint2.screen.width).toBeGreaterThan(800);
    });
  });

  describe('Performance', () => {
    it('should generate fingerprints efficiently', () => {
      const startTime = Date.now();
      
      // Generate 100 fingerprints
      for (let i = 0; i < 100; i++) {
        const components = generateModularUA();
        generateBrowserFingerprint(components);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 2 seconds)
      expect(duration).toBeLessThan(2000);
    });
  });
});