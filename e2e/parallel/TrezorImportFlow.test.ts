import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkWalletName,
  findElementByIdAndClick,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  importHardwareWalletFlow,
  initDriverWithOptions,
} from '../helpers';
import { HARDWARE_WALLETS } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Import wallet with a Trezor hw wallet', () => {
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

  it('should be able import a wallet via hw wallet', async () => {
    await importHardwareWalletFlow(driver, rootURL, 'trezor');
  });

  it('should display account 0 name', async () => {
    await checkWalletName(driver, rootURL, HARDWARE_WALLETS.WALLET_1);
  });

  it('should display hw label on wallet switcher screen', async () => {
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    const hwLabel = await findElementByText(driver, 'Trezor');
    expect(hwLabel).toBeTruthy();
  });

  it('should display account 1 name', async () => {
    await findElementByTestIdAndClick({
      id: 'wallet-account-2',
      driver,
    });
    await checkWalletName(driver, rootURL, HARDWARE_WALLETS.WALLET_2);
  });
});
