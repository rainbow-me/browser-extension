/* eslint-disable @typescript-eslint/ban-ts-comment */
export function handleSetupInpage() {
  try {
    if (!navigator.userAgent.toLowerCase().includes('firefox')) {
      chrome.scripting.registerContentScripts([
        {
          id: 'inpage',
          matches: ['file://*/*', 'http://*/*', 'https://*/*'],
          js: ['inpage.js'],
          runAt: 'document_start',
          world: 'MAIN',
        },
      ]);
    }
  } catch (e) {
    // This will trigger if the service worker restarts and the current tab
    // is still open and we already injected the content script.
    // We're logging it and swallowing the error because it's expected
    console.log('failed to register content scripts', e);
  }
}
