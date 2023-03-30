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
  getTextFromTextInput,
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
const ZEROX_MAINNET_ID = '0xe41d2489571d322189246dafa5ebde1f4699f498_1';
const ETH_MAINNET_ID = 'eth_1';
const OP_OPTIMISM_ID = '0x4200000000000000000000000000000000000042_10';
const MATIC_POLYGON_ID = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0_137';
const GMX_ARBITRUM_ID = '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a_42161';
const USDC_ARBITRUM_ID = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_42161';
const UNI_BNB_ID = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984_56';

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
  await findElementAndClick({ id: 'header-link-swap', driver });
});

it.skip('should be able to go to swap settings and check rows are visible', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-navbar-button',
    driver,
  });
  const routeRow = await findElementByTestId({
    id: 'swap-settings-route-row',
    driver,
  });
  expect(routeRow).toBeTruthy();
  const slippageRow = await findElementByTestId({
    id: 'swap-settings-slippage-row',
    driver,
  });
  expect(slippageRow).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'swap-settings-done',
    driver,
  });
});

it.skip('should be able to go to settings and turn on flashbots', async () => {
  await findElementByTestIdAndClick({ id: 'navbar-button-with-back', driver });
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
  await findElementByTestIdAndClick({ id: 'settings-transactions', driver });
  await findElementByTestIdAndClick({
    id: 'flashbots-transactions-toggle',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
  await findElementAndClick({ id: 'header-link-swap', driver });
});

it.skip('should be able to go to swap settings and check flashbots row is visible', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-navbar-button',
    driver,
  });

  const flashbotsRow = await findElementByTestId({
    id: 'swap-settings-flashbots-row',
    driver,
  });
  expect(flashbotsRow).toBeTruthy();
});

it.skip('should be able to interact with route settings', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-route-label',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'explainer-action-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'settings-route-context-trigger-auto',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'settings-route-context-0x',
    driver,
  });
});

it.skip('should be able to interact with flashbots settings', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-flashbots-label',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'explainer-action-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'swap-settings-flashbots-toggle',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'swap-settings-flashbots-toggle',
    driver,
  });
});

it.skip('should be able to interact with slippage settings', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-slippage-label',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'explainer-action-button',
    driver,
  });
  await typeOnTextInput({
    id: 'slippage-input-mask',
    driver,
    text: '\b4',
  });

  const warning = findElementByTestId({
    id: 'swap-settings-slippage-warning',
    driver,
  });
  expect(warning).toBeTruthy();
});

it.skip('should be able to set default values for settings and go back to swap', async () => {
  await findElementByTestIdAndClick({
    id: 'settings-use-defaults-button',
    driver,
  });
  const routeTriggerAuto = await findElementByTestId({
    id: 'settings-route-context-trigger-auto',
    driver,
  });
  expect(routeTriggerAuto).toBeTruthy();
  const text = await getTextFromTextInput({
    id: 'slippage-input-mask',
    driver,
  });
  expect(text).toBe('1');
  await findElementByTestIdAndClick({ id: 'swap-settings-done', driver });
});

it.skip('should be able to open token to sell input and select assets', async () => {
  // await findElementByTestIdAndClick({
  //   id: 'token-to-sell-search-token-input',
  //   driver,
  // });
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
    id: `${ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  const toSellInputEthSelected = await findElementByTestId({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });
  const toBuyInputEthSelected = await findElementByTestId({
    id: `${ETH_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputEthSelected).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });
});

it.skip('should be able to open press max on token to sell input', async () => {
  const fiatValueText = await getTextFromText({
    id: 'token-to-sell-info-fiat-value',
    driver,
  });
  expect(fiatValueText).toBe('$0.00');
  await findElementByTestIdAndClick({
    id: 'token-to-sell-info-max-button',
    driver,
  });
  const ethValueBeforeGas = await getTextFromTextInput({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(ethValueBeforeGas).toEqual('10000');
  const fiatValueTextAfterMax = await getTextFromText({
    id: 'token-to-sell-info-fiat-value',
    driver,
  });
  expect(fiatValueTextAfterMax).not.toEqual('$0.00');
});

it.skip('should be able to remove token to sell and select it again', async () => {
  await findElementByTestIdAndClick({
    id: `${ETH_MAINNET_ID}-token-to-sell-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  const toSellInputEthSelected = await findElementByTestId({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();
  // should clear input value
  const ethValueAfterSelection = await getTextFromTextInput({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(ethValueAfterSelection).toEqual('');
});

it.skip('should be able to open token to buy input and select assets', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-buy-search-token-input',
    driver,
  });
  // check sell asset is not present as buy option
  const elementFound = await doNotFindElementByTestId({
    id: `${ETH_MAINNET_ID}-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${DAI_MAINNET_ID}-favorites-token-to-buy-row`,
    driver,
  });
  expect(elementFound).toBeFalsy();
  const toBuyInputDaiSelected = await findElementByTestId({
    id: `${DAI_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputDaiSelected).toBeTruthy();
});

it.skip('should be able to open remove token to buy and check favorites and verified lists are visible', async () => {
  await findElementByTestIdAndClick({
    id: `${DAI_MAINNET_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  const favoritesSection = await findElementByTestId({
    id: 'favorites-token-to-buy-section',
    driver,
  });
  expect(favoritesSection).toBeTruthy();
  const verifiedSection = await findElementByTestId({
    id: 'verified-token-to-buy-section',
    driver,
  });
  expect(verifiedSection).toBeTruthy();
});

it.skip('should be able to favorite a token and check the info button is present', async () => {
  await findElementByTestIdAndClick({
    id: `${ZEROX_MAINNET_ID}-verified-token-to-buy-row-favorite-button`,
    driver,
  });
  await delayTime('short');
  await findElementByTestIdAndClick({
    id: `${ZEROX_MAINNET_ID}-favorites-token-to-buy-row-info-button`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${ZEROX_MAINNET_ID}-favorites-token-to-buy-row-info-button-copy`,
    driver,
  });
});

it.skip('should be able to check price and balance of token to buy', async () => {
  const tokenToBuyInfoPrice = await getTextFromText({
    id: 'token-to-buy-info-price',
    driver,
  });
  expect(tokenToBuyInfoPrice).not.toBe('');
  const tokenToBuyInfoBalance = await getTextFromText({
    id: 'token-to-buy-info-balance',
    driver,
  });
  expect(tokenToBuyInfoBalance).not.toBe('');
});

it.skip('should be able to flip correctly', async () => {
  await findElementByTestIdAndClick({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  await typeOnTextInput({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: 1,
    driver,
  });
  const assetToSellInputText = await getTextFromTextInput({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToSellInputText).toBe('1');

  await delayTime('very-long');

  const assetToBuyInputText = await getTextFromTextInput({
    id: `${ZEROX_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToBuyInputText).not.toBe('');

  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });

  await delayTime('long');

  const assetToSellInputTextAfterMax = await getTextFromTextInput({
    id: `${ZEROX_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });

  expect(assetToSellInputTextAfterMax).not.toEqual('');

  const assetToBuyInputTextAfterMax = await getTextFromTextInput({
    id: `${ETH_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  console.log('-- assetToBuyInputTextAfterMax', assetToBuyInputTextAfterMax);
  expect(assetToBuyInputTextAfterMax).toEqual('1');
});

it.skip('should be able to check insufficient asset for swap', async () => {
  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button',
    driver,
  });
  expect(confirmButtonText).toEqual('Insufficient ZRX');
});

it.skip('should be able to check insufficient native asset for gas', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });
  await delayTime('short');
  await typeOnTextInput({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: `\b10000`,
    driver,
  });
  await delayTime('very-long');
  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button',
    driver,
  });
  expect(confirmButtonText).toEqual('Insufficient ETH for gas');
});

it.skip('should be able to see small market warning', async () => {
  const swapWarning = await findElementByTestId({
    id: 'swap-warning-price-impact',
    driver,
  });
  expect(swapWarning).toBeTruthy();
});

it.skip('should be able to filter assets to buy by network', async () => {
  // OP
  await findElementByTestIdAndClick({
    id: `${ZEROX_MAINNET_ID}-token-to-buy-token-input-remove`,
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
    text: 'op',
  });
  await findElementByTestIdAndClick({
    id: `${OP_OPTIMISM_ID}-favorites-token-to-buy-row`,
    driver,
  });
  // POLYGON
  await findElementByTestIdAndClick({
    id: `${OP_OPTIMISM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'switch-network-item-1',
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'matic',
  });
  await findElementByTestIdAndClick({
    id: `${MATIC_POLYGON_ID}-favorites-token-to-buy-row`,
    driver,
  });
  // ARBITRUM
  await findElementByTestIdAndClick({
    id: `${MATIC_POLYGON_ID}-token-to-buy-token-input-remove`,
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
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'gmx',
  });
  await findElementByTestIdAndClick({
    id: `${GMX_ARBITRUM_ID}-verified-token-to-buy-row`,
    driver,
  });
  // BNB
  await findElementByTestIdAndClick({
    id: `${GMX_ARBITRUM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'switch-network-item-4',
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'uni',
  });
  await findElementByTestIdAndClick({
    id: `${UNI_BNB_ID}-verified-token-to-buy-row`,
    driver,
  });
});

it.skip('should be able to see no route explainer', async () => {
  await findElementByTestIdAndClick({
    id: `${UNI_BNB_ID}-token-to-buy-token-input-remove`,
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
    text: 'op',
  });
  await findElementByTestIdAndClick({
    id: `${OP_OPTIMISM_ID}-favorites-token-to-buy-row`,
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });
  await delayTime('short');

  await findElementByTestIdAndClick({
    id: `${ETH_MAINNET_ID}-token-to-buy-token-input-remove`,
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
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'gmx',
  });
  await findElementByTestIdAndClick({
    id: `${GMX_ARBITRUM_ID}-verified-token-to-buy-row`,
    driver,
  });

  await typeOnTextInput({
    id: `${OP_OPTIMISM_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
    text: 1,
  });

  await delayTime('long');
  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button',
    driver,
  });
  expect(confirmButtonText).toEqual('No route found');

  await findElementByTestIdAndClick({
    id: 'swap-confirmation-button',
    driver,
  });

  const noRouteExplainer = await findElementByTestId({
    id: 'explainer-sheet-swap-no-route',
    driver,
  });
  expect(noRouteExplainer).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'explainer-action-button',
    driver,
  });
});

it.skip('should be able to find exact match on other networks', async () => {
  await findElementByTestIdAndClick({
    id: `${OP_OPTIMISM_ID}-token-to-sell-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `token-to-sell-search-token-input`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${GMX_ARBITRUM_ID}-token-to-buy-token-input-remove`,
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'switch-network-item-1',
    driver,
  });

  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'optimism',
  });

  const onOtherNetworksSections = await findElementByTestId({
    id: 'other_networks-token-to-buy-section',
    driver,
  });

  expect(onOtherNetworksSections).toBeTruthy();

  await findElementByTestIdAndClick({
    id: `${OP_OPTIMISM_ID}-other_networks-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${OP_OPTIMISM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-search-token-input',
    driver,
  });
});

it('should be able to go to review a swap', async () => {
  // await findElementByTestIdAndClick({
  //   id: 'token-to-sell-search-token-input',
  //   driver,
  // });
  await findElementByTestIdAndClick({
    id: `${ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  const toSellInputEthSelected = await findElementByTestId({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'token-to-buy-search-token-input',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${DAI_MAINNET_ID}-favorites-token-to-buy-row`,
    driver,
  });
  const toBuyInputDaiSelected = await findElementByTestId({
    id: `${DAI_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputDaiSelected).toBeTruthy();
  await typeOnTextInput({
    id: `${ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: 1,
    driver,
  });
  await delayTime('very-long');
  await findElementByTestIdAndClick({ id: 'swap-confirmation-button', driver });
  await delayTime('very-long');
});

it('should be able to see every information row in review sheet', async () => {
  const ethAssetToSellAssetCard = await findElementByTestId({
    id: `ETH-asset-to-sell-swap-asset-card`,
    driver,
  });
  expect(ethAssetToSellAssetCard).toBeTruthy();
  const daiAssetToBuyAssetCard = await findElementByTestId({
    id: `DAI-asset-to-buy-swap-asset-card`,
    driver,
  });
  expect(daiAssetToBuyAssetCard).toBeTruthy();
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
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back-swap-review',
    driver,
  });
  await delayTime('very-long');
});

it.skip('should be able to clear assets', async () => {
  await findElementByTestIdAndClick({
    id: `${ETH_MAINNET_ID}-token-to-sell-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${DAI_MAINNET_ID}-token-to-buy-token-input-remove`,
    driver,
  });
});

it('should be able to go to review a crosschain swap', async () => {
  await findElementByTestIdAndClick({
    id: `${ETH_MAINNET_ID}-token-to-sell-token-input-remove`,
    driver,
  });
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
  await typeOnTextInput({
    id: `${DAI_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: 1,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-sell-info-max-button',
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

it('should be able to see every information row in review sheet', async () => {
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
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back-swap-review',
    driver,
  });
  await delayTime('very-long');
});
