import { readFileSync } from 'fs';
import { ProxyConfig, ProxyList } from '../types';

let currentProxyIndex = 0;

export function loadProxyList(filepath: string): ProxyList {
  try {
    const fileContent = readFileSync(filepath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    const proxies: ProxyList = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Support formats:
      // host:port
      // type://host:port
      // type://username:password@host:port
      // host:port:username:password
      
      if (trimmedLine.includes('://')) {
        return parseProxyUrl(trimmedLine);
      } else {
        return parseProxyString(trimmedLine);
      }
    });
    
    console.log(`Loaded ${proxies.length} proxies from ${filepath}`);
    return proxies;
  } catch (error) {
    throw new Error(`Failed to load proxy list from ${filepath}: ${error}`);
  }
}

function parseProxyUrl(proxyUrl: string): ProxyConfig {
  try {
    const url = new URL(proxyUrl);
    
    const proxy: ProxyConfig = {
      host: url.hostname,
      port: parseInt(url.port) || getDefaultPort(url.protocol.replace(':', '')),
      type: url.protocol.replace(':', '').toUpperCase() as 'HTTP' | 'HTTPS' | 'SOCKS',
    };
    
    if (url.username && url.password) {
      proxy.username = decodeURIComponent(url.username);
      proxy.password = decodeURIComponent(url.password);
    }
    
    return proxy;
  } catch (error) {
    throw new Error(`Invalid proxy URL format: ${proxyUrl}`);
  }
}

function parseProxyString(proxyString: string): ProxyConfig {
  const parts = proxyString.split(':');
  
  if (parts.length < 2) {
    throw new Error(`Invalid proxy string format: ${proxyString}. Expected format: host:port or host:port:username:password`);
  }
  
  const proxy: ProxyConfig = {
    host: parts[0],
    port: parseInt(parts[1]),
    type: 'HTTP', // Default to HTTP
  };
  
  if (isNaN(proxy.port)) {
    throw new Error(`Invalid port number in proxy string: ${proxyString}`);
  }
  
  if (parts.length >= 4) {
    proxy.username = parts[2];
    proxy.password = parts[3];
  }
  
  return proxy;
}

function getDefaultPort(protocol: string): number {
  switch (protocol.toLowerCase()) {
    case 'http':
      return 80;
    case 'https':
      return 443;
    case 'socks':
    case 'socks5':
      return 1080;
    default:
      return 8080;
  }
}

export function rotateProxy(proxyList: ProxyList, strategy: 'random' | 'round-robin' = 'round-robin'): ProxyConfig {
  if (proxyList.length === 0) {
    throw new Error('Proxy list is empty');
  }
  
  let selectedProxy: ProxyConfig;
  
  switch (strategy) {
    case 'random':
      const randomIndex = Math.floor(Math.random() * proxyList.length);
      selectedProxy = proxyList[randomIndex];
      break;
      
    case 'round-robin':
      selectedProxy = proxyList[currentProxyIndex];
      currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
      break;
      
    default:
      throw new Error(`Unsupported rotation strategy: ${strategy}`);
  }
  
  return { ...selectedProxy }; // Return a copy to prevent modification
}

export function getRandomProxy(proxyList: ProxyList): ProxyConfig {
  return rotateProxy(proxyList, 'random');
}

export function getNextProxy(proxyList: ProxyList): ProxyConfig {
  return rotateProxy(proxyList, 'round-robin');
}

export function validateProxy(proxy: ProxyConfig): boolean {
  // Basic validation
  if (!proxy.host || !proxy.port) {
    return false;
  }
  
  if (proxy.port < 1 || proxy.port > 65535) {
    return false;
  }
  
  if (!['HTTP', 'HTTPS', 'SOCKS'].includes(proxy.type)) {
    return false;
  }
  
  // If authentication is provided, both username and password should be present
  if ((proxy.username && !proxy.password) || (!proxy.username && proxy.password)) {
    return false;
  }
  
  return true;
}

export function formatProxyForCurl(proxy: ProxyConfig): string {
  let proxyString = `${proxy.type.toLowerCase()}://${proxy.host}:${proxy.port}`;
  
  if (proxy.username && proxy.password) {
    proxyString = `${proxy.type.toLowerCase()}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
  }
  
  return proxyString;
}

export function formatProxyForAxios(proxy: ProxyConfig): object {
  const proxyConfig: any = {
    protocol: proxy.type.toLowerCase(),
    host: proxy.host,
    port: proxy.port,
  };
  
  if (proxy.username && proxy.password) {
    proxyConfig.auth = {
      username: proxy.username,
      password: proxy.password,
    };
  }
  
  return proxyConfig;
}

export function resetProxyRotation(): void {
  currentProxyIndex = 0;
}