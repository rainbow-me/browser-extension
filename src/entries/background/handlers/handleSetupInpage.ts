const INPAGE_ID = 'inpage';
export async function handleSetupInpage() {
  const registeredContentScripts =
    await chrome.scripting.getRegisteredContentScripts();
  const inpageRegisteredContentScript = registeredContentScripts.find(
    (cs) => cs.id === INPAGE_ID,
  );
  try {
    if (
      !inpageRegisteredContentScript &&
      !navigator.userAgent.toLowerCase().includes('firefox')
    ) {
      chrome.scripting.registerContentScripts([
        {
          id: INPAGE_ID,
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
