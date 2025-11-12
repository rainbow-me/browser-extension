/**
 * Sets up a listener for popup port disconnects
 * Multiple callbacks can be registered - they will all be called when a popup disconnects
 */
const popupDisconnectCallbacks = new Set<() => void | Promise<void>>();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    port.onDisconnect.addListener(() => {
      // Call all registered callbacks
      popupDisconnectCallbacks.forEach((callback) => {
        void callback();
      });
    });
  }
});

/**
 * Registers a callback to be called when a popup disconnects
 * @returns Unsubscribe function
 */
export const onPopupDisconnect = (
  callback: () => void | Promise<void>,
): (() => void) => {
  popupDisconnectCallbacks.add(callback);
  return () => {
    popupDisconnectCallbacks.delete(callback);
  };
};
