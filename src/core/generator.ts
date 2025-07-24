import { readFileSync } from 'fs';
import { UAString, UAFilter, UAData, Platform, Browser, DeviceType } from '../types';
import { UA_DATASETS, getUADataByFilter, getTotalWeight } from '../data/ua-datasets';
import { generateModularUAString, generateMultipleModularUAStrings } from './modular-generator';

let customUAPool: UAData[] = [];

// Use modular generator as primary method
export function generateRandomUA(): UAString {
  return generateModularUAString();
}

export function generateFilteredUA(filters: UAFilter, count: number = 1): UAString[] {
  return generateMultipleModularUAStrings(count, filters, false);
}

export function generateWeightedRandomUA(filters?: UAFilter): UAString {
  return generateModularUAString(filters, true);
}

export function generateWeightedFilteredUA(filters: UAFilter, count: number = 1): UAString[] {
  return generateMultipleModularUAStrings(count, filters, true);
}

// Legacy functions for backwards compatibility with static datasets
export function generateRandomUALegacy(): UAString {
  const randomIndex = Math.floor(Math.random() * UA_DATASETS.length);
  return UA_DATASETS[randomIndex].userAgent;
}

export function generateFilteredUALegacy(filters: UAFilter, count: number = 1): UAString[] {
  const filteredUAs = getUADataByFilter(filters);
  
  if (filteredUAs.length === 0) {
    throw new Error(`No User-Agent strings found matching the specified filters: ${JSON.stringify(filters)}`);
  }

  const results: UAString[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * filteredUAs.length);
    results.push(filteredUAs[randomIndex].userAgent);
  }
  
  return results;
}

export function generateWeightedRandomUALegacy(filters?: UAFilter): UAString {
  const datasets = filters ? getUADataByFilter(filters) : UA_DATASETS;
  
  if (datasets.length === 0) {
    throw new Error(`No User-Agent strings found matching the specified filters: ${JSON.stringify(filters)}`);
  }

  const totalWeight = getTotalWeight(datasets);
  const randomWeight = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const ua of datasets) {
    currentWeight += ua.weight || 1;
    if (randomWeight <= currentWeight) {
      return ua.userAgent;
    }
  }
  
  // Fallback to last item (shouldn't reach here normally)
  return datasets[datasets.length - 1].userAgent;
}

export function loadCustomUAPool(filepath: string): void {
  try {
    const fileContent = readFileSync(filepath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    customUAPool = lines.map((line) => ({
      userAgent: line.trim(),
      platform: detectPlatform(line),
      browser: detectBrowser(line),
      deviceType: detectDeviceType(line),
      weight: 1,
    }));
    
    // Optionally log loading - removed to avoid interfering with CLI output
  } catch (error) {
    throw new Error(`Failed to load custom UA pool from ${filepath}: ${error}`);
  }
}

export function getCustomUAPool(): UAData[] {
  return [...customUAPool];
}

export function resetCustomUAPool(): void {
  customUAPool = [];
}

export function generateFromCustomPool(count: number = 1): UAString[] {
  if (customUAPool.length === 0) {
    throw new Error('No custom UA pool loaded. Use loadCustomUAPool() first.');
  }
  
  const results: UAString[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * customUAPool.length);
    results.push(customUAPool[randomIndex].userAgent);
  }
  
  return results;
}

function detectPlatform(userAgent: string): Platform {
  if (userAgent.includes('Windows')) return Platform.Windows;
  if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) return Platform.macOS;
  if (userAgent.includes('Linux') && !userAgent.includes('Android')) return Platform.Linux;
  if (userAgent.includes('Android')) return Platform.Android;
  if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) return Platform.iOS;
  return Platform.Linux; // Default fallback
}

function detectBrowser(userAgent: string): Browser {
  if (userAgent.includes('Edg/')) return Browser.Edge;
  if (userAgent.includes('Chrome/')) return Browser.Chrome;
  if (userAgent.includes('Firefox/')) return Browser.Firefox;
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) return Browser.Safari;
  return Browser.Chrome; // Default fallback
}

function detectDeviceType(userAgent: string): DeviceType {
  if (userAgent.includes('iPad')) return DeviceType.Tablet;
  if (userAgent.includes('Tablet')) return DeviceType.Tablet;
  if (userAgent.includes('Mobile')) return DeviceType.Mobile;
  return DeviceType.Desktop; // Default fallback
}