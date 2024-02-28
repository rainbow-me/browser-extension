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
  afterAllCleanup,
  checkExtensionURL,
  checkWalletName,
  delay,
  delayTime,
  doNotFindElementByTestId,
  executePerformShortcut,
  findElementByTestId,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlowUsingKeyboardNavigation,
  initDriverWithOptions,
  navigateToElementWithTestId,
  takeScreenshotOnFailure,
  transactionStatus,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Complete Hardhat Optimism send flow', () => {
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

  afterAll(async () => afterAllCleanup(driver));

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

  it('should be able to connect to hardhat Optimism', async () => {
    await navigateToElementWithTestId({
      driver,
      testId: 'connect-to-hardhat-op',
    });
    const button = await findElementByText(
      driver,
      'Disconnect from Hardhat Optimism',
    );
    expect(button).toBeTruthy();
    await executePerformShortcut({ driver, key: 'ESCAPE' });
  });

  it('should be able to navigate to send', async () => {
    await executePerformShortcut({ driver, key: 's' });
    await checkExtensionURL(driver, 'send');
  });

  it('should be able to nav to send field and type in address', async () => {
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
    await driver
      .actions()
      .sendKeys('0x9126914f62314402cC3f098becfaa7c2Bc23a55C')
      .perform();
    const shortenedAddress = await findElementByText(driver, '0x9126…a55C');
    expect(shortenedAddress).toBeTruthy();
  });

  it('should be able to select asset to send with keyboard', async () => {
    await navigateToElementWithTestId({
      driver,
      testId: 'asset-name-eth_10',
    });
    await delayTime('long');
    const tokenInput = await findElementByTestId({
      id: 'input-wrapper-dropdown-token-input',
      driver,
    });
    expect(await tokenInput.getText()).toContain('Ethereum');
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBe(0);
  });

  it('should not be able to open up either of the gas menu options', async () => {
    await doNotFindElementByTestId({ id: 'gas-menu', driver });
    await doNotFindElementByTestId({ id: 'custom-gas-menu', driver });
    await executePerformShortcut({ driver, key: 'C' });
    await doNotFindElementByTestId({ id: 'custom-gas-sheet', driver });
    await executePerformShortcut({ driver, key: 'G' });
    await doNotFindElementByTestId({ id: 'transaction-speed-title', driver });
  });

  it('should be able to initiate Optimisim ETH transaction', async () => {
    await driver.actions().sendKeys('1').perform();
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBe(1);
    await navigateToElementWithTestId({ driver, testId: 'send-review-button' });
    const reviewText = await findElementByText(driver, 'Review & Send');
    expect(reviewText).toBeTruthy();
    await delayTime('medium');
    await navigateToElementWithTestId({ driver, testId: 'L2-check-1' });
    await navigateToElementWithTestId({
      driver,
      testId: 'review-confirm-button',
    });
    await delayTime('very-long');
    const sendTransaction = await transactionStatus();
    expect(sendTransaction).toBe('success');
    await delay(10000);
  });
});
