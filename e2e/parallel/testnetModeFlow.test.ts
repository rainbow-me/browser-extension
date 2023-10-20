import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  doNotFindElementByTestId,
  executePerformShortcut,
  findElementByTestId,
  findElementByTestIdAndClick,
  getExtensionIdByName,
  getRootUrl,
  goBackTwice,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettingsNetworks,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

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

    await delayTime('short');

    // expect(await toggleStatus('testnet-mode-toggle', driver)).toBe('true');
    await findElementByTestIdAndClick({ driver, id: 'testnet-mode-toggle' });
    await delayTime('short');
    const testnetBar = await findElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar).toBeTruthy();

    // expect(await toggleStatus('testnet-mode-toggle', driver)).toBe('false');
    await findElementByTestIdAndClick({ driver, id: 'testnet-mode-toggle' });
    await delayTime('medium');
    const testnetBar2 = await doNotFindElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar2).toBeFalsy();
  });

  it('should be able to toggle testnet mode shortcut', async () => {
    await findElementByTestIdAndClick({
      driver,
      id: 'testnet-mode-shortcut-toggle',
    });
  });

  it('should go back to home', async () => {
    await goBackTwice(driver);
  });

  it('should activate testnet mode with shortcut', async () => {
    await executePerformShortcut({ driver, key: 't' });
    const testnetBar = await findElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar).toBeTruthy();
  });

  it('should disable and enable testnet mode with clicking testnet mode in menu', async () => {
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'testnet-mode', driver });
    await delayTime('medium');
    const testnetBar = await doNotFindElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar).toBeFalsy();
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'testnet-mode', driver });
    const testnetBar2 = await findElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar2).toBeTruthy();
  });
});
