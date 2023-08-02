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
  // 'Firefox'
];

// needs to be a hook because we can only know if it's Arc based on the computed css props
// useLayoutEffect doesn't work, neither a smaller setTimeout :/
export const useBrowser = () => {
  const [{ browser, isCommited }, set] = useState({
    browser: getBrowser(),
    // commited means it's the final result,
    // if the browser is arc, for the first 200ms while the css props are not injected
    // the browser will be "Chrome" with isCommited: false
    isCommited: false,
  });

  useEffect(() => {
    setTimeout(() => set({ browser: getBrowser(), isCommited: true }), 200);
  }, []);

  return {
    browser,
    isCommited,
    isSupported: SupportedBrowsers.includes(browser),
    isBrave: browser === 'Brave',
    isArc: browser === 'Arc',
    isFirefox: browser === 'Firefox',
    isChrome: browser === 'Chrome',
  };
};
