import { WebDriver } from 'selenium-webdriver';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  findElementByTestIdAndClick,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettings,
  takeScreenshotOnFailure,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Import wallet with a secret phrase flow', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });
  afterAll(async () => driver?.quit());

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
  });

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });
  it('should display account name', async () => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.ADDRESS);
  });
  it('should be able import a wallet with a 24 word seed phrase', async () => {
    await importWalletFlow(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_PHRASE_24.SECRET,
      true,
      true,
    );
  });
  it('should display account name of the 24 word seed phrase wallet', async () => {
    await checkWalletName(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_PHRASE_24.ADDRESS,
    );
  });

  it('should be able to reset Rainbow via settings', async () => {
    await navigateToSettings(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'wallets-and-keys', driver });
    await findElementByTestIdAndClick({ id: 'wipe-wallets', driver });

    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTestIdAndClick({ id: 'continue-button', driver });

    await findElementByTestIdAndClick({ id: 'wallet-wipe-check', driver });
    await findElementByTestIdAndClick({ id: 'wipe-wallets', driver });

    await findElementByTestIdAndClick({
      id: 'wipe-wallet-confirm-button',
      driver,
    });
    await checkExtensionURL(driver, 'welcome');
  });
});
