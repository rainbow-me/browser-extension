import type { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

import { browserExtensionScheme } from './helpers/environment';
import { getExtensionIdByName, initDriver } from './helpers/install';

/**
 * Global setup for E2E tests.
 * This file is imported automatically by vitest and applies hooks to all test files.
 */

// Global driver and rootURL that will be shared across all tests
let globalDriver: WebDriver;
let globalRootURL: string;

// Apply global hooks to all test files
beforeAll(async () => {
  globalDriver = await initDriver();

  const extensionId = await getExtensionIdByName(globalDriver, 'Rainbow');
  if (!extensionId) throw new Error('Extension not found');

  globalRootURL = browserExtensionScheme + extensionId;

  // Monitor WebDriver connection - exit if browser is closed
  const checkDriverConnection = setInterval(async () => {
    try {
      // Try to get window handles - will throw if browser is closed
      await driver.getWindowHandle();
    } catch (error) {
      console.log('Browser closed, exiting tests...');
      clearInterval(checkDriverConnection);
      process.exit(0);
    }
  }, 1000);
});

beforeEach(async (context) => {
  // Ensure context has driver and rootURL for each test
  context.driver = globalDriver;
  context.rootURL = globalRootURL;

  // Stub on globalThis
  vi.stubGlobal('driver', globalDriver);
  vi.stubGlobal('rootURL', globalRootURL);
});

afterAll(async () => {
  // Quit the driver after all tests
  await globalDriver?.quit();
});

// Handle process termination signals to ensure cleanup
const cleanupAndExit = async () => {
  await globalDriver?.quit();
  process.exit(0);
};

// Gracefully exit on Ctrl+C or process termination
process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);
process.on('exit', () => {
  // Synchronous fallback cleanup if async didn't complete
  // Note: quit() is async, but we try anyway as last resort
  globalDriver?.quit();
});
