window.TrezorConnect?.init({
    manifest: {
      email: 'support@rainbow.me',
      appUrl: 'https://rainbow.me',
    },
    lazyLoad: true,
    connectSrc: 'https://connect.trezor.io/9/',
    transports: ['BridgeTransport', 'WebUsbTransport'],
  });