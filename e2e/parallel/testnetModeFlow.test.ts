import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  executePerformShortcut,
  findElementByTestId,
  findElementByTestIdAndClick,
  getExtensionIdByName,
  getRootUrl,
  goBackTwice,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettingsNetworks,
  toggleStatus,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

const findTestnetBar = async ({ driver }: { driver: WebDriver }) => {
  const testnetBar = await findElementByTestId({
    driver,
    id: 'testnet-bar',
  });
  return testnetBar;
};

describe('Navigate Settings & Privacy and its flows', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });
  afterAll(async () => await driver.quit());

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should be able to toggle testnet mode', async () => {
    await navigateToSettingsNetworks(driver, rootURL);

    expect(await toggleStatus('testnet-mode-toggle', driver)).toBe('true');
    expect(await findTestnetBar({ driver })).toBeTruthy();

    expect(await toggleStatus('testnet-mode-toggle', driver)).toBe('false');
    expect(await findTestnetBar({ driver })).toBeFalsy();
  });

  it('should be able to toggle testnet mode shortcut', async () => {
    expect(await toggleStatus('testnet-mode-shortcut-toggle', driver)).toBe(
      'true',
    );
  });

  it('should go back to home', async () => {
    await goBackTwice(driver);
  });

  it('should activate testnet mode with shortcut', async () => {
    await executePerformShortcut({ driver, key: 'T' });
    expect(await findTestnetBar({ driver })).toBeTruthy();
  });

  it('should disable and enable testnet mode with clicking testnet mode in menu', async () => {
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'testnet-mode', driver });
    expect(await findTestnetBar({ driver })).toBeFalsy();
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'testnet-mode', driver });
    expect(await findTestnetBar({ driver })).toBeTruthy();
  });
});
