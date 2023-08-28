import 'chromedriver';
import 'geckodriver';
import { Key, WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlow,
  initDriverWithOptions,
  performShortcutWithNormalKey,
  performShortcutWithSpecialKey,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('navigate through settings flows with shortcuts', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });
  afterAll(async () => driver.quit());

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });
  it('should display account name', async () => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.ADDRESS);
  });

  // shortcut tests begin
  it('navigate to settings via shortcuts', async () => {
    await performShortcutWithNormalKey(driver, Key, '.');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await checkExtensionURL(driver, 'settings');
  });
});
