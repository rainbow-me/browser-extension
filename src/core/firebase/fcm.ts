// FCM was removed in #1967 to improve performance bottlenecks
// and cleanup unused code paths in entrypoint startup
// Restore FCM support by recreating changes in #577

// Placeholder to keep Notifications permission active future usage
// Ensures that chrome.notifications is included in the bundle
// Referencing chrome.notifications to ensure it's included in the bundle
export const createNotification = chrome.notifications.create;
