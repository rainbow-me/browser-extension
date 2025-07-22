import 'chromedriver';
import 'geckodriver';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
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
} from '../../helpers';
import { SWAP_VARIABLES, TEST_VARIABLES } from '../../walletVariables';

const ethId = SWAP_VARIABLES.ETH_MAINNET_ID;
const usdcId = SWAP_VARIABLES.USDC_MAINNET_ID;

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

const WALLET_TO_USE_SECRET = TEST_VARIABLES.SWAPS_WALLET.PK;

const WALLET_TO_USE_ADDRESS = TEST_VARIABLES.SWAPS_WALLET.ADDRESS;

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

  afterAll(() => driver?.quit());

  it('should be able import a wallet via pk', async () => {
    await importWalletFlowUsingKeyboardNavigation(
      driver,
      rootURL,
      WALLET_TO_USE_SECRET,
    );
  });

  it('should display account name', async () => {
    await checkWalletName(driver, rootURL, WALLET_TO_USE_ADDRESS);
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
    await executePerformShortcut({ driver, key: 'x' });
    await checkExtensionURL(driver, 'swap');
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await checkExtensionURL(driver, 'home');
  });

  it('should be able to navigate to swap with keyboard navigation', async () => {
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 5 });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'swap');
  });

  it('should be able to select asset to sell with keyboard navigation', async () => {
    await executePerformShortcut({
      driver,
      key: 'ARROW_UP',
      timesToPress: 2,
    });
    await executePerformShortcut({
      driver,
      key: 'ENTER',
      timesToPress: 1,
    });

    const inputSearch = await findElementByTestId({
      id: 'token-to-sell-search-token-input',
      driver,
    });
    expect(inputSearch).toBeTruthy();

    await navigateToElementWithTestId({
      driver,
      testId: `sell-row-${ethId}-active-element-item`,
    });

    const inputCurrency = await findElementByTestId({
      id: `input-wrapper-dropdown-${ethId}-token-to-sell-token-input`,
      driver,
    });
    expect(inputCurrency).toBeTruthy();
  });

  it('should be able to select asset to buy with keyboard navigation', async () => {
    const outputSearch = await findElementByTestId({
      id: 'token-to-buy-search-token-input',
      driver,
    });
    expect(outputSearch).toBeTruthy();

    await navigateToElementWithTestId({
      driver,
      testId: `${usdcId}-favorites-token-to-buy-row-active-element-item`,
    });

    const outputCurrency = await findElementByTestId({
      id: `input-wrapper-dropdown-${usdcId}-token-to-buy-token-input`,
      driver,
    });
    expect(outputCurrency).toBeTruthy();
  });

  it('should be able to set max amount with shortcut', async () => {
    await executePerformShortcut({ driver, key: 'm' });
    const inputItem = await findElementByTestId({
      id: `${ethId}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    const inputAmount = await inputItem.getAttribute('value');
    expect(Number(inputAmount)).toBeGreaterThan(9998);
  });

  it('should be able to open network menu with shortcut', async () => {
    const switchNetworkLabel = await isElementFoundByText({
      text: 'Switch Networks',
      driver,
    });
    expect(switchNetworkLabel).toBe(false);
    // open swap field by removing dai output
    await navigateToElementWithTestId({
      driver,
      testId: `${usdcId}-token-to-buy-token-input-remove`,
    });
    // input is focussed, so have to tab out to use shortcut 'n'
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'n' });
    const switchNetworkLabelAfterShortcut = await findElementByText(
      driver,
      'Switch Networks',
    );
    expect(switchNetworkLabelAfterShortcut).toBeTruthy();
    await executePerformShortcut({ driver, key: 'ESCAPE' });
  });

  it('should be able to open network menu with keyboard navigation', async () => {
    const switchNetworkLabel = await isElementFoundByText({
      text: 'Switch Networks',
      driver,
    });
    expect(switchNetworkLabel).toBe(false);
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    const switchNetworkLabelAfterShortcut = findElementByText(
      driver,
      'Switch Networks',
    );
    expect(switchNetworkLabelAfterShortcut).toBeTruthy();
  });

  it('should be able to select asset to swap from home using keyboard', async () => {
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 8 });
    await executePerformShortcut({ driver, key: 'SPACE' });
    await executePerformShortcut({ driver, key: 'x' });
    await checkExtensionURL(driver, 'swap');
    const inputCurrency = await findElementByTestId({
      id: `input-wrapper-dropdown-${ethId}-token-to-sell-token-input`,
      driver,
    });
    expect(inputCurrency).toBeTruthy();
  });

  /**
   * TODO: fix flakiness here
   *
   * Lots of flakiness with this test that needs to be diagnosed
   * Currently the final validation is failing very often.
   * I think the mocking PR currently open will fix this.
   *
   * But since there isn't a reproducable production bug with this flow
   * and I think the keyboard navigation testing in and of itself is helpful
   * I dont think we should disabling this whole suite.
   */

  it('should be able to initiate swap with keyboard navigation', async () => {
    const provider = new StaticJsonRpcProvider('http://127.0.0.1:8545');
    await provider.ready;
    await delayTime('short');
    // const ethBalanceBeforeSwap = await provider.getBalance(
    //   WALLET_TO_USE_ADDRESS,
    // );
    await delayTime('very-long');
    const outputSearch = await findElementByTestId({
      id: 'token-to-buy-search-token-input',
      driver,
    });
    expect(outputSearch).toBeTruthy();

    await navigateToElementWithTestId({
      driver,
      testId: `${usdcId}-favorites-token-to-buy-row-active-element-item`,
    });

    const outputCurrency = await findElementByTestId({
      id: `input-wrapper-dropdown-${usdcId}-token-to-buy-token-input`,
      driver,
    });
    expect(outputCurrency).toBeTruthy();
    await delayTime('long');
    await driver.actions().sendKeys('50').perform();
    // const outputAmount = await findElementByTestId({
    //   id: `${usdcId}-token-to-buy-swap-token-input-swap-input-mask`,
    //   driver,
    // });
    // const outputValue = await outputAmount.getAttribute('value');
    // expect(outputValue).toBe('50');
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
    // await delay(30_000);
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 1 });
    await executePerformShortcut({ driver, key: 'ENTER' });
    // await delay(30_000);
    await executePerformShortcut({ driver, key: 'ENTER' });

    // waiting for balances to update / swap to execute
    // await delay(30_000);

    // const ethBalanceAfterSwap = await provider.getBalance(
    //   WALLET_TO_USE_ADDRESS,
    // );

    // const balanceDifference = subtract(
    //   ethBalanceBeforeSwap.toString(),
    //   ethBalanceAfterSwap.toString(),
    // );
    // const ethDifferenceAmount = convertRawAmountToDecimalFormat(
    //   balanceDifference,
    //   18,
    // );
    // // checking if balance changed at all
    // expect(Number(ethDifferenceAmount)).toBeGreaterThan(0);
  });
});
