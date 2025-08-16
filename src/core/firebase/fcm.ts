// FCM was removed in #1967 to improve performance bottlenecks
// and cleanup unused code paths in entrypoint startup
// Restore FCM support by recreating changes in #577

// Placeholder to keep Notifications permission active future usage
// Safari compatibility: Conditionally export notifications API
export const createNotification = typeof chrome !== 'undefined' && chrome.notifications?.create
  ? chrome.notifications.create.bind(chrome.notifications)
  : async (
      notificationId?: string,
      options?: any,
      callback?: (notificationId: string) => void
    ) => {
      // Safari fallback - notifications API not supported in Safari extensions
      console.warn('Notifications API not available in Safari extensions');
      const id = notificationId || Date.now().toString();
      if (callback) callback(id);
      return Promise.resolve(id);
    };
