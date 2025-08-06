import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  getExtensionIdByName,
  getRootUrl,
  goToTestApp,
  importWalletFlow,
  initDriverWithOptions,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

const triggerBFCache = async (driver: WebDriver) => {
  await driver.executeScript(`
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.restoredFromBFCache = true;
      }
    });
  `);

  await driver.get('chrome://terms/');
  await driver.navigate().back();

  const restoredFromBFCache = await driver.executeScript(
    'return window.restoredFromBFCache',
  );
  if (!restoredFromBFCache) {
    throw new Error('Failed to trigger BFCache');
  }
};

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Dapp provider BFCache behavior', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });

  afterAll(() => driver?.quit());

  it('has working provider stream after BFCache restore', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
    await goToTestApp(driver);

    const request = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 0,
    });

    const initialResult = await driver.executeScript(
      `return window.ethereum.request(${request})`,
    );
    expect(initialResult).toBe('0x1');

    await triggerBFCache(driver);

    const bfcacheResult = await driver.executeScript(
      `return window.ethereum.request(${request})`,
    );
    expect(bfcacheResult).toBe('0x1');
  });
});
