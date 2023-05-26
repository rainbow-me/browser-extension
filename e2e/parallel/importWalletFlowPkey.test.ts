import 'chromedriver';
import 'geckodriver';
import { WebDriver, until } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  byText,
  delayTime,
  findElementByTestIdAndClick,
  getExtensionIdByName,
  getTextFromText,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  shortenAddress,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Import wallet flow', () => {
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

  // Import a wallet
  it('should be able import a wallet via pkey', async () => {
    //  Start from welcome screen
    await goToWelcome(driver, rootURL);
    await findElementByTestIdAndClick({
      id: 'import-wallet-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'import-wallet-option',
      driver,
    });

    await typeOnTextInput({
      id: 'secret-textarea',
      driver,
      text: TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET,
    });

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });

    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await typeOnTextInput({
      id: 'confirm-password-input',
      driver,
      text: 'test1234',
    });
    await findElementByTestIdAndClick({ id: 'set-password-button', driver });

    await driver.wait(
      until.elementLocated(byText('Your wallets ready')),
      20_000,
    );

    goToPopup(driver, rootURL);
    await delayTime('short');
    const account = await getTextFromText({ id: 'account-name', driver });
    expect(account).toBe(
      shortenAddress(TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS),
    );
  });
});
