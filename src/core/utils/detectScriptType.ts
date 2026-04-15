/**
 * Detects and returns what context the script is in.
 */
export function detectScriptType() {
  // Gate on `chrome.runtime?.id` (only set in this extension's own
  // contexts) rather than `chrome.runtime`, which other extensions'
  // externally_connectable can expose to page context. Fixes #1381.
  const hasChromeRuntime =
    typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
  const hasWindow = typeof window !== 'undefined';

  if (hasChromeRuntime && hasWindow) {
    if (window.location.pathname.includes('background')) return 'background';
    if (window.location.pathname.includes('contentscript'))
      return 'contentScript';
    if (
      window.location.pathname.includes('popup') &&
      !window.location.origin.includes('trezor')
    )
      return 'popup';
    return 'contentScript';
  }
  if (hasChromeRuntime && !hasWindow) return 'background';
  if (!hasChromeRuntime && hasWindow) return 'inpage';
  throw new Error('Undetected script.');
}

export type ScriptType = ReturnType<typeof detectScriptType>;
