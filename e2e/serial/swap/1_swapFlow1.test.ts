import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
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
  delayTime,
  doNotFindElementByTestId,
  fillPrivateKey,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getLatestTransactionHash,
  getRootUrl,
  getTextFromText,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  takeScreenshotOnFailure,
  typeOnTextInput,
  waitAndClick,
  waitForAndCheckTransaction,
  waitUntilElementByTestIdIsPresent,
} from '../../helpers';
import { convertRawAmountToDecimalFormat, subtract } from '../../numbers';
import { SWAP_VARIABLES, TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';
const isFirefox = browser === 'firefox';

const WALLET_TO_USE_SECRET = isFirefox
  ? TEST_VARIABLES.PRIVATE_KEY_WALLET_2.SECRET
  : TEST_VARIABLES.SEED_WALLET.PK;

const WALLET_TO_USE_ADDRESS = isFirefox
  ? TEST_VARIABLES.PRIVATE_KEY_WALLET_2.ADDRESS
  : TEST_VARIABLES.SEED_WALLET.ADDRESS;

describe('Go through swaps settings and execute a swap', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeEach(async (context: any) => {
    context.driver = driver;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterEach(async (context: any) => {
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
    await findElementByTestIdAndClick({ id: 'header-link-swap', driver });
  });

  it('should be able to open token to sell input and select assets', async () => {
    await delayTime('very-long');
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-token-input-remove`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'token-to-sell-sort-trigger',
      driver,
    });

    const sortByBalance = await findElementByTestId({
      id: 'token-to-sell-sort-balance',
      driver,
    });
    expect(sortByBalance).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'token-to-sell-sort-network',
      driver,
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-row`,
      driver,
    });
    const toSellInputEthSelected = await findElementByTestId({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    expect(toSellInputEthSelected).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'swap-flip-button',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'token-to-sell-token-input-dropdown-toggle',
      driver,
    });
    const toBuyInputEthSelected = await findElementByTestId({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
      driver,
    });
    expect(toBuyInputEthSelected).toBeTruthy();
  });

  it('should be able to go to review a swap', async () => {
    await findElementByTestIdAndClick({
      id: 'token-to-sell-search-token-input',
      driver,
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-row`,
      driver,
    });
    const toSellInputEthSelected = await findElementByTestId({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    expect(toSellInputEthSelected).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'token-to-buy-search-token-input',
      driver,
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-favorites-token-to-buy-row`,
      driver,
    });
    const toBuyInputDaiSelected = await findElementByTestId({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
      driver,
    });
    expect(toBuyInputDaiSelected).toBeTruthy();
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    await clearInput({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    await typeOnTextInput({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      text: 1,
      driver,
    });
    await delayTime('very-long');
    await findElementByTestIdAndClick({
      id: 'swap-confirmation-button-ready',
      driver,
    });
  });

  it('should be able to see swap information in review sheet', async () => {
    const ethAssetToSellAssetCard = await findElementByTestId({
      id: `ETH-asset-to-sell-swap-asset-card`,
      driver,
    });
    expect(ethAssetToSellAssetCard).toBeTruthy();
    const usdcAssetToBuyAssetCard = await findElementByTestId({
      id: `USDC-asset-to-buy-swap-asset-card`,
      driver,
    });
    expect(usdcAssetToBuyAssetCard).toBeTruthy();
    const minimumReceivedDetailsRow = await findElementByTestId({
      id: `minimum-received-details-row`,
      driver,
    });
    expect(minimumReceivedDetailsRow).toBeTruthy();
    const swappingViaDetailsRow = await findElementByTestId({
      id: `swapping-via-details-row`,
      driver,
    });
    expect(swappingViaDetailsRow).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'swapping-via-swap-routes',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'swapping-via-swap-routes',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'swapping-via-swap-routes',
      driver,
    });

    const includedFeeDetailsRow = await findElementByTestId({
      id: `included-fee-details-row`,
      driver,
    });
    expect(includedFeeDetailsRow).toBeTruthy();

    await findElementByTestIdAndClick({
      id: 'included-fee-carrousel-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'included-fee-carrousel-button',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'swap-review-rnbw-fee-info-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'explainer-action-button',
      driver,
    });

    const moreDetailsHiddendDetailsRow = await findElementByTestId({
      id: `more-details-hidden-details-row`,
      driver,
    });
    expect(moreDetailsHiddendDetailsRow).toBeTruthy();

    await findElementByTestIdAndClick({
      id: 'swap-review-more-details-button',
      driver,
    });

    const moreDetailsdSection = await findElementByTestId({
      id: `more-details-section`,
      driver,
    });
    expect(moreDetailsdSection).toBeTruthy();

    const exchangeRateDetailsRow = await findElementByTestId({
      id: `exchange-rate-details-row`,
      driver,
    });
    expect(exchangeRateDetailsRow).toBeTruthy();

    await findElementByTestIdAndClick({
      id: 'exchange-rate-carrousel-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'exchange-rate-carrousel-button',
      driver,
    });

    // ETH is selected as input so there's no contract
    await doNotFindElementByTestId({
      id: `asset-to-sell-contract-details-row`,
      driver,
    });

    const assetToBuyContractDetailsRow = await findElementByTestId({
      id: `asset-to-buy-contract-details-row`,
      driver,
    });
    expect(assetToBuyContractDetailsRow).toBeTruthy();

    await findElementByTestIdAndClick({
      id: 'asset-to-buy-swap-view-contract-dropdown',
      driver,
    });
    const assetToSellContractDropdiwnView = await findElementByTestId({
      id: 'asset-to-buy-view-swap-view-contract-dropdown',
      driver,
    });
    expect(assetToSellContractDropdiwnView).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'asset-to-buy-copy-swap-view-contract-dropdown',
      driver,
    });

    const swapReviewConfirmationText = await getTextFromText({
      id: 'swap-review-confirmation-text',
      driver,
    });
    expect(swapReviewConfirmationText).toBe('Swap ETH to USDC');

    const swapReviewTitleText = await getTextFromText({
      id: 'swap-review-title-text',
      driver,
    });
    expect(swapReviewTitleText).toBe('Review & Swap');
  });

  it('should be able to execute swap of ETH to USDC', async () => {
    const provider = new StaticJsonRpcProvider('http://127.0.0.1:8545');
    await provider.ready;

    console.log('Network Version:', await provider.getNetwork());

    await delayTime('short');

    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back-swap-review',
      driver,
    });
    await delayTime('short');

    await findElementByTestIdAndClick({
      id: 'swap-settings-navbar-button',
      driver,
    });
    await delayTime('short');
    await clearInput({
      id: 'slippage-input-mask',
      driver,
    });
    await typeOnTextInput({
      id: 'slippage-input-mask',
      driver,
      text: '99',
    });
    await delayTime('medium');

    await findElementByTestIdAndClick({ id: 'swap-settings-done', driver });

    const ethBalanceBeforeSwap = await provider.getBalance(
      WALLET_TO_USE_ADDRESS,
    );
    await delayTime('very-long');
    await findElementByTestIdAndClick({
      id: 'swap-confirmation-button-ready',
      driver,
    });
    await delayTime('medium');

    await findElementByTestIdAndClick({ id: 'swap-review-execute', driver });

    const txHash = await getLatestTransactionHash(
      provider,
      WALLET_TO_USE_ADDRESS,
      20,
      5000,
    );

    if (!txHash) {
      throw new Error('Failed to find the transaction hash');
    }

    const { status, receipt } = await waitForAndCheckTransaction(
      provider,
      txHash,
    );

    if (status !== 'success' || !receipt) {
      throw new Error(
        `Swap transaction failed or timed out. Status: ${status}`,
      );
    }

    const ethBalanceAfterSwap = await provider.getBalance(
      WALLET_TO_USE_ADDRESS,
    );

    const balanceDifference = subtract(
      ethBalanceBeforeSwap.toString(),
      ethBalanceAfterSwap.toString(),
    );
    const ethDifferenceAmount = convertRawAmountToDecimalFormat(
      balanceDifference,
      18,
    );

    expect(Number(ethDifferenceAmount)).toBeGreaterThan(1);
  });

  it('should be able to go to swap flow', async () => {
    await delayTime('very-long');
    await delayTime('very-long');
    await delayTime('very-long');
    await findElementByTestIdAndClick({ id: 'header-link-swap', driver });
    await delayTime('long');
  });

  it('should be able to go to review a unlock and swap', async () => {
    await delayTime('very-long');
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-token-input-remove`,
      driver,
    });
    await delayTime('medium');
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-row`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    await clearInput({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    await typeOnTextInput({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      text: `\b50`,
      driver,
    });
    await delayTime('very-long');
  });

  it('should be able to execute unlock and swap of USDC to ETH', async () => {
    await delayTime('very-long');
    const provider = new StaticJsonRpcProvider('http://127.0.0.1:8545');
    await provider.ready;
    await delayTime('short');
    const tokenContract = new Contract(
      SWAP_VARIABLES.USDC_MAINNET_ADDRESS,
      erc20Abi,
      provider,
    );
    const usdcBalanceBeforeSwap = await tokenContract.balanceOf(
      WALLET_TO_USE_ADDRESS,
    );

    await findElementByTestIdAndClick({
      id: 'swap-settings-navbar-button',
      driver,
    });
    await delayTime('short');
    await clearInput({
      id: 'slippage-input-mask',
      driver,
    });
    await typeOnTextInput({
      id: 'slippage-input-mask',
      driver,
      text: '99',
    });
    await delayTime('long');

    await findElementByTestIdAndClick({ id: 'swap-settings-done', driver });

    await waitUntilElementByTestIdIsPresent({
      id: 'swap-confirmation-button-ready',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'swap-confirmation-button-ready',
      driver,
    });
    await delayTime('very-long');
    await delayTime('very-long');

    await findElementByTestIdAndClick({ id: 'swap-review-execute', driver });

    const txHash = await getLatestTransactionHash(
      provider,
      WALLET_TO_USE_ADDRESS,
      20,
      5000,
    );

    if (!txHash) {
      throw new Error('Failed to find the transaction hash');
    }

    console.log('Waiting for transaction to be mined...');
    const { status, receipt } = await waitForAndCheckTransaction(
      provider,
      txHash,
    );

    if (status !== 'success' || !receipt) {
      throw new Error(
        `Swap transaction failed or timed out. Status: ${status}`,
      );
    }

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
