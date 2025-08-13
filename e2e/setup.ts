import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, beforeEach } from 'vitest';

import {
  getExtensionIdByName,
  getRootUrl,
  initDriverWithOptions,
} from './helpers';
import { captureSnapshot } from './util/snapshot';

/**
 * Global setup for E2E tests.
 * This file is imported automatically by vitest and applies hooks to all test files.
 */

// Global driver and rootURL that will be shared across all tests
let globalDriver: WebDriver;
let globalRootURL: string;

// Apply global hooks to all test files
beforeAll(async () => {
  const browser = process.env.BROWSER || 'chrome';
  const os = process.env.OS || 'mac';

  globalDriver = await initDriverWithOptions({
    browser,
    os,
  });

  const extensionId = await getExtensionIdByName(globalDriver, 'Rainbow');
  if (!extensionId) throw new Error('Extension not found');

  globalRootURL = getRootUrl() + extensionId;
});

beforeEach(async (context) => {
  // Ensure context has driver and rootURL for each test
  context.driver = globalDriver;
  context.rootURL = globalRootURL;

  if (context.driver) {
    // Capture screenshot at the beginning of each test
    await captureSnapshot(context, 'before');
  }
});

afterAll(async () => {
  // Quit the driver after all tests
  if (globalDriver) {
    await globalDriver.quit();
  }
});
