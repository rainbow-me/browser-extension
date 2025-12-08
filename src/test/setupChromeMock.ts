import { fakeBrowser } from '@webext-core/fake-browser';

/**
 * Shared Chrome mock setup using fakeBrowser.
 * This is used by both unit tests and e2e tests.
 * Sets up chrome API before any modules are imported.
 */
export function setupChromeMock() {
  // Set up fakeBrowser as chrome API
  // This must be done before any modules that use chrome are imported
  globalThis.chrome = fakeBrowser as typeof chrome;
}
