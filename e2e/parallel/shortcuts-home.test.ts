import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  executePerformShortcut,
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

    //

    // network selector + close with keyboard

    // open more menu + close with keyboard

    // go to QR + back with keyboard

    // arrows to tab switch

    // highlight asset + open context menu with keyboard

    // highlight transaction + open context menu with keyboard

    // lock extension

    //

    it('should be able to connected apps + back with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'a' });
      await checkExtensionURL(driver, 'connected');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });
  },
);
