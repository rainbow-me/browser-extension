import { useEffect, useState } from 'react';

const isArc = () =>
  getComputedStyle(document.documentElement).getPropertyValue(
    '--arc-palette-title',
  );

export function getBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  // the order of these conditions matter!!!
  if (isArc()) return 'Arc';
  if ('brave' in navigator) return 'Brave';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('samsungbrowser')) 'Samsung';
  if (ua.includes('opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('edge')) return 'Edge Legacy';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  return 'unknown';
}

type Browser = ReturnType<typeof getBrowser>;

const SupportedBrowsers: Browser[] = [
  'Arc',
  'Brave',
  'Chrome',
  'Edge',
  'Firefox',
  'Safari',
];

// needs to be a hook because we can only know if it's Arc based on the computed css props
// useLayoutEffect doesn't work, neither a smaller setTimeout :/
export const useBrowser = () => {
  const [{ browser, isDetected }, set] = useState<{
    browser: Browser;
    isDetected: boolean;
  }>({
    browser: getBrowser(),
    // if the browser is arc, for the first 200ms while the css props are not injected
    // the browser will be "Chrome" with isDetected: false
    isDetected: false,
  });

  useEffect(() => {
    setTimeout(() => set({ browser: getBrowser(), isDetected: true }), 200);
  }, []);

  return {
    browser,
    isDetected,
    isSupported: SupportedBrowsers.includes(browser),
    isBrave: browser === 'Brave',
    isArc: browser === 'Arc',
    isFirefox: browser === 'Firefox',
    isChrome: browser === 'Chrome',
    isSafari: browser === 'Safari',
  } as const;
};
