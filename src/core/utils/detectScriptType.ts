/**
 * Detects and returns what context the script is in.
 */
export function detectScriptType() {
  const hasChromeRuntime = typeof chrome !== 'undefined' && chrome.runtime;
  const hasWindow = typeof window !== 'undefined';

  if (hasChromeRuntime && hasWindow) {
    return window.location.href.startsWith('chrome-extension://')
      ? 'popup'
      : 'contentScript';
  }
  if (hasChromeRuntime && !hasWindow) return 'background';
  if (!hasChromeRuntime && hasWindow) return 'inpage';
  throw new Error('Undetected script.');
}

export type ScriptType = ReturnType<typeof detectScriptType>;
