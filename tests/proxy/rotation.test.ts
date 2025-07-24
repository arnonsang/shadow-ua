import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  loadProxyList,
  rotateProxy,
  getRandomProxy,
  getNextProxy,
  validateProxy,
  formatProxyForCurl,
  formatProxyForAxios,
  resetProxyRotation,
} from '../../src/proxy';
import { ProxyConfig } from '../../src/types';
import { writeFileSync, unlinkSync } from 'fs';

describe('Proxy Management', () => {
  const testProxyFile = '/tmp/test-proxies.txt';
  
  beforeEach(() => {
    resetProxyRotation();
  });

  afterEach(() => {
    try {
      unlinkSync(testProxyFile);
    } catch (e) {
      // File doesn't exist, ignore
    }
  });

  describe('loadProxyList', () => {
    it('should load basic proxy format (host:port)', () => {
      const proxyData = [
        '127.0.0.1:8080',
        '192.168.1.1:3128',
        '10.0.0.1:8888',
      ].join('\n');
      
      writeFileSync(testProxyFile, proxyData);
      const proxies = loadProxyList(testProxyFile);
      
      expect(proxies).toHaveLength(3);
      expect(proxies[0]).toEqual({
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
      });
    });

    it('should load proxy format with authentication (host:port:user:pass)', () => {
      const proxyData = [
        '127.0.0.1:8080:user1:pass1',
        '192.168.1.1:3128:user2:pass2',
      ].join('\n');
      
      writeFileSync(testProxyFile, proxyData);
      const proxies = loadProxyList(testProxyFile);
      
      expect(proxies).toHaveLength(2);
      expect(proxies[0]).toEqual({
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
        username: 'user1',
        password: 'pass1',
      });
    });

    it('should load URL format proxies', () => {
      const proxyData = [
        'http://127.0.0.1:8080',
        'https://192.168.1.1:3128',
        'socks://10.0.0.1:1080',
      ].join('\n');
      
      writeFileSync(testProxyFile, proxyData);
      const proxies = loadProxyList(testProxyFile);
      
      expect(proxies).toHaveLength(3);
      expect(proxies[0]).toEqual({
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
      });
      expect(proxies[1]).toEqual({
        host: '192.168.1.1',
        port: 3128,
        type: 'HTTPS',
      });
      expect(proxies[2]).toEqual({
        host: '10.0.0.1',
        port: 1080,
        type: 'SOCKS',
      });
    });

    it('should load URL format with authentication', () => {
      const proxyData = 'http://user:pass@127.0.0.1:8080';
      
      writeFileSync(testProxyFile, proxyData);
      const proxies = loadProxyList(testProxyFile);
      
      expect(proxies).toHaveLength(1);
      expect(proxies[0]).toEqual({
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
        username: 'user',
        password: 'pass',
      });
    });

    it('should handle empty lines and whitespace', () => {
      const proxyData = [
        '127.0.0.1:8080',
        '',
        '   ',
        '192.168.1.1:3128',
        '',
      ].join('\n');
      
      writeFileSync(testProxyFile, proxyData);
      const proxies = loadProxyList(testProxyFile);
      
      expect(proxies).toHaveLength(2);
    });

    it('should throw error for non-existent file', () => {
      expect(() => {
        loadProxyList('/non/existent/file.txt');
      }).toThrow();
    });

    it('should throw error for invalid proxy format', () => {
      writeFileSync(testProxyFile, 'invalid-proxy-format');
      
      expect(() => {
        loadProxyList(testProxyFile);
      }).toThrow();
    });
  });

  describe('Proxy Rotation', () => {
    const testProxies: ProxyConfig[] = [
      { host: '127.0.0.1', port: 8080, type: 'HTTP' },
      { host: '127.0.0.1', port: 8081, type: 'HTTP' },
      { host: '127.0.0.1', port: 8082, type: 'HTTP' },
    ];

    it('should rotate proxies in round-robin fashion', () => {
      const proxy1 = rotateProxy(testProxies, 'round-robin');
      const proxy2 = rotateProxy(testProxies, 'round-robin');
      const proxy3 = rotateProxy(testProxies, 'round-robin');
      const proxy4 = rotateProxy(testProxies, 'round-robin'); // Should wrap around
      
      expect(proxy1.port).toBe(8080);
      expect(proxy2.port).toBe(8081);
      expect(proxy3.port).toBe(8082);
      expect(proxy4.port).toBe(8080); // Wrapped around
    });

    it('should select random proxies', () => {
      const selectedPorts = new Set();
      
      // Run multiple times to test randomness
      for (let i = 0; i < 20; i++) {
        const proxy = rotateProxy(testProxies, 'random');
        selectedPorts.add(proxy.port);
      }
      
      // Should have selected different proxies (at least 2 different ports)
      expect(selectedPorts.size).toBeGreaterThan(1);
    });

    it('should use getNextProxy helper', () => {
      const proxy1 = getNextProxy(testProxies);
      const proxy2 = getNextProxy(testProxies);
      
      expect(proxy1.port).toBe(8080);
      expect(proxy2.port).toBe(8081);
    });

    it('should use getRandomProxy helper', () => {
      const proxy = getRandomProxy(testProxies);
      expect([8080, 8081, 8082]).toContain(proxy.port);
    });

    it('should return a copy of the proxy config', () => {
      const proxy = rotateProxy(testProxies, 'round-robin');
      proxy.port = 9999; // Modify the returned proxy
      
      // Original should not be modified
      expect(testProxies[0].port).toBe(8080);
    });

    it('should throw error for empty proxy list', () => {
      expect(() => {
        rotateProxy([], 'round-robin');
      }).toThrow('Proxy list is empty');
    });

    it('should throw error for unsupported strategy', () => {
      expect(() => {
        rotateProxy(testProxies, 'invalid' as any);
      }).toThrow('Unsupported rotation strategy');
    });
  });

  describe('Proxy Validation', () => {
    it('should validate valid proxy configs', () => {
      const validProxy: ProxyConfig = {
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
      };
      
      expect(validateProxy(validProxy)).toBe(true);
    });

    it('should validate proxy with authentication', () => {
      const validProxy: ProxyConfig = {
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
        username: 'user',
        password: 'pass',
      };
      
      expect(validateProxy(validProxy)).toBe(true);
    });

    it('should reject proxy without host', () => {
      const invalidProxy = {
        port: 8080,
        type: 'HTTP',
      } as ProxyConfig;
      
      expect(validateProxy(invalidProxy)).toBe(false);
    });

    it('should reject proxy without port', () => {
      const invalidProxy = {
        host: '127.0.0.1',
        type: 'HTTP',
      } as ProxyConfig;
      
      expect(validateProxy(invalidProxy)).toBe(false);
    });

    it('should reject proxy with invalid port range', () => {
      const invalidProxy1: ProxyConfig = {
        host: '127.0.0.1',
        port: 0,
        type: 'HTTP',
      };
      
      const invalidProxy2: ProxyConfig = {
        host: '127.0.0.1',
        port: 70000,
        type: 'HTTP',
      };
      
      expect(validateProxy(invalidProxy1)).toBe(false);
      expect(validateProxy(invalidProxy2)).toBe(false);
    });

    it('should reject proxy with invalid type', () => {
      const invalidProxy = {
        host: '127.0.0.1',
        port: 8080,
        type: 'INVALID',
      } as ProxyConfig;
      
      expect(validateProxy(invalidProxy)).toBe(false);
    });

    it('should reject proxy with incomplete authentication', () => {
      const invalidProxy1: ProxyConfig = {
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
        username: 'user',
        // missing password
      };
      
      const invalidProxy2: ProxyConfig = {
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
        password: 'pass',
        // missing username
      };
      
      expect(validateProxy(invalidProxy1)).toBe(false);
      expect(validateProxy(invalidProxy2)).toBe(false);
    });
  });

  describe('Proxy Formatting', () => {
    it('should format proxy for cURL', () => {
      const proxy: ProxyConfig = {
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
      };
      
      const formatted = formatProxyForCurl(proxy);
      expect(formatted).toBe('http://127.0.0.1:8080');
    });

    it('should format proxy with authentication for cURL', () => {
      const proxy: ProxyConfig = {
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
        username: 'user',
        password: 'pass',
      };
      
      const formatted = formatProxyForCurl(proxy);
      expect(formatted).toBe('http://user:pass@127.0.0.1:8080');
    });

    it('should format proxy for Axios', () => {
      const proxy: ProxyConfig = {
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
      };
      
      const formatted = formatProxyForAxios(proxy);
      expect(formatted).toEqual({
        protocol: 'http',
        host: '127.0.0.1',
        port: 8080,
      });
    });

    it('should format proxy with authentication for Axios', () => {
      const proxy: ProxyConfig = {
        host: '127.0.0.1',
        port: 8080,
        type: 'HTTP',
        username: 'user',
        password: 'pass',
      };
      
      const formatted = formatProxyForAxios(proxy);
      expect(formatted).toEqual({
        protocol: 'http',
        host: '127.0.0.1',
        port: 8080,
        auth: {
          username: 'user',
          password: 'pass',
        },
      });
    });
  });

  describe('resetProxyRotation', () => {
    it('should reset proxy rotation index', () => {
      const testProxies: ProxyConfig[] = [
        { host: '127.0.0.1', port: 8080, type: 'HTTP' },
        { host: '127.0.0.1', port: 8081, type: 'HTTP' },
      ];
      
      // Advance the rotation
      getNextProxy(testProxies);
      getNextProxy(testProxies);
      
      // Reset and verify it starts from beginning
      resetProxyRotation();
      const proxy = getNextProxy(testProxies);
      expect(proxy.port).toBe(8080);
    });
  });
});