import 'chromedriver';
import 'geckodriver';
import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { ChainId } from '@rainbow-me/swaps';
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
  doNotFindElementByTestId,
  fillPrivateKey,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  getTextFromText,
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

  afterAll(() => driver?.quit());

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
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-token-input-remove`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-row`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    await delayTime('very-long');
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

  // TODO: fix. with mocking set up, currently this swap fails. You can see in the anvil logs that it is reverted.
  // My best guess is its on the provider level bc its throwing a custom error. Ideally we can un-skip this
  // bc its our only token > ETH swap we have on e2e. To see behavior just un-skip and run tests.
  it.todo('should be able to execute unlock and swap', async () => {
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
      text: '15',
    });
    await findElementByTextAndClick(driver, 'Auto');
    await findElementByTextAndClick(driver, '1inch');
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

  it.todo('should be able to go to swap flow', async () => {
    await findElementByTestIdAndClick({ id: 'header-link-swap', driver });
    await delayTime('long');
  });

  it.todo('should be able to go to review a crosschain swap', async () => {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-row`,
      driver,
    });
    await delayTime('medium');
    const toSellInputDaiSelected = await findElementByTestId({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    expect(toSellInputDaiSelected).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'token-to-buy-search-token-input',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'token-to-buy-networks-trigger',
      driver,
    });
    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.arbitrum}`,
      driver,
    });
    const daiBridge = await findElementByTestId({
      id: `${SWAP_VARIABLES.DAI_ARBITRUM_ID}-bridge-token-to-buy-row`,
      driver,
    });
    expect(daiBridge).toBeTruthy();

    await typeOnTextInput({
      id: 'token-to-buy-search-token-input',
      driver,
      text: 'USDC',
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_ARBITRUM_ID}-favorites-token-to-buy-row`,
      driver,
    });
    const toBuyInputUsdcSelected = await findElementByTestId({
      id: `${SWAP_VARIABLES.USDC_ARBITRUM_ID}-token-to-buy-swap-token-input-swap-input-mask`,
      driver,
    });
    expect(toBuyInputUsdcSelected).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'token-to-sell-info-max-button',
      driver,
    });
    await waitUntilElementByTestIdIsPresent({
      id: 'swap-confirmation-button-ready',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'swap-confirmation-button-ready',
      driver,
    });

    await delayTime('long');
    const longWaitExplainerFound = await doNotFindElementByTestId({
      id: 'explainer-sheet-swap-long-wait',
      driver,
    });

    if (longWaitExplainerFound) {
      await findElementByTestIdAndClick({
        id: 'explainer-action-button',
        driver,
      });
    }
  });

  it.todo(
    'should be able to see crosschain swap information in review sheet',
    async () => {
      await delayTime('long');
      const daiAssetToSellAssetCard = await findElementByTestId({
        id: `DAI-asset-to-sell-swap-asset-card`,
        driver,
      });
      expect(daiAssetToSellAssetCard).toBeTruthy();
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

      const assetToSellContractDetailsRow = await findElementByTestId({
        id: `asset-to-sell-contract-details-row`,
        driver,
      });
      expect(assetToSellContractDetailsRow).toBeTruthy();

      const assetToBuyContractDetailsRow = await findElementByTestId({
        id: `asset-to-buy-contract-details-row`,
        driver,
      });
      expect(assetToBuyContractDetailsRow).toBeTruthy();

      await findElementByTestIdAndClick({
        id: 'asset-to-sell-swap-view-contract-dropdown',
        driver,
      });
      const assetToSellContractDropdownView = await findElementByTestId({
        id: 'asset-to-sell-view-swap-view-contract-dropdown',
        driver,
      });
      expect(assetToSellContractDropdownView).toBeTruthy();
      await findElementByTestIdAndClick({
        id: 'asset-to-sell-copy-swap-view-contract-dropdown',
        driver,
      });

      await findElementByTestIdAndClick({
        id: 'asset-to-buy-swap-view-contract-dropdown',
        driver,
      });
      const assetToBuyContractDropdownView = await findElementByTestId({
        id: 'asset-to-buy-view-swap-view-contract-dropdown',
        driver,
      });
      expect(assetToBuyContractDropdownView).toBeTruthy();
      await findElementByTestIdAndClick({
        id: 'asset-to-buy-copy-swap-view-contract-dropdown',
        driver,
      });

      const swapReviewConfirmationText = await getTextFromText({
        id: 'swap-review-confirmation-text',
        driver,
      });
      expect(swapReviewConfirmationText).toBe('Swap DAI to USDC');

      const swapReviewTitleText = await getTextFromText({
        id: 'swap-review-title-text',
        driver,
      });
      expect(swapReviewTitleText).toBe('Review & Swap');

      await findElementByTestIdAndClick({
        id: 'navbar-button-with-back-swap-review',
        driver,
      });
      await delayTime('long');
    },
  );

  it.todo('should be able to go to review a bridge', async () => {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-sell-token-input-remove`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-row`,
      driver,
    });
    await delayTime('medium');
    const toSellInputEthSelected = await findElementByTestId({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
    expect(toSellInputEthSelected).toBeTruthy();
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.USDC_ARBITRUM_ID}-token-to-buy-token-input-remove`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'token-to-buy-networks-trigger',
      driver,
    });
    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.optimism}`,
      driver,
    });
    await typeOnTextInput({
      id: 'token-to-buy-search-token-input',
      driver,
      text: 'eth',
    });
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.ETH_OPTIMISM_ID}-bridge-token-to-buy-row`,
      driver,
    });
    const toBuyInputEthSelected = await findElementByTestId({
      id: `${SWAP_VARIABLES.ETH_OPTIMISM_ID}-token-to-buy-swap-token-input-swap-input-mask`,
      driver,
    });
    expect(toBuyInputEthSelected).toBeTruthy();
    await typeOnTextInput({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      text: 1,
      driver,
    });

    await waitUntilElementByTestIdIsPresent({
      id: 'swap-confirmation-button-ready',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'swap-confirmation-button-ready',
      driver,
    });

    const longWaitExplainerFound = await doNotFindElementByTestId({
      id: 'explainer-sheet-swap-long-wait',
      driver,
    });

    if (longWaitExplainerFound) {
      await findElementByTestIdAndClick({
        id: 'explainer-action-button',
        driver,
      });
    }

    await delayTime('long');
  });

  it.todo(
    'should be able to see bridge information in review sheet',
    async () => {
      const ethAssetToSellAssetCard = await findElementByTestId({
        id: `ETH-asset-to-sell-swap-asset-card`,
        driver,
      });
      expect(ethAssetToSellAssetCard).toBeTruthy();
      const ethAssetToBuyAssetCard = await findElementByTestId({
        id: `ETH-asset-to-buy-swap-asset-card`,
        driver,
      });
      expect(ethAssetToBuyAssetCard).toBeTruthy();
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

      const assetToSellContractRow = await doNotFindElementByTestId({
        id: `asset-to-sell-contract-details-row`,
        driver,
      });
      expect(assetToSellContractRow).toBeFalsy();

      const assetToBuyContractRow = await doNotFindElementByTestId({
        id: `asset-to-buy-contract-details-row`,
        driver,
      });
      expect(assetToBuyContractRow).toBeFalsy();

      const swapReviewConfirmationText = await getTextFromText({
        id: 'swap-review-confirmation-text',
        driver,
      });
      expect(swapReviewConfirmationText).toBe('Bridge ETH');

      const swapReviewTitleText = await getTextFromText({
        id: 'swap-review-title-text',
        driver,
      });
      expect(swapReviewTitleText).toBe('Review & Bridge');

      await findElementByTestIdAndClick({
        id: 'navbar-button-with-back-swap-review',
        driver,
      });
      await delayTime('very-long');
    },
  );
});
