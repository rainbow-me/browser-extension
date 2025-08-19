import { WebDriver } from 'selenium-webdriver';
import { afterAll, describe, expect, it } from 'vitest';

import { TEST_VARIABLES } from '../../fixtures/wallets';
import { goToTestApp } from '../../helpers/dapp';
import { importWalletFlow } from '../../helpers/onboarding';

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

describe('Dapp provider BFCache behavior', () => {
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
