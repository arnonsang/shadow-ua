import { describe, it, expect } from 'vitest';
import {
  OS_COMPONENTS,
  BROWSER_COMPONENTS,
  ENGINE_COMPONENTS,
  DEVICE_COMPONENTS,
  UA_TEMPLATES,
  getRandomFromWeighted,
  getRandomFromArray,
  getCompatibleOS,
  getCompatibleBrowsers,
  getCompatibleEngines,
  getCompatibleDevices,
  buildOSString,
} from '../../src/data/component-lists';
import { Platform, Browser, DeviceType } from '../../src/types';

describe('Component Lists', () => {
  describe('OS Components', () => {
    it('should have all required platforms', () => {
      const platforms = OS_COMPONENTS.map(os => os.platform);
      
      expect(platforms).toContain(Platform.Windows);
      expect(platforms).toContain(Platform.macOS);
      expect(platforms).toContain(Platform.Linux);
      expect(platforms).toContain(Platform.Android);
      expect(platforms).toContain(Platform.iOS);
    });

    it('should have Windows components with proper versions', () => {
      const windowsComponents = OS_COMPONENTS.filter(os => os.platform === Platform.Windows);
      
      expect(windowsComponents.length).toBeGreaterThan(0);
      windowsComponents.forEach(component => {
        expect(component.versions.length).toBeGreaterThan(0);
        expect(component.architecture).toBeDefined();
        expect(component.architecture!.length).toBeGreaterThan(0);
      });
    });

    it('should have mobile components with device models', () => {
      const androidComponents = OS_COMPONENTS.filter(os => os.platform === Platform.Android);
      const iosComponents = OS_COMPONENTS.filter(os => os.platform === Platform.iOS);
      
      expect(androidComponents.length).toBeGreaterThan(0);
      expect(iosComponents.length).toBeGreaterThan(0);
    });
  });

  describe('Browser Components', () => {
    it('should have all required browsers', () => {
      const browsers = BROWSER_COMPONENTS.map(browser => browser.browser);
      
      expect(browsers).toContain(Browser.Chrome);
      expect(browsers).toContain(Browser.Firefox);
      expect(browsers).toContain(Browser.Safari);
      expect(browsers).toContain(Browser.Edge);
    });

    it('should have proper browser-platform compatibility', () => {
      const chromeComponent = BROWSER_COMPONENTS.find(b => b.browser === Browser.Chrome);
      const safariComponent = BROWSER_COMPONENTS.find(b => b.browser === Browser.Safari);
      
      expect(chromeComponent?.platforms).toContain(Platform.Windows);
      expect(chromeComponent?.platforms).toContain(Platform.Android);
      
      expect(safariComponent?.platforms).toContain(Platform.macOS);
      expect(safariComponent?.platforms).toContain(Platform.iOS);
      expect(safariComponent?.platforms).not.toContain(Platform.Windows);
    });

    it('should have realistic version numbers', () => {
      BROWSER_COMPONENTS.forEach(browser => {
        browser.versions.forEach(version => {
          expect(version).toMatch(/^\d+(\.\d+)*$/); // Should be numeric versions
        });
      });
    });
  });

  describe('Engine Components', () => {
    it('should have main rendering engines', () => {
      const engineNames = ENGINE_COMPONENTS.map(engine => engine.name);
      
      expect(engineNames).toContain('AppleWebKit');
      expect(engineNames).toContain('Gecko');
    });

    it('should have proper engine-browser relationships', () => {
      const webkitEngine = ENGINE_COMPONENTS.find(e => e.name === 'AppleWebKit');
      const geckoEngine = ENGINE_COMPONENTS.find(e => e.name === 'Gecko');
      
      expect(webkitEngine?.browsers).toContain(Browser.Chrome);
      expect(webkitEngine?.browsers).toContain(Browser.Safari);
      
      expect(geckoEngine?.browsers).toContain(Browser.Firefox);
    });
  });

  describe('Device Components', () => {
    it('should have device models for mobile platforms', () => {
      const androidDevices = DEVICE_COMPONENTS.filter(d => d.platform === Platform.Android);
      const iosDevices = DEVICE_COMPONENTS.filter(d => d.platform === Platform.iOS);
      
      expect(androidDevices.length).toBeGreaterThan(0);
      expect(iosDevices.length).toBeGreaterThan(0);
      
      androidDevices.forEach(device => {
        expect(device.models.length).toBeGreaterThan(0);
        expect([DeviceType.Mobile, DeviceType.Tablet]).toContain(device.deviceType);
      });
    });

    it('should have realistic device model names', () => {
      DEVICE_COMPONENTS.forEach(deviceGroup => {
        deviceGroup.models.forEach(model => {
          expect(typeof model).toBe('string');
          expect(model.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('UA Templates', () => {
    it('should have templates for all browsers', () => {
      expect(UA_TEMPLATES[Browser.Chrome]).toBeDefined();
      expect(UA_TEMPLATES[Browser.Firefox]).toBeDefined();
      expect(UA_TEMPLATES[Browser.Safari]).toBeDefined();
      expect(UA_TEMPLATES[Browser.Edge]).toBeDefined();
    });

    it('should have templates for all device types', () => {
      Object.values(UA_TEMPLATES).forEach(browserTemplates => {
        expect(browserTemplates.desktop).toBeDefined();
        expect(browserTemplates.mobile).toBeDefined();
        expect(browserTemplates.tablet).toBeDefined();
      });
    });

    it('should have proper placeholders in templates', () => {
      Object.values(UA_TEMPLATES).forEach(browserTemplates => {
        Object.values(browserTemplates).forEach(template => {
          expect(template).toContain('{os_string}');
          expect(template).toContain('{browser_version}');
        });
      });
    });
  });

  describe('Utility Functions', () => {
    describe('getRandomFromWeighted', () => {
      it('should select items based on weight', () => {
        const items = [
          { name: 'high', weight: 80 },
          { name: 'low', weight: 20 },
        ];
        
        const results = Array.from({ length: 100 }, () => getRandomFromWeighted(items));
        const highCount = results.filter(r => r.name === 'high').length;
        const lowCount = results.filter(r => r.name === 'low').length;
        
        // High weight item should be selected more often
        expect(highCount).toBeGreaterThan(lowCount);
      });

      it('should handle single item arrays', () => {
        const items = [{ name: 'only', weight: 1 }];
        const result = getRandomFromWeighted(items);
        
        expect(result.name).toBe('only');
      });
    });

    describe('getRandomFromArray', () => {
      it('should select random items from array', () => {
        const items = ['a', 'b', 'c', 'd', 'e'];
        const results = Array.from({ length: 50 }, () => getRandomFromArray(items));
        const uniqueResults = new Set(results);
        
        expect(uniqueResults.size).toBeGreaterThan(1); // Should have variety
        results.forEach(result => {
          expect(items).toContain(result);
        });
      });
    });

    describe('getCompatibleOS', () => {
      it('should return OS components for platform', () => {
        const windowsOS = getCompatibleOS(Platform.Windows);
        const androidOS = getCompatibleOS(Platform.Android);
        
        expect(windowsOS.length).toBeGreaterThan(0);
        expect(androidOS.length).toBeGreaterThan(0);
        
        windowsOS.forEach(os => {
          expect(os.platform).toBe(Platform.Windows);
        });
        
        androidOS.forEach(os => {
          expect(os.platform).toBe(Platform.Android);
        });
      });
    });

    describe('getCompatibleBrowsers', () => {
      it('should return compatible browsers for platform', () => {
        const windowsBrowsers = getCompatibleBrowsers(Platform.Windows);
        const iosBrowsers = getCompatibleBrowsers(Platform.iOS);
        
        expect(windowsBrowsers.length).toBeGreaterThan(0);
        expect(iosBrowsers.length).toBeGreaterThan(0);
        
        // Windows should have Chrome, Firefox, Edge
        const windowsBrowserNames = windowsBrowsers.map(b => b.browser);
        expect(windowsBrowserNames).toContain(Browser.Chrome);
        expect(windowsBrowserNames).toContain(Browser.Firefox);
        expect(windowsBrowserNames).toContain(Browser.Edge);
        
        // iOS should have Safari
        const iosBrowserNames = iosBrowsers.map(b => b.browser);
        expect(iosBrowserNames).toContain(Browser.Safari);
      });
    });

    describe('getCompatibleEngines', () => {
      it('should return compatible engines for browser', () => {
        const chromeEngines = getCompatibleEngines(Browser.Chrome);
        const firefoxEngines = getCompatibleEngines(Browser.Firefox);
        
        expect(chromeEngines.length).toBeGreaterThan(0);
        expect(firefoxEngines.length).toBeGreaterThan(0);
        
        // Chrome should use WebKit/Blink
        const chromeEngineNames = chromeEngines.map(e => e.name);
        expect(chromeEngineNames).toContain('AppleWebKit');
        
        // Firefox should use Gecko
        const firefoxEngineNames = firefoxEngines.map(e => e.name);
        expect(firefoxEngineNames).toContain('Gecko');
      });
    });

    describe('getCompatibleDevices', () => {
      it('should return compatible devices for platform and type', () => {
        const androidMobile = getCompatibleDevices(Platform.Android, DeviceType.Mobile);
        const iosTablet = getCompatibleDevices(Platform.iOS, DeviceType.Tablet);
        
        expect(androidMobile.length).toBeGreaterThan(0);
        expect(iosTablet.length).toBeGreaterThan(0);
        
        androidMobile.forEach(device => {
          expect(device.platform).toBe(Platform.Android);
          expect(device.deviceType).toBe(DeviceType.Mobile);
        });
        
        iosTablet.forEach(device => {
          expect(device.platform).toBe(Platform.iOS);
          expect(device.deviceType).toBe(DeviceType.Tablet);
        });
      });
    });

    describe('buildOSString', () => {
      it('should build Windows OS strings correctly', () => {
        const windowsComponent = OS_COMPONENTS.find(os => os.platform === Platform.Windows)!;
        const osString = buildOSString(windowsComponent);
        
        expect(osString).toMatch(/Windows NT/);
        expect(osString).toMatch(/Win64|WOW64|Win32/);
      });

      it('should build macOS OS strings correctly', () => {
        const macosComponent = OS_COMPONENTS.find(os => os.platform === Platform.macOS)!;
        const osString = buildOSString(macosComponent);
        
        expect(osString).toMatch(/Macintosh/);
        expect(osString).toMatch(/Intel Mac OS X/);
      });

      it('should build Android OS strings correctly', () => {
        const androidComponent = OS_COMPONENTS.find(os => os.platform === Platform.Android)!;
        const osString = buildOSString(androidComponent, 'SM-G998B');
        
        expect(osString).toMatch(/Linux; Android/);
        expect(osString).toContain('SM-G998B');
      });

      it('should build iOS OS strings correctly', () => {
        const iosComponents = OS_COMPONENTS.filter(os => os.platform === Platform.iOS);
        
        iosComponents.forEach(component => {
          const osString = buildOSString(component);
          
          if (component.name.includes('iPhone')) {
            expect(osString).toMatch(/iPhone; CPU iPhone OS/);
          } else {
            expect(osString).toMatch(/iPad; CPU OS/);
          }
          expect(osString).toContain('like Mac OS X');
        });
      });

      it('should build Linux OS strings correctly', () => {
        const linuxComponent = OS_COMPONENTS.find(os => os.platform === Platform.Linux)!;
        const osString = buildOSString(linuxComponent);
        
        expect(osString).toMatch(/X11; Linux/);
        expect(osString).toMatch(/x86_64|i686/);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent browser-engine relationships', () => {
      BROWSER_COMPONENTS.forEach(browser => {
        browser.engines.forEach(engineName => {
          const engine = ENGINE_COMPONENTS.find(e => e.name === engineName);
          expect(engine).toBeDefined();
          expect(engine!.browsers).toContain(browser.browser);
        });
      });
    });

    it('should have positive weights for all components', () => {
      [...OS_COMPONENTS, ...BROWSER_COMPONENTS, ...ENGINE_COMPONENTS, ...DEVICE_COMPONENTS].forEach(component => {
        expect(component.weight).toBeGreaterThan(0);
        expect(typeof component.weight).toBe('number');
      });
    });

    it('should have non-empty version arrays', () => {
      [...OS_COMPONENTS, ...BROWSER_COMPONENTS, ...ENGINE_COMPONENTS].forEach(component => {
        if ('versions' in component) {
          expect(Array.isArray(component.versions)).toBe(true);
          expect(component.versions.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have realistic market share distribution', () => {
      const totalBrowserWeight = BROWSER_COMPONENTS.reduce((sum, b) => sum + b.weight, 0);
      const chromeWeight = BROWSER_COMPONENTS.find(b => b.browser === Browser.Chrome)?.weight || 0;
      
      // Chrome should have the highest market share
      expect(chromeWeight / totalBrowserWeight).toBeGreaterThan(0.4); // > 40%
    });
  });
});