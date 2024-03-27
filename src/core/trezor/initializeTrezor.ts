export const initializeTrezor = () => {
  chrome.runtime.onInstalled.addListener(() => {
    TrezorConnect.init({
      manifest: {
        email: 'support@rainbow.me',
        appUrl: 'https://rainbow.me',
      },
      transports: ['BridgeTransport', 'WebUsbTransport'],
      connectSrc: 'https://connect.trezor.io/9/',
    });
  });
};
