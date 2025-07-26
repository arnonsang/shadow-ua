import { Browser, Platform, DeviceType, UAFilter } from '../types';
import { generateModularUA, generateMultipleModularUA } from './modular-generator';

export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
  language: string;
  locale: string;
}

export interface RegionalDistribution {
  region: string;
  browsers: Record<Browser, number>; // Market share percentages
  platforms: Record<Platform, number>; // Market share percentages
  devices: Record<DeviceType, number>; // Market share percentages
  languages: string[];
  timezones: string[];
  currencies: string[];
  prevalentVersions: {
    [key in Browser]?: string[];
  };
}

export interface GeoUAConfig {
  location: GeoLocation;
  distribution: RegionalDistribution;
  localization: {
    enableRegionalHeaders: boolean;
    enableCurrencyHeaders: boolean;
    enableTimezoneHeaders: boolean;
    enableLanguageVariation: boolean;
  };
  accuracy: 'country' | 'region' | 'city' | 'precise';
}

// Real-world regional browser/platform distributions
const REGIONAL_DISTRIBUTIONS: Record<string, RegionalDistribution> = {
  'north-america': {
    region: 'North America',
    browsers: {
      [Browser.Chrome]: 65.2,
      [Browser.Safari]: 18.1,
      [Browser.Edge]: 10.8,
      [Browser.Firefox]: 5.9
    },
    platforms: {
      [Platform.Windows]: 48.3,
      [Platform.macOS]: 28.5,
      [Platform.iOS]: 14.2,
      [Platform.Android]: 7.8,
      [Platform.Linux]: 1.2
    },
    devices: {
      [DeviceType.Desktop]: 68.4,
      [DeviceType.Mobile]: 28.1,
      [DeviceType.Tablet]: 3.5
    },
    languages: ['en-US', 'en-CA', 'es-US', 'fr-CA'],
    timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Toronto'],
    currencies: ['USD', 'CAD'],
    prevalentVersions: {
      [Browser.Chrome]: ['120.0.0.0', '119.0.0.0', '118.0.0.0'],
      [Browser.Safari]: ['17.1', '17.0', '16.4'],
      [Browser.Firefox]: ['120.0', '119.0', '118.0']
    }
  },
  'europe': {
    region: 'Europe',
    browsers: {
      [Browser.Chrome]: 62.8,
      [Browser.Safari]: 11.2,
      [Browser.Firefox]: 14.3,
      [Browser.Edge]: 11.7
    },
    platforms: {
      [Platform.Windows]: 55.1,
      [Platform.Android]: 24.2,
      [Platform.iOS]: 9.8,
      [Platform.macOS]: 8.4,
      [Platform.Linux]: 2.5
    },
    devices: {
      [DeviceType.Desktop]: 61.2,
      [DeviceType.Mobile]: 34.8,
      [DeviceType.Tablet]: 4.0
    },
    languages: ['en-GB', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'pl-PL', 'nl-NL'],
    timezones: ['Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid'],
    currencies: ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'PLN'],
    prevalentVersions: {
      [Browser.Chrome]: ['120.0.0.0', '119.0.0.0', '118.0.0.0'],
      [Browser.Firefox]: ['120.0', '119.0', '115.5.0'], // ESR version
      [Browser.Safari]: ['17.1', '17.0', '16.4']
    }
  },
  'asia-pacific': {
    region: 'Asia Pacific',
    browsers: {
      [Browser.Chrome]: 68.9,
      [Browser.Safari]: 15.8,
      [Browser.Edge]: 8.2,
      [Browser.Firefox]: 7.1
    },
    platforms: {
      [Platform.Android]: 42.1,
      [Platform.Windows]: 28.4,
      [Platform.iOS]: 18.2,
      [Platform.macOS]: 9.8,
      [Platform.Linux]: 1.5
    },
    devices: {
      [DeviceType.Mobile]: 58.7,
      [DeviceType.Desktop]: 35.2,
      [DeviceType.Tablet]: 6.1
    },
    languages: ['ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'en-AU', 'th-TH', 'vi-VN'],
    timezones: ['Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Australia/Sydney'],
    currencies: ['JPY', 'KRW', 'CNY', 'AUD', 'SGD', 'THB'],
    prevalentVersions: {
      [Browser.Chrome]: ['120.0.0.0', '119.0.0.0', '118.0.0.0'],
      [Browser.Safari]: ['17.1', '17.0', '16.4'],
      [Browser.Edge]: ['120.0.0.0', '119.0.0.0']
    }
  },
  'south-america': {
    region: 'South America',
    browsers: {
      [Browser.Chrome]: 72.3,
      [Browser.Safari]: 9.8,
      [Browser.Firefox]: 9.2,
      [Browser.Edge]: 8.7
    },
    platforms: {
      [Platform.Android]: 45.6,
      [Platform.Windows]: 32.1,
      [Platform.iOS]: 12.4,
      [Platform.macOS]: 7.8,
      [Platform.Linux]: 2.1
    },
    devices: {
      [DeviceType.Mobile]: 62.3,
      [DeviceType.Desktop]: 31.2,
      [DeviceType.Tablet]: 6.5
    },
    languages: ['pt-BR', 'es-AR', 'es-CL', 'es-CO', 'en-US'],
    timezones: ['America/Sao_Paulo', 'America/Argentina/Buenos_Aires', 'America/Santiago', 'America/Bogota'],
    currencies: ['BRL', 'ARS', 'CLP', 'COP', 'USD'],
    prevalentVersions: {
      [Browser.Chrome]: ['120.0.0.0', '119.0.0.0', '118.0.0.0'],
      [Browser.Firefox]: ['120.0', '119.0', '118.0']
    }
  },
  'africa-middle-east': {
    region: 'Africa & Middle East',
    browsers: {
      [Browser.Chrome]: 74.1,
      [Browser.Safari]: 8.3,
      [Browser.Firefox]: 9.8,
      [Browser.Edge]: 7.8
    },
    platforms: {
      [Platform.Android]: 52.4,
      [Platform.Windows]: 28.9,
      [Platform.iOS]: 11.2,
      [Platform.macOS]: 5.8,
      [Platform.Linux]: 1.7
    },
    devices: {
      [DeviceType.Mobile]: 68.9,
      [DeviceType.Desktop]: 26.1,
      [DeviceType.Tablet]: 5.0
    },
    languages: ['ar-SA', 'en-ZA', 'fr-MA', 'he-IL', 'sw-KE'],
    timezones: ['Africa/Cairo', 'Asia/Dubai', 'Africa/Johannesburg', 'Asia/Riyadh'],
    currencies: ['SAR', 'AED', 'ZAR', 'EGP', 'ILS'],
    prevalentVersions: {
      [Browser.Chrome]: ['120.0.0.0', '119.0.0.0', '118.0.0.0']
    }
  }
};

// Major cities with their geo data
const CITY_DATABASE: Record<string, GeoLocation> = {
  'new-york': {
    country: 'United States',
    countryCode: 'US',
    region: 'New York',
    city: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en-US',
    locale: 'en_US'
  },
  'london': {
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'England',
    city: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    currency: 'GBP',
    language: 'en-GB',
    locale: 'en_GB'
  },
  'tokyo': {
    country: 'Japan',
    countryCode: 'JP',
    region: 'Tokyo',
    city: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'ja-JP',
    locale: 'ja_JP'
  },
  'sydney': {
    country: 'Australia',
    countryCode: 'AU',
    region: 'New South Wales',
    city: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    language: 'en-AU',
    locale: 'en_AU'
  },
  'berlin': {
    country: 'Germany',
    countryCode: 'DE',
    region: 'Berlin',
    city: 'Berlin',
    latitude: 52.5200,
    longitude: 13.4050,
    timezone: 'Europe/Berlin',
    currency: 'EUR',
    language: 'de-DE',
    locale: 'de_DE'
  },
  'sao-paulo': {
    country: 'Brazil',
    countryCode: 'BR',
    region: 'São Paulo',
    city: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    locale: 'pt_BR'
  },
  'mumbai': {
    country: 'India',
    countryCode: 'IN',
    region: 'Maharashtra',
    city: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'hi-IN',
    locale: 'hi_IN'
  },
  'dubai': {
    country: 'United Arab Emirates',
    countryCode: 'AE',
    region: 'Dubai',
    city: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai',
    currency: 'AED',
    language: 'ar-AE',
    locale: 'ar_AE'
  }
};

class GeoDistributionManager {
  private regionMapping = new Map<string, string>();

  constructor() {
    this.initializeRegionMapping();
  }

  /**
   * Initialize country to region mapping
   */
  private initializeRegionMapping(): void {
    // North America
    ['US', 'CA', 'MX'].forEach(code => this.regionMapping.set(code, 'north-america'));
    
    // Europe
    ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'CH', 'AT', 'BE', 'PL', 'CZ', 'HU'].forEach(code => 
      this.regionMapping.set(code, 'europe'));
    
    // Asia Pacific
    ['JP', 'KR', 'CN', 'AU', 'SG', 'TH', 'VN', 'MY', 'ID', 'PH', 'IN'].forEach(code => 
      this.regionMapping.set(code, 'asia-pacific'));
    
    // South America
    ['BR', 'AR', 'CL', 'CO', 'PE', 'UY'].forEach(code => 
      this.regionMapping.set(code, 'south-america'));
    
    // Africa & Middle East
    ['SA', 'AE', 'EG', 'ZA', 'MA', 'IL', 'TR'].forEach(code => 
      this.regionMapping.set(code, 'africa-middle-east'));
  }

  /**
   * Generate geo-localized User-Agent
   */
  generateGeoUA(config: Partial<GeoUAConfig>): {
    userAgent: string;
    geoData: GeoLocation;
    distribution: RegionalDistribution;
    headers: Record<string, string>;
    components: any;
  } {
    // Determine location
    let location: GeoLocation;
    if (config.location) {
      location = config.location;
    } else {
      // Select random major city
      const cities = Object.keys(CITY_DATABASE);
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      location = CITY_DATABASE[randomCity];
    }

    // Get regional distribution
    const regionKey = this.regionMapping.get(location.countryCode) || 'north-america';
    const distribution = REGIONAL_DISTRIBUTIONS[regionKey];

    // Select browser/platform based on regional preferences
    const browser = this.weightedSelection(distribution.browsers);
    const platform = this.weightedSelection(distribution.platforms);
    const deviceType = this.weightedSelection(distribution.devices);

    // Generate User-Agent with regional characteristics
    const components = generateModularUA({ browser, platform, deviceType });

    // Localize version if available
    if (distribution.prevalentVersions[browser]) {
      const versions = distribution.prevalentVersions[browser]!;
      const localVersion = versions[Math.floor(Math.random() * versions.length)];
      // Would need to modify the UA string with local version
    }

    // Generate geo-specific headers
    const headers = this.generateGeoHeaders(location, distribution, config.localization);

    return {
      userAgent: components.userAgent,
      geoData: location,
      distribution,
      headers,
      components
    };
  }

  /**
   * Generate multiple geo-distributed User-Agents
   */
  generateGeoDistributedUAs(count: number, options: {
    regions?: string[];
    cities?: string[];
    accuracy?: 'country' | 'region' | 'city';
    localization?: Partial<GeoUAConfig['localization']>;
  } = {}): Array<{
    userAgent: string;
    geoData: GeoLocation;
    distribution: RegionalDistribution;
    headers: Record<string, string>;
  }> {
    const results = [];
    const { regions, cities, accuracy = 'city', localization } = options;

    for (let i = 0; i < count; i++) {
      let location: GeoLocation;

      if (cities && cities.length > 0) {
        // Select from specified cities
        const cityKey = cities[Math.floor(Math.random() * cities.length)];
        location = CITY_DATABASE[cityKey] || Object.values(CITY_DATABASE)[0];
      } else if (regions && regions.length > 0) {
        // Select from specified regions
        const regionKey = regions[Math.floor(Math.random() * regions.length)];
        const regionCities = Object.entries(CITY_DATABASE).filter(([_, data]) => 
          this.regionMapping.get(data.countryCode) === regionKey
        );
        
        if (regionCities.length > 0) {
          const [_, cityData] = regionCities[Math.floor(Math.random() * regionCities.length)];
          location = cityData;
        } else {
          location = Object.values(CITY_DATABASE)[0];
        }
      } else {
        // Random global selection
        const cities = Object.values(CITY_DATABASE);
        location = cities[Math.floor(Math.random() * cities.length)];
      }

      // Add geo-location accuracy variations
      if (accuracy === 'country' || accuracy === 'region' || accuracy === 'city') {
        location = this.addLocationAccuracyVariation(location, accuracy);
      }

      const result = this.generateGeoUA({
        location,
        localization: {
          enableRegionalHeaders: localization?.enableRegionalHeaders ?? true,
          enableCurrencyHeaders: localization?.enableCurrencyHeaders ?? true,
          enableTimezoneHeaders: localization?.enableTimezoneHeaders ?? true,
          enableLanguageVariation: localization?.enableLanguageVariation ?? true
        }
      });

      results.push({
        userAgent: result.userAgent,
        geoData: result.geoData,
        distribution: result.distribution,
        headers: result.headers
      });
    }

    return results;
  }

  /**
   * Add location accuracy variations
   */
  private addLocationAccuracyVariation(location: GeoLocation, accuracy: 'country' | 'region' | 'city'): GeoLocation {
    const variation = { ...location };

    switch (accuracy) {
      case 'country':
        // Randomize within country bounds (roughly ±2 degrees)
        variation.latitude += (Math.random() - 0.5) * 4;
        variation.longitude += (Math.random() - 0.5) * 4;
        variation.city = 'Unknown';
        variation.region = 'Unknown';
        break;

      case 'region':
        // Randomize within region bounds (roughly ±0.5 degrees)
        variation.latitude += (Math.random() - 0.5) * 1;
        variation.longitude += (Math.random() - 0.5) * 1;
        variation.city = 'Unknown';
        break;

      case 'city':
        // Small city-level variation (roughly ±0.1 degrees)
        variation.latitude += (Math.random() - 0.5) * 0.2;
        variation.longitude += (Math.random() - 0.5) * 0.2;
        break;
    }

    return variation;
  }

  /**
   * Generate geo-specific HTTP headers
   */
  private generateGeoHeaders(
    location: GeoLocation, 
    distribution: RegionalDistribution, 
    localization?: Partial<GeoUAConfig['localization']>
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (localization?.enableLanguageVariation !== false) {
      // Select appropriate language from regional distribution
      const languages = distribution.languages;
      const primaryLanguage = languages.includes(location.language) ? 
        location.language : languages[0];
      
      headers['Accept-Language'] = `${primaryLanguage},${primaryLanguage.split('-')[0]};q=0.9,en;q=0.8`;
    }

    if (localization?.enableTimezoneHeaders !== false) {
      // Add timezone information in various headers
      headers['X-Timezone'] = location.timezone;
      
      // Some services check for time-related headers
      const now = new Date();
      const tzOffset = this.getTimezoneOffset(location.timezone);
      headers['X-Local-Time'] = new Date(now.getTime() + tzOffset).toISOString();
    }

    if (localization?.enableCurrencyHeaders !== false) {
      headers['X-Currency'] = location.currency;
    }

    if (localization?.enableRegionalHeaders !== false) {
      headers['X-Country'] = location.countryCode;
      headers['X-Region'] = location.region;
      headers['CF-IPCountry'] = location.countryCode; // Cloudflare header
      headers['X-Forwarded-For'] = this.generateRegionalIP(location);
    }

    return headers;
  }

  /**
   * Weighted selection from distribution
   */
  private weightedSelection<T extends string | number | symbol>(weights: Record<T, number>): T {
    const totalWeight = Object.values(weights).reduce((sum: number, weight) => sum + Number(weight), 0);
    let random = Math.random() * totalWeight;

    for (const [key, weight] of Object.entries(weights)) {
      random -= Number(weight);
      if (random <= 0) {
        return key as T;
      }
    }

    return Object.keys(weights)[0] as T;
  }

  /**
   * Generate realistic IP for region (for X-Forwarded-For header)
   */
  private generateRegionalIP(location: GeoLocation): string {
    // This would typically use real IP geolocation data
    // For demo, we'll generate plausible IPs based on known ranges
    const ipRanges = {
      'US': ['173.252.', '69.171.', '31.13.', '157.240.'],
      'GB': ['185.60.', '31.13.', '157.240.', '173.252.'],
      'DE': ['185.60.', '31.13.', '157.240.', '173.252.'],
      'JP': ['103.4.', '157.240.', '31.13.', '173.252.'],
      'AU': ['103.4.', '157.240.', '31.13.', '173.252.'],
      'BR': ['179.60.', '157.240.', '31.13.', '173.252.']
    };

    const ranges = ipRanges[location.countryCode as keyof typeof ipRanges] || ipRanges['US'];
    const selectedRange = ranges[Math.floor(Math.random() * ranges.length)];
    
    const third = Math.floor(Math.random() * 255);
    const fourth = Math.floor(Math.random() * 255) + 1;
    
    return `${selectedRange}${third}.${fourth}`;
  }

  /**
   * Get timezone offset (simplified)
   */
  private getTimezoneOffset(timezone: string): number {
    // Simplified timezone offset calculation
    const offsets: Record<string, number> = {
      'America/New_York': -5 * 3600000,
      'America/Los_Angeles': -8 * 3600000,
      'Europe/London': 0,
      'Europe/Berlin': 1 * 3600000,
      'Asia/Tokyo': 9 * 3600000,
      'Australia/Sydney': 10 * 3600000,
      'America/Sao_Paulo': -3 * 3600000,
      'Asia/Dubai': 4 * 3600000
    };

    return offsets[timezone] || 0;
  }

  /**
   * Get available regions
   */
  getAvailableRegions(): string[] {
    return Object.keys(REGIONAL_DISTRIBUTIONS);
  }

  /**
   * Get available cities
   */
  getAvailableCities(): string[] {
    return Object.keys(CITY_DATABASE);
  }

  /**
   * Get regional distribution data
   */
  getRegionalDistribution(region: string): RegionalDistribution | null {
    return REGIONAL_DISTRIBUTIONS[region] || null;
  }

  /**
   * Get city data
   */
  getCityData(city: string): GeoLocation | null {
    return CITY_DATABASE[city] || null;
  }

  /**
   * Analyze geo-distribution for a set of IPs or locations
   */
  analyzeGeoDistribution(locations: GeoLocation[]): {
    regionDistribution: Record<string, number>;
    countryDistribution: Record<string, number>;
    timezoneDistribution: Record<string, number>;
    languageDistribution: Record<string, number>;
  } {
    const regionDist: Record<string, number> = {};
    const countryDist: Record<string, number> = {};
    const timezoneDist: Record<string, number> = {};
    const languageDist: Record<string, number> = {};

    locations.forEach(location => {
      const region = this.regionMapping.get(location.countryCode) || 'unknown';
      
      regionDist[region] = (regionDist[region] || 0) + 1;
      countryDist[location.countryCode] = (countryDist[location.countryCode] || 0) + 1;
      timezoneDist[location.timezone] = (timezoneDist[location.timezone] || 0) + 1;
      languageDist[location.language] = (languageDist[location.language] || 0) + 1;
    });

    return {
      regionDistribution: regionDist,
      countryDistribution: countryDist,
      timezoneDistribution: timezoneDist,
      languageDistribution: languageDist
    };
  }
}

/**
 * Create geo-distribution manager
 */
export function createGeoDistributionManager(): GeoDistributionManager {
  return new GeoDistributionManager();
}

/**
 * Generate User-Agent with geo-location
 */
export function generateGeoUA(location?: string | Partial<GeoLocation>, options: {
  localization?: Partial<GeoUAConfig['localization']>;
  accuracy?: 'country' | 'region' | 'city' | 'precise';
} = {}): {
  userAgent: string;
  geoData: GeoLocation;
  headers: Record<string, string>;
} {
  const manager = createGeoDistributionManager();
  
  let geoLocation: GeoLocation | undefined;
  
  if (typeof location === 'string') {
    geoLocation = manager.getCityData(location) || undefined;
  } else if (location) {
    geoLocation = location as GeoLocation;
  }

  const result = manager.generateGeoUA({
    location: geoLocation,
    localization: {
      enableRegionalHeaders: options.localization?.enableRegionalHeaders ?? true,
      enableCurrencyHeaders: options.localization?.enableCurrencyHeaders ?? true,
      enableTimezoneHeaders: options.localization?.enableTimezoneHeaders ?? true,
      enableLanguageVariation: options.localization?.enableLanguageVariation ?? true
    },
    accuracy: options.accuracy || 'city'
  });

  return {
    userAgent: result.userAgent,
    geoData: result.geoData,
    headers: result.headers
  };
}

export { GeoDistributionManager };