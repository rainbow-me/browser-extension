/* eslint-disable no-await-in-loop */
import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, it } from 'vitest';

import { TokenNames, tokenAddresses, tokenNames } from 'e2e/tokenVariables';

import {
  checkExtensionURL,
  executeMultipleShortcuts,
  executePerformShortcut,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  performSearchTokenAddressActionsCmdK,
  typeOnTextInput,
  waitUntilElementByTestIdIsPresent,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Command+K behaviours', () => {
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

  it('should send to an owned wallet in my wallets menu', async () => {
    await goToPopup(driver, rootURL);

    await executePerformShortcut({ driver, key: 'k' });
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 3,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });

    // Select 2nd wallet
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 1,
    });

    // Cmd+Enter
    await executeMultipleShortcuts({
      driver,
      keyDown: 'COMMAND',
      key: 'ENTER',
    });

    // Send to wallet
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'send');
  });

  it('should be able to add a searched wallet as contact and send it using my contacts section', async () => {
    await goToPopup(driver, rootURL);

    // cmd k
    await executePerformShortcut({ driver, key: 'k' });

    // search for wallet
    await typeOnTextInput({
      id: 'command-k-input',
      driver,
      text: 'skillet.eth',
    });

    await waitUntilElementByTestIdIsPresent({
      id: 'command-name-skillet.eth',
      driver,
    });

    // select wallet and add as contact
    await executePerformShortcut({ driver, key: 'ENTER' });
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 1,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });

    // cmd k
    await executePerformShortcut({ driver, key: 'k' });

    // select contact from my contacts
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 4,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await executePerformShortcut({ driver, key: 'ENTER' });

    // should be on send flow
    await checkExtensionURL(driver, 'send');
  });

  it('should be able to search for custom unowned tokens on mainnet', async () => {
    for (const [key, tokenAddress] of Object.entries(tokenAddresses.mainnet)) {
      const tokenName = tokenNames[key as TokenNames];
      await performSearchTokenAddressActionsCmdK({
        driver,
        tokenAddress,
        tokenName,
        rootURL,
      });
    }
  });

  it('should be able to search for custom unowned tokens on optimism', async () => {
    for (const [key, tokenAddress] of Object.entries(tokenAddresses.optimism)) {
      const tokenName = tokenNames[key as TokenNames];
      await performSearchTokenAddressActionsCmdK({
        driver,
        tokenAddress,
        tokenName,
        rootURL,
      });
    }
  });
});
