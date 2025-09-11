import { afterEach, describe, expect, it } from 'vitest';

import { isMobile } from './isMobile';

const setUserAgent = (ua: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
    writable: true,
  });
};

describe('isMobile', () => {
  const originalUA = window.navigator.userAgent;

  afterEach(() => {
    setUserAgent(originalUA);
  });

  it('returns true for common Android browsers', () => {
    const uas = [
      // Chrome for Android
      'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.0.0 Mobile Safari/537.36',
      // Firefox for Android
      'Mozilla/5.0 (Android 10; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0',
      // Edge for Android
      'Mozilla/5.0 (Linux; Android 10; Pixel 2 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36 EdgA/109.0.1518.52',
      // Vivaldi for Android
      'Mozilla/5.0 (Linux; Android 10; V1921) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36 Vivaldi/5.7.2867.62',
      // Yandex Browser for Android
      'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Mobile Safari/537.36 YaBrowser/22.9.0.236.00',
      // Opera for Android
      'Mozilla/5.0 (Linux; Android 10; SM-G960F Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 OPR/63.3.3216.58675',
    ];

    uas.forEach((ua) => {
      setUserAgent(ua);
      expect(isMobile()).toBe(true);
    });
  });

  it('returns false for desktop browsers', () => {
    const desktopChromeUA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    setUserAgent(desktopChromeUA);
    expect(isMobile()).toBe(false);
  });
});
