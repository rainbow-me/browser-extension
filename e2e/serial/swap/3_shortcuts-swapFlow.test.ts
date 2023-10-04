import 'chromedriver';
import 'geckodriver';
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
  checkExtensionURL,
  checkWalletName,
  executePerformShortcut,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlowUsingKeyboardNavigation,
  initDriverWithOptions,
  navigateToElementWithTestId,
  takeScreenshotOnFailure,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Complete swap flow via shortcuts and keyboard navigation', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
  });

  afterAll(() => driver.quit());

  it('should be able import a wallet via pk', async () => {
    await importWalletFlowUsingKeyboardNavigation(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_WALLET.PK,
    );
  });

  it('should display account name', async () => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.SEED_WALLET.ADDRESS);
  });

  it('should be able to go to setings', async () => {
    await goToPopup(driver, rootURL);
    await executePerformShortcut({ driver, key: 'DECIMAL' });
    await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'settings');
  });

  it('should be able to connect to hardhat', async () => {
    await navigateToElementWithTestId({ driver, testId: 'connect-to-hardhat' });
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await executePerformShortcut({ driver, key: 'ESCAPE' });
  });

  it('should be able to navigate to swap with keyboard shortcut', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
  it('should be able to navigate to swap with keyboard navigation', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
  it('should be able to select asset to sell with keyboard navigation', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
  it('should be able to select asset to buy with keyboard navigation', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
  it('should be able to set max amount with shortcut', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
  it('should be able to open network menu with shortcut', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
  it('should be able to select asset to swap from home using keyboard', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
  it('should be able to open network menu with keyboard navigation', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
  it('should be able to initiate swap with keyboard navigation', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
  });
});
