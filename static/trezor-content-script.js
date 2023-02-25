/* eslint-disable no-undef */
/*
    Passing messages from background script to popup
*/

const port = chrome.runtime.connect({ name: 'trezor-connect' });

port.onMessage.addListener((message) => {
    console.log('trezor-content-script.js: msg ', message);
     window.postMessage(message, window.location.origin);
});

port.onDisconnect.addListener(() => {
    console.log('trezor-content-script.js: disconnect ');

    port = null;
});

/*
    Passing messages from popup to background script
*/

window.addEventListener('message', (event) => {
  if (port && event.source === window && event.data) {
    console.log('trezor-content-script.js: passing messages from popup to background script', event.data)
    port.postMessage({ data: event.data });
  }
});
