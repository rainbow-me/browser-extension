import { WebDriver } from 'selenium-webdriver';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  checkWalletName,
  delayTime,
  fillPrivateKey,
  findElementByIdAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlow,
  initDriverWithOptions,
  takeScreenshotOnFailure,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Import wallet with a private key flow', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });
  afterAll(async () => await driver?.quit());

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
  });

  it('should be able import a wallet via private key', async () => {
    await importWalletFlow(
      driver,
      rootURL,
      TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET,
    );
  });
  it('should display account name', async () => {
    await checkWalletName(
      driver,
      rootURL,
      TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS,
    );
  });

  it('should show toast and navigate to home when importing duplicate private key', async () => {
    // First, import a second wallet so we have 2 wallets total
    await importWalletFlow(
      driver,
      rootURL,
      TEST_VARIABLES.PRIVATE_KEY_WALLET_2.SECRET,
      true, // secondaryWallet = true
    );

    // Verify we're on the second wallet
    await checkWalletName(
      driver,
      rootURL,
      TEST_VARIABLES.PRIVATE_KEY_WALLET_2.ADDRESS,
    );

    // Navigate to add wallet flow
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    // Try to import the first wallet again (duplicate)
    await fillPrivateKey(driver, TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET);
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });

    // Wait for toast to appear and navigation to complete
    await delayTime('medium');

    // Verify toast message appears
    const toastMessage = await findElementByText(
      driver,
      'This private key is already imported',
    );
    expect(toastMessage).toBeTruthy();

    // Verify navigation to home screen
    await delayTime('short');
    const homeScreen = await findElementByTestId({
      id: 'home-page-header-right',
      driver,
    });
    expect(homeScreen).toBeTruthy();

    // Verify wallet is switched to the duplicate wallet (first wallet)
    await checkWalletName(
      driver,
      rootURL,
      TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS,
    );
  });
});
