export function handleSetupInpage() {
  try {
    chrome.scripting.registerContentScripts([
      {
        id: 'inpage',
        matches: ['file://*/*', 'http://*/*', 'https://*/*'],
        js: ['inpage.js'],
        runAt: 'document_start',
        world: navigator.userAgent.toLowerCase().includes('firefox')
          ? 'ISOLATED'
          : 'MAIN',
      },
    ]);
  } catch (e) {
    // This will trigger if the service worker restarts and the current tab
    // is still open and we already injected the content script.
    // We're logging it and swallowing the error because it's expected
    console.log('failed to register content scripts', e);
  }
}
