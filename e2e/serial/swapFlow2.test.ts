/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, expect, it } from 'vitest';

import {
  delayTime,
  doNotFindElementByTestId,
  findElementAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getTextFromText,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  typeOnTextInput,
  waitAndClick,
} from '../helpers';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

const DAI_MAINNET_ID = '0x6b175474e89094c44da98b954eedeac495271d0f_1';
const DAI_ARBITRUM_ID = '0x6b175474e89094c44da98b954eedeac495271d0f_42161';
const ETH_MAINNET_ID = 'eth_1';
const ETH_OPTIMISM_ID = 'eth_10';
const USDC_ARBITRUM_ID = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_42161';

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

  await typeOnTextInput({
    id: 'secret-textarea',
    driver,
    text: 'test test test test test test test test test test test junk',
  });

  await findElementByTestIdAndClick({
    id: 'import-wallets-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'add-wallets-button',
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
  await findElementByText(driver, 'Your wallets ready');
});

it('should be able to go to setings', async () => {
  await goToPopup(driver, rootURL);
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
});

it('should be able to connect to hardhat and turn swaps flag on', async () => {
  const btn = await querySelector(driver, '[data-testid="connect-to-hardhat"]');
  await waitAndClick(btn, driver);
  const button = await findElementByText(driver, 'Disconnect from Hardhat');
  expect(button).toBeTruthy();
  await findElementByTestIdAndClick({ id: 'feature-flag-swaps', driver });
  await findElementByTestIdAndClick({ id: 'navbar-button-with-back', driver });
});

it('should be able to go to swap flow', async () => {
  await delayTime('very-long');
  await findElementAndClick({ id: 'header-link-swap', driver });
  await delayTime('very-long');
});

it('should be able to go to review a crosschain swap', async () => {
  await findElementByTestIdAndClick({
    id: `${DAI_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  await delayTime('medium');
  const toSellInputDaiSelected = await findElementByTestId({
    id: `${DAI_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
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
    id: 'switch-network-item-3',
    driver,
  });
  const daiBridge = await findElementByTestId({
    id: `${DAI_ARBITRUM_ID}-bridge-token-to-buy-row`,
    driver,
  });
  expect(daiBridge).toBeTruthy();

  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'USDC',
  });
  await findElementByTestIdAndClick({
    id: `${USDC_ARBITRUM_ID}-favorites-token-to-buy-row`,
    driver,
  });
  const toBuyInputUsdcSelected = await findElementByTestId({
    id: `${USDC_ARBITRUM_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputUsdcSelected).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'token-to-sell-info-max-button',
    driver,
  });
  await delayTime('very-long');
  await delayTime('very-long');

  await findElementByTestIdAndClick({
    id: 'swap-confirmation-button',
    driver,
  });

  await delayTime('medium');
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
  await delayTime('very-long');
});

it('should be able to see crosschain swap information in review sheet', async () => {
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
  await findElementByTestIdAndClick({ id: 'swapping-via-swap-routes', driver });
  await findElementByTestIdAndClick({ id: 'swapping-via-swap-routes', driver });
  await findElementByTestIdAndClick({ id: 'swapping-via-swap-routes', driver });

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
  await findElementByTestIdAndClick({ id: 'explainer-action-button', driver });

  // const flashbotsEnabledDetailsRow = await findElementByTestId({
  //   id: `flashbots-enabled-details-row`,
  //   driver,
  // });
  // expect(flashbotsEnabledDetailsRow).toBeTruthy();
  // await findElementByTestIdAndClick({
  //   id: 'swap-review-flashbots-info-button',
  //   driver,
  // });
  // await findElementByTestIdAndClick({ id: 'explainer-action-button', driver });

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
  await delayTime('very-long');
});

it('should be able to go to review a bridge', async () => {
  await findElementByTestIdAndClick({
    id: `${DAI_MAINNET_ID}-token-to-sell-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  await delayTime('medium');
  const toSellInputEthSelected = await findElementByTestId({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();
  await findElementByTestIdAndClick({
    id: `${USDC_ARBITRUM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'switch-network-item-2',
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'eth',
  });
  await findElementByTestIdAndClick({
    id: `${ETH_OPTIMISM_ID}-bridge-token-to-buy-row`,
    driver,
  });
  const toBuyInputEthSelected = await findElementByTestId({
    id: `${ETH_OPTIMISM_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputEthSelected).toBeTruthy();
  await typeOnTextInput({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: 1,
    driver,
  });

  await delayTime('very-long');

  await findElementByTestIdAndClick({
    id: 'swap-confirmation-button',
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

  await delayTime('very-long');
});

it('should be able to see bridge information in review sheet', async () => {
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
  await findElementByTestIdAndClick({ id: 'swapping-via-swap-routes', driver });

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
  await findElementByTestIdAndClick({ id: 'explainer-action-button', driver });

  // const flashbotsEnabledDetailsRow = await findElementByTestId({
  //   id: `flashbots-enabled-details-row`,
  //   driver,
  // });
  // expect(flashbotsEnabledDetailsRow).toBeTruthy();
  // await findElementByTestIdAndClick({
  //   id: 'swap-review-flashbots-info-button',
  //   driver,
  // });
  // await findElementByTestIdAndClick({ id: 'explainer-action-button', driver });

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
});
