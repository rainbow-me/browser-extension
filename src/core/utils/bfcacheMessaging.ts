/**
 * Utilities for handling Chrome BFCache messaging changes
 * @see https://developer.chrome.com/blog/bfcache-extension-messaging-changes
 */

/**
 * Setup BFCache restoration handler for a callback
 */
export function onBFCacheRestore(callback: () => void): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const handler = (event: PageTransitionEvent) => {
    if (event.persisted) {
      // Page was restored from BFCache
      try {
        callback();
      } catch (error) {
        console.warn('BFCache restoration callback failed:', error);
      }
    }
  };

  window.addEventListener('pageshow', handler);

  // Return cleanup function
  return () => {
    window.removeEventListener('pageshow', handler);
  };
}

export function onBFUnload(
  callback: (event: PageTransitionEvent) => void,
  onlyIfPersisted = false,
): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const handler = (event: PageTransitionEvent) => {
    if (onlyIfPersisted && !event.persisted) return;

    callback(event);
  };

  window.addEventListener('pagehide', handler);

  return () => {
    window.removeEventListener('pagehide', handler);
  };
}
