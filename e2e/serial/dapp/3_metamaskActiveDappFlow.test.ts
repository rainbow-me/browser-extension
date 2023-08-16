import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, it } from 'vitest';

import {
  delayTime,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlow,
  initDriverWithOptions,
  untilDocumentLoaded,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rainbowUrl = getRootUrl();
let metamaskUrl = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('MetaMask active dApp flow', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
      metamask: true,
    });
    const rainbowExtensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!rainbowExtensionId) throw new Error('Rainbow Extension not found');
    rainbowUrl += rainbowExtensionId;
    const metamaskExtensionId = await getExtensionIdByName(driver, 'MetaMask');
    if (!metamaskExtensionId) throw new Error('MetaMask Extension not found');
    metamaskUrl += metamaskExtensionId;
  });

  afterAll(() => driver.quit());

  it('should be able open rainbow and import a wallet via private key', async () => {
    await importWalletFlow(
      driver,
      rainbowUrl,
      TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET,
    );
  });

  it('should be able open metamask', async () => {
    await driver.get(metamaskUrl + '/popup.html');
    await driver.wait(untilDocumentLoaded(), 20_000);
    await delayTime('very-long');
  });
});
