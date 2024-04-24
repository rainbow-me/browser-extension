export const initializeTrezor = () => {
  TrezorConnect.init({
    manifest: {
      email: 'support@rainbow.me',
      appUrl: 'https://rainbow.me',
    },
    transports: ['BridgeTransport', 'WebUsbTransport'],
    connectSrc: 'https://connect.trezor.io/9/',
    _extendWebextensionLifetime: true,
  });
};
