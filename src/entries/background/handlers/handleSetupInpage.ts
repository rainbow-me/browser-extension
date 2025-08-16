const INPAGE_ID = 'inpage';
export async function handleSetupInpage() {
  const registeredContentScripts =
    await chrome.scripting.getRegisteredContentScripts();
  const inpageRegisteredContentScript = registeredContentScripts.find(
    (cs) => cs.id === INPAGE_ID,
  );
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    
    // Firefox and Safari handle script injection differently (manually in content script)
    if (
      !inpageRegisteredContentScript &&
      !isFirefox &&
      !isSafari
    ) {
      // For Chrome-based browsers, use scripting API with MAIN world
      chrome.scripting.registerContentScripts([
        {
          id: INPAGE_ID,
          matches: ['file://*/*', 'http://*/*', 'https://*/*'],
          js: ['inpage.js'],
          runAt: 'document_start',
          world: 'MAIN',
        },
      ]);
    } else if (!inpageRegisteredContentScript && isSafari) {
      // Safari doesn't support file:// pattern and needs different handling
      // The content script will inject the inpage script manually
      console.log('Safari detected - inpage script will be injected by content script');
    }
  } catch (e) {
    // This will trigger if the service worker restarts and the current tab
    // is still open and we already injected the content script.
    // We're logging it and swallowing the error because it's expected
    console.log('failed to register content scripts', e);
  }
}
