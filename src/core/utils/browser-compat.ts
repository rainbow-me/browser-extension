import browser from 'webextension-polyfill';

// Detect browser type
export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
export const isChrome = /chrome/i.test(navigator.userAgent) && !isSafari;
export const isFirefox = /firefox/i.test(navigator.userAgent);

// Export unified browser API
export { browser };

// Compatibility helpers
export const getBrowserName = () => {
  if (isSafari) return 'safari';
  if (isFirefox) return 'firefox';
  return 'chrome';
};

// Handle deprecated APIs
export const getExtensionViews = (fetchProperties?: { type?: string }) => {
  // chrome.extension.getViews is deprecated and not available in Safari
  // This is used in ReadyShortcut.tsx to detect if popup is open
  if (typeof chrome !== 'undefined' && chrome.extension?.getViews) {
    return chrome.extension.getViews(fetchProperties);
  }
  // Safari fallback - return empty array
  return [];
};

// Initialize storage access for Safari
export const initializeStorageForSafari = async () => {
  if (isSafari && browser.storage.session?.setAccessLevel) {
    try {
      // Grant content scripts access to session storage in Safari
      await browser.storage.session.setAccessLevel(
        'TRUSTED_AND_UNTRUSTED_CONTEXTS'
      );
      console.log('Safari session storage access granted to content scripts');
    } catch (error) {
      console.error('Failed to set Safari storage access level:', error);
    }
  }
};

// Polyfill chrome namespace for compatibility
if (typeof window !== 'undefined') {
  if (!window.chrome) {
    (window as any).chrome = browser;
  } else if (!window.chrome.notifications) {
    // Safari might have partial chrome object but missing notifications
    (window as any).chrome = {
      ...window.chrome,
      notifications: {
        create: async (
          notificationId?: string,
          options?: any,
          callback?: (notificationId: string) => void
        ) => {
          console.warn('Notifications API not available in Safari');
          const id = notificationId || Date.now().toString();
          if (callback) callback(id);
          return Promise.resolve(id);
        },
        clear: async (notificationId: string, callback?: (wasCleared: boolean) => void) => {
          if (callback) callback(true);
          return Promise.resolve(true);
        },
        getAll: async (callback?: (notifications: any) => void) => {
          if (callback) callback({});
          return Promise.resolve({});
        }
      }
    };
  }
}