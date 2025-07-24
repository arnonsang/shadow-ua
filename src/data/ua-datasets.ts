import { UAData, Platform, Browser, DeviceType } from '../types';

export const UA_DATASETS: UAData[] = [
  // Chrome Windows Desktop
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: Platform.Windows,
    browser: Browser.Chrome,
    deviceType: DeviceType.Desktop,
    weight: 25,
  },
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    platform: Platform.Windows,
    browser: Browser.Chrome,
    deviceType: DeviceType.Desktop,
    weight: 20,
  },
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    platform: Platform.Windows,
    browser: Browser.Chrome,
    deviceType: DeviceType.Desktop,
    weight: 15,
  },

  // Chrome macOS Desktop
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: Platform.macOS,
    browser: Browser.Chrome,
    deviceType: DeviceType.Desktop,
    weight: 12,
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    platform: Platform.macOS,
    browser: Browser.Chrome,
    deviceType: DeviceType.Desktop,
    weight: 10,
  },

  // Firefox Windows Desktop
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    platform: Platform.Windows,
    browser: Browser.Firefox,
    deviceType: DeviceType.Desktop,
    weight: 8,
  },
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
    platform: Platform.Windows,
    browser: Browser.Firefox,
    deviceType: DeviceType.Desktop,
    weight: 6,
  },

  // Firefox macOS Desktop
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
    platform: Platform.macOS,
    browser: Browser.Firefox,
    deviceType: DeviceType.Desktop,
    weight: 5,
  },

  // Safari macOS Desktop
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    platform: Platform.macOS,
    browser: Browser.Safari,
    deviceType: DeviceType.Desktop,
    weight: 8,
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    platform: Platform.macOS,
    browser: Browser.Safari,
    deviceType: DeviceType.Desktop,
    weight: 6,
  },

  // Edge Windows Desktop
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    platform: Platform.Windows,
    browser: Browser.Edge,
    deviceType: DeviceType.Desktop,
    weight: 7,
  },
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    platform: Platform.Windows,
    browser: Browser.Edge,
    deviceType: DeviceType.Desktop,
    weight: 5,
  },

  // Chrome Linux Desktop
  {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: Platform.Linux,
    browser: Browser.Chrome,
    deviceType: DeviceType.Desktop,
    weight: 4,
  },
  {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    platform: Platform.Linux,
    browser: Browser.Chrome,
    deviceType: DeviceType.Desktop,
    weight: 3,
  },

  // Firefox Linux Desktop
  {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
    platform: Platform.Linux,
    browser: Browser.Firefox,
    deviceType: DeviceType.Desktop,
    weight: 3,
  },

  // Chrome Android Mobile
  {
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: Platform.Android,
    browser: Browser.Chrome,
    deviceType: DeviceType.Mobile,
    weight: 15,
  },
  {
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: Platform.Android,
    browser: Browser.Chrome,
    deviceType: DeviceType.Mobile,
    weight: 12,
  },
  {
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: Platform.Android,
    browser: Browser.Chrome,
    deviceType: DeviceType.Mobile,
    weight: 10,
  },

  // Safari iOS Mobile
  {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    platform: Platform.iOS,
    browser: Browser.Safari,
    deviceType: DeviceType.Mobile,
    weight: 12,
  },
  {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    platform: Platform.iOS,
    browser: Browser.Safari,
    deviceType: DeviceType.Mobile,
    weight: 10,
  },
  {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1',
    platform: Platform.iOS,
    browser: Browser.Safari,
    deviceType: DeviceType.Mobile,
    weight: 8,
  },

  // Chrome Android Tablet
  {
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-T970) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: Platform.Android,
    browser: Browser.Chrome,
    deviceType: DeviceType.Tablet,
    weight: 4,
  },
  {
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: Platform.Android,
    browser: Browser.Chrome,
    deviceType: DeviceType.Tablet,
    weight: 3,
  },

  // Safari iOS Tablet (iPad)
  {
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    platform: Platform.iOS,
    browser: Browser.Safari,
    deviceType: DeviceType.Tablet,
    weight: 6,
  },
  {
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    platform: Platform.iOS,
    browser: Browser.Safari,
    deviceType: DeviceType.Tablet,
    weight: 5,
  },
];

export const getUADataByFilter = (filter: {
  platform?: Platform;
  browser?: Browser;
  deviceType?: DeviceType;
}): UAData[] => {
  return UA_DATASETS.filter((ua) => {
    if (filter.platform && ua.platform !== filter.platform) return false;
    if (filter.browser && ua.browser !== filter.browser) return false;
    if (filter.deviceType && ua.deviceType !== filter.deviceType) return false;
    return true;
  });
};

export const getTotalWeight = (datasets: UAData[]): number => {
  return datasets.reduce((sum, ua) => sum + (ua.weight || 1), 0);
};