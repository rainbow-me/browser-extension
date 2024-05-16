import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkExtensionURL,
  delayTime,
  executeMultipleShortcuts,
  executePerformShortcut,
  findElementByIdAndClick,
  findElementByTestIdAndClick,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  querySelector,
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
      timesToPress: 2,
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

  it('should be able to add a new wallet via watch', async () => {
    await goToPopup(driver, rootURL);
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });

    await findElementByTestIdAndClick({
      id: 'watch-wallets-button',
      driver,
    });

    await typeOnTextInput({
      id: 'secret-text-area-watch',
      driver,
      text: TEST_VARIABLES.WATCHED_WALLET.SECONDARY_ADDRESS,
    });

    await waitUntilElementByTestIdIsPresent({
      id: 'watch-wallets-button-ready',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'watch-wallets-button-ready',
      driver,
    });

    await delayTime('medium');

    await goToPopup(driver, rootURL);
    const label = await querySelector(
      driver,
      '[data-testid="header"] [data-testid="account-name"]',
    );

    const actual = await label.getText();
    const expected = [
      '0x089b...be9E',
      TEST_VARIABLES.WATCHED_WALLET.SECONDARY_ADDRESS,
    ];
    expect(expected.includes(actual)).toEqual(true);
  });

  it('should be able to add a watched wallet as contact and send it using my contacts section', async () => {
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });

    // Seed phrase wallet
    await findElementByTestIdAndClick({ id: 'wallet-account-1', driver });

    await executePerformShortcut({ driver, key: 'k' });

    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });

    await executePerformShortcut({ driver, key: 'ENTER' });

    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
    });

    // Cmd+Enter
    await executeMultipleShortcuts({
      driver,
      keyDown: 'COMMAND',
      key: 'ENTER',
    });

    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });

    await executePerformShortcut({ driver, key: 'ENTER' });

    await executePerformShortcut({ driver, key: 'k' });

    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 3,
    });

    await executePerformShortcut({ driver, key: 'ENTER' });

    // Cmd+Enter
    await executeMultipleShortcuts({
      driver,
      keyDown: 'COMMAND',
      key: 'ENTER',
    });

    await executePerformShortcut({ driver, key: 'ENTER' });

    await checkExtensionURL(driver, 'send');
  });
});
