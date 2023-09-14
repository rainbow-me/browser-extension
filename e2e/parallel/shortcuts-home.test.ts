import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  executePerformShortcut,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlow,
  initDriverWithOptions,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe.runIf(browser !== 'firefox')(
  'navigate through settings flows with shortcuts',
  () => {
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
      await importWalletFlow(
        driver,
        rootURL,
        TEST_VARIABLES.EMPTY_WALLET.SECRET,
      );
    });
    it('should display account name', async () => {
      await checkWalletName(
        driver,
        rootURL,
        TEST_VARIABLES.EMPTY_WALLET.ADDRESS,
      );
    });

    // shortcut tests begin

    it('should be able to navigate to connected apps + back with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'a' });
      await checkExtensionURL(driver, 'connected');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });

    it('should be able to navigate to network selector + close with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'n' });
      await findElementByText(driver, 'Connected Apps');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });

    it('should be able to open more menu + close with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'n' });
      await findElementByText(driver, 'Connected Apps');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });

    it('should be able to use arrows to tab switch', async () => {
      await executePerformShortcut({ driver, key: 'n' });
      await findElementByText(driver, 'Connected Apps');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });

    it('should be able to navigate to highlight asset + open context menu with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'n' });
      await findElementByText(driver, 'Connected Apps');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });

    it('should be able to navigate to highlight transaction + open context menu with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'n' });
      await findElementByText(driver, 'Connected Apps');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });

    it('should be able to lock extension with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'n' });
      await findElementByText(driver, 'Connected Apps');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });
  },
);
