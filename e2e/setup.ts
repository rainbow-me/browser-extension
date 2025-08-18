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
  if (globalDriver) {
    await globalDriver.quit();
  }
});
