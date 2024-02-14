import 'chromedriver';
import 'geckodriver';
import { Key, WebDriver } from 'selenium-webdriver';
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
  delayTime,
  executePerformShortcut,
  findElementByTestId,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlowUsingKeyboardNavigation,
  initDriverWithOptions,
  isElementFoundByText,
  navigateToElementWithTestId,
  takeScreenshotOnFailure,
  transactionStatus,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Complete send flow via shortcuts and keyboard navigation', () => {
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

  it('should be able to go to settings', async () => {
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

  it('should be able to navigate to send with keyboard shortcut', async () => {
    await executePerformShortcut({ driver, key: 's' });
    await checkExtensionURL(driver, 'send');
  });

  it('should be able to navigate home with keyboard nav', async () => {
    await delayTime('long');
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await checkExtensionURL(driver, 'home');
  });

  it('should be able to navigate to send with keyboard navigation', async () => {
    await navigateToElementWithTestId({ driver, testId: 'header-link-send' });
    await checkExtensionURL(driver, 'send');
  });

  it('should be able to nav to send field and type in address', async () => {
    await delayTime('very-long');
    await driver.actions().sendKeys('0xtester.eth').perform();
    const shortenedAddress = await findElementByText(driver, '0x2e67…e774');
    expect(shortenedAddress).toBeTruthy();
  });

  it('should be able to save contact', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
    await executePerformShortcut({ driver, key: 'TAB' });
    await driver.actions().sendKeys('0xtester.eth').perform();
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await delayTime('long');
  });

  it('should be able to open contact menu', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
    const copyOption = await findElementByText(driver, 'Copy Address');
    expect(copyOption).toBeTruthy();
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    const doNotFindCopyOption = await isElementFoundByText({
      text: 'Copy Address',
      driver,
    });
    expect(doNotFindCopyOption).toBe(false);
  });

  it('should be able to clear current send address field', async () => {
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
    await executePerformShortcut({ driver, key: 'ENTER' });
    const contacts = await findElementByText(driver, 'Contacts');
    expect(contacts).toBeTruthy();
  });

  it('should be able to focus address to send with keyboard', async () => {
    await delayTime('long');
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
  });

  it('should be able to focus asset to send with keyboard', async () => {
    await executePerformShortcut({ driver, key: 'TAB' });
    const ethereum = await findElementByText(driver, 'Ethereum');
    expect(ethereum).toBeTruthy();
    await navigateToElementWithTestId({
      driver,
      testId: 'asset-name-eth_1',
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

  it('should be able to set max amount', async () => {
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBeGreaterThan(0);
  });

  it('should be able to switch currency label', async () => {
    const placeholderBefore = await findElementByTestId({
      id: 'send-input-mask',
      driver,
    });
    const placeholderBeforeContent =
      await placeholderBefore.getAttribute('placeholder');
    expect(placeholderBeforeContent).toContain('ETH');
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await delayTime('long');
    const placeholder = await findElementByTestId({
      id: 'send-input-mask',
      driver,
    });
    const placeholderContent = await placeholder.getAttribute('placeholder');
    expect(placeholderContent).toContain('USD');
  });

  it('should be able to initiate transaction with keyboard navigation', async () => {
    // delete max input then type 1
    await driver
      .actions()
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys('1')
      .perform();
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBe(1);
    await navigateToElementWithTestId({ driver, testId: 'send-review-button' });
    const reviewText = await findElementByText(driver, 'Review & Send');
    expect(reviewText).toBeTruthy();
    await navigateToElementWithTestId({
      driver,
      testId: 'review-confirm-button',
    });
    const sendTransaction = await transactionStatus();
    expect(sendTransaction).toBe('success');
  });

  it('should be able to select asset to send from home using keyboard ', async () => {
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 8 });
    await executePerformShortcut({ driver, key: 'SPACE' });
    await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'send');
  });
});
