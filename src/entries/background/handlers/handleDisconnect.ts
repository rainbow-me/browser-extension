const POPUP_INSTANCE_DATA_EXPIRY = 180000;
export function handleDisconnect() {
  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === 'popup') {
      port.onDisconnect.addListener(async function () {
        await chrome.storage.local.set({
          expiry: Date.now() + POPUP_INSTANCE_DATA_EXPIRY,
        });
      });
    }
  });
}
