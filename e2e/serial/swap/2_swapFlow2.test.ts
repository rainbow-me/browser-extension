import 'chromedriver';
import 'geckodriver';
import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Key, WebDriver } from 'selenium-webdriver';
import { erc20Abi } from 'viem';
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
  clearInput,
  delay,
  delayTime,
  fillPrivateKey,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  takeScreenshotOnFailure,
  typeOnTextInput,
  waitAndClick,
  waitUntilElementByTestIdIsPresent,
} from '../../helpers';
import { convertRawAmountToDecimalFormat, subtract } from '../../numbers';
import { SWAP_VARIABLES, TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

const WALLET_TO_USE_SECRET = TEST_VARIABLES.SWAPS_WALLET.PK;

const WALLET_TO_USE_ADDRESS = TEST_VARIABLES.SWAPS_WALLET.ADDRESS;

describe('Swap Flow 2', () => {
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

    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    await fillPrivateKey(driver, WALLET_TO_USE_SECRET);

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
    await delayTime('long');
    await findElementByText(driver, 'Rainbow is ready to use');
  });

  it('should be able to go to setings', async () => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
  });

  it('should be able to connect to hardhat', async () => {
    const btn = await querySelector(
      driver,
      '[data-testid="connect-to-hardhat"]',
    );
    await waitAndClick(btn, driver);
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
  });

  it('should be able to go to swap flow', async () => {
    await delayTime('very-long');
    await findElementByTestIdAndClick({ id: 'header-link-swap', driver });
    await delayTime('long');
  });

  it('should be able to go to review a unlock and swap', async () => {
    await findElementByTestIdAndClick({
      id: `token-to-sell-token-input-remove`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-row`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: `token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    await delayTime('very-long');
    await clearInput({
      id: `token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    await typeOnTextInput({
      id: `token-to-sell-swap-token-input-swap-input-mask`,
      text: `\b50`,
      driver,
    });
    await delayTime('very-long');
  });

  // TODO: fix. with mocking set up, currently this swap fails. You can see in the anvil logs that it is reverted.
  // My best guess is its on the provider level bc its throwing a custom error. Ideally we can un-skip this
  // bc its our only token > ETH swap we have on e2e. To see behavior just un-skip and run tests.
  it.skip('should be able to execute unlock and swap', async () => {
    const provider = new StaticJsonRpcProvider('http://127.0.0.1:8545');
    await provider.ready;
    await delayTime('short');
    const tokenContract = new Contract(
      SWAP_VARIABLES.USDC_MAINNET_ADDRESS,
      erc20Abi,
      provider,
    );
    await delayTime('long');
    const usdcBalanceBeforeSwap = await tokenContract.balanceOf(
      WALLET_TO_USE_ADDRESS,
    );

    await findElementByTestIdAndClick({
      id: 'swap-settings-navbar-button',
      driver,
    });
    await delayTime('short');

    await typeOnTextInput({
      id: 'slippage-input-mask',
      driver,
      text: Key.BACK_SPACE,
    });
    await delayTime('short');
    await typeOnTextInput({
      id: 'slippage-input-mask',
      driver,
      text: '99',
    });
    await delayTime('medium');

    await findElementByTestIdAndClick({ id: 'swap-settings-done', driver });

    await waitUntilElementByTestIdIsPresent({
      id: 'swap-confirmation-button-ready',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'swap-confirmation-button-ready',
      driver,
    });
    await delay(5_000);

    await findElementByTestIdAndClick({ id: 'swap-review-execute', driver });

    // waiting for balances to update / swap to execute
    await delay(20_000);

    const usdcBalanceAfterSwap = await tokenContract.balanceOf(
      WALLET_TO_USE_ADDRESS,
    );
    const balanceDifference = subtract(
      usdcBalanceBeforeSwap.toString(),
      usdcBalanceAfterSwap.toString(),
    );

    const usdcBalanceDifference = convertRawAmountToDecimalFormat(
      balanceDifference.toString(),
      6,
    );

    expect(Number(usdcBalanceDifference)).toBe(50);
  });
});
