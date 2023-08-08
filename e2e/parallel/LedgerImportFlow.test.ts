import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkWalletName,
  delayTime,
  findElementByIdAndClick,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToWelcome,
  initDriverWithOptions,
  typeOnTextInput,
} from '../helpers';
import { HARDWARE_WALLETS } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Import wallet with a Ledger hw wallet', () => {
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
    await goToWelcome(driver, rootURL);
    await findElementByTestIdAndClick({
      id: 'import-wallet-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'connect-wallet-option',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'ledger-option',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'connect-wallets-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'hw-done',
      driver,
    });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await typeOnTextInput({
      id: 'confirm-password-input',
      driver,
      text: 'test1234',
    });
    await findElementByTestIdAndClick({ id: 'set-password-button', driver });
    await delayTime('long');
    await findElementByText(driver, 'Rainbow is ready to use');
  });

  it('should display account 0 name', async () => {
    await checkWalletName(
      driver,
      rootURL,
      HARDWARE_WALLETS.LEDGER.accountsToImport[0].address,
    );
  });

  it('should display hw label on wallet switcher screen', async () => {
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    const hwLabel = await findElementByText(driver, 'Ledger');
    expect(hwLabel).toBeTruthy();
  });

  it('should display account 1 name', async () => {
    await findElementByTestIdAndClick({
      id: 'wallet-account-2',
      driver,
    });
    await checkWalletName(
      driver,
      rootURL,
      HARDWARE_WALLETS.LEDGER.accountsToImport[1].address,
    );
  });
});
