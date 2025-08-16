// Safari Polyfill Entry Point
// This file is loaded before other scripts to ensure compatibility

import browser from 'webextension-polyfill';

// Make browser API globally available
window.browser = browser;

// Create chrome compatibility layer
if (!window.chrome) {
  window.chrome = browser;
}

// Polyfill missing Chrome APIs for Safari
if (window.chrome && !window.chrome.notifications) {
  window.chrome.notifications = {
    create: async (notificationId, options, callback) => {
      console.warn('Notifications API not available in Safari extensions');
      const id = notificationId || Date.now().toString();
      if (callback) callback(id);
      return Promise.resolve(id);
    },
    clear: async (notificationId, callback) => {
      if (callback) callback(true);
      return Promise.resolve(true);
    },
    getAll: async (callback) => {
      if (callback) callback({});
      return Promise.resolve({});
    },
    onClicked: {
      addListener: () => {},
      removeListener: () => {},
      hasListener: () => false
    },
    onClosed: {
      addListener: () => {},
      removeListener: () => {},
      hasListener: () => false
    }
  };
}

// Fix chrome.extension.getViews for Safari
if (window.chrome && !window.chrome.extension) {
  window.chrome.extension = {
    getViews: () => [],
    getBackgroundPage: () => null,
    getURL: (path) => browser.runtime.getURL(path)
  };
}

console.log('Safari polyfills loaded successfully');