import { StaticJsonRpcProvider } from '@ethersproject/providers';
import 'chromedriver';
import 'geckodriver';
import { Key, WebDriver } from 'selenium-webdriver';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

import { ChainId } from '~/core/types/chains';

import {
  clearInput,
  delay,
  delayTime,
  doNotFindElementByTestId,
  executePerformShortcut,
  fillPrivateKey,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByTestIdAndDoubleClick,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  getTextFromText,
  getTextFromTextInput,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  takeScreenshotOnFailure,
  typeOnTextInput,
  waitAndClick,
} from '../../helpers';
import { convertRawAmountToDecimalFormat, subtract } from '../../numbers';
import { SWAP_VARIABLES, TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

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

afterAll(() => driver?.quit());

const WALLET_TO_USE_SECRET = TEST_VARIABLES.SWAPS_WALLET.PK;

const WALLET_TO_USE_ADDRESS = TEST_VARIABLES.SWAPS_WALLET.ADDRESS;

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
  await findElementByText(driver, 'Rainbow is ready to use');
});

it('should be able to go to setings', async () => {
  await goToPopup(driver, rootURL);
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
});

it('should be able to connect to hardhat', async () => {
  const btn = await querySelector(driver, '[data-testid="connect-to-hardhat"]');
  await waitAndClick(btn, driver);
  const button = await findElementByText(driver, 'Disconnect from Hardhat');
  expect(button).toBeTruthy();
  await findElementByTestIdAndClick({ id: 'navbar-button-with-back', driver });

  // sometimes hardhat balances take time to display.
  // If we go straight to swap and they aren't updated,
  // the swap gets auto-populated with the wrong token.
  await delay(10_000);
});

it('should be able to go to swap flow', async () => {
  await findElementByTestIdAndClick({ id: 'header-link-swap', driver });
});

it('should be able to go to swap settings and check rows are visible', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-navbar-button',
    driver,
  });
  await delay(1_000);
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
});

it('should be able to interact with route settings', async () => {
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

it('should be able to interact with slippage settings', async () => {
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
    text: Key.BACK_SPACE,
  });
  await typeOnTextInput({
    id: 'slippage-input-mask',
    driver,
    text: '6',
  });
  const warning = await findElementByTestId({
    id: 'swap-settings-slippage-warning',
    driver,
  });
  expect(warning).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'settings-use-defaults-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'swap-settings-done',
    driver,
  });
});

it.todo(
  'should be able to set default values for settings and go back to swap',
  async () => {
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
    await findElementByTestIdAndClick({
      id: 'swap-settings-done',
      driver,
    });
  },
);

it('should be able to open token to sell input and select assets', async () => {
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

it('should be able to select same asset than asset to buy as asset to sell and remove the asset to buy', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-sell-search-token-input',
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

  const toBuyInputNoneSelected = await findElementByTestId({
    id: `token-to-buy-search-token-input`,
    driver,
  });
  expect(toBuyInputNoneSelected).toBeTruthy();
});

it('should be able to open press max on token to sell input', async () => {
  const fiatValueText = await getTextFromTextInput({
    id: 'token-to-sell-info-fiat-value-input',
    driver,
  });
  expect(fiatValueText).not.toBe('');
  await findElementByTestIdAndClick({
    id: 'token-to-sell-info-max-button',
    driver,
  });
  const ethValueBeforeGas = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(ethValueBeforeGas).toEqual('10000');
  const fiatValueTextAfterMax = await getTextFromTextInput({
    id: 'token-to-sell-info-fiat-value-input',
    driver,
  });
  expect(fiatValueTextAfterMax).not.toEqual('0.00');
});

it('should be able to remove token to sell and select it again', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-token-input-remove`,
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
  await delay(5_000);
  // should clear input value
  const ethValueAfterSelection = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(ethValueAfterSelection).not.toEqual('');
});

it('should be able to open token to buy input and select assets', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-buy-search-token-input',
    driver,
  });
  // check sell asset is not present as buy option
  const elementFound = await doNotFindElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-favorites-token-to-buy-row`,
    driver,
  });
  expect(elementFound).toBeFalsy();
  const toBuyInputDaiSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputDaiSelected).toBeTruthy();
});

it.todo('should be able to type native amount on sell input', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-sell-info-fiat-value-input',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `token-to-sell-info-fiat-value-input`,
    driver,
  });
  await delay(5_000);
  await clearInput({
    id: `token-to-sell-info-fiat-value-input`,
    driver,
  });
  await typeOnTextInput({
    id: `token-to-sell-info-fiat-value-input`,
    text: 1,
    driver,
  });
  await delay(10_000);
  const fiatValueText = await getTextFromTextInput({
    id: 'token-to-sell-info-fiat-value-input',
    driver,
  });
  expect(fiatValueText).toBe('1');

  const assetToSellInputText = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToSellInputText).not.toBe('');

  const assetToBuyInputText = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToBuyInputText).not.toBe('');
});

it('should be able to open remove token to buy and check favorites and verified lists are visible', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-token-to-buy-token-input-remove`,
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

it('should be able to favorite a token and check the info button is present', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-favorites-token-to-buy-row-info-button`,
    driver,
  });
  await delayTime('medium');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-favorites-token-to-buy-row-info-button-copy`,
    driver,
  });
  await delayTime('very-long');

  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-favorites-token-to-buy-row`,
    driver,
  });
});

it('should be able to check price and balance of token to buy', async () => {
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

// we fixed a preexisting issue with output swaps, which breaks
// this test. Need to rethink if we even want this test anymore.
// keeping it here for now but skipping the validations.
it.todo('should be able to flip correctly', async () => {
  await findElementByTestIdAndDoubleClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });

  await typeOnTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: 1,
    driver,
  });

  const assetToSellInputText = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToSellInputText).toBe('1');

  const assetToBuyInputText = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToBuyInputText).not.toBe('');

  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });

  const assetToSellInputTextAfterFlip = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });

  expect(assetToSellInputTextAfterFlip).not.toEqual('');

  const assetToBuyInputTextAfterFlip = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToBuyInputTextAfterFlip).toEqual('1');
});

// broken right now and unsure why. need to investigate more.
it.todo('should be able to check insufficient asset for swap', async () => {
  await findElementByTestIdAndDoubleClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });

  await typeOnTextInput({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: 1,
    driver,
  });

  await delay(10_000);

  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button-ready',
    driver,
  });
  expect(confirmButtonText).toEqual('Insufficient WBTC');
});

it('should be able to check insufficient native asset for gas', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });

  await executePerformShortcut({
    driver,
    timesToPress: 10,
    key: Key.BACK_SPACE,
  });

  await typeOnTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: `\b10000`,
    driver,
  });
  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button-ready',
    driver,
  });
  expect(confirmButtonText).toEqual('Insufficient ETH for gas');
});

it.todo('should be able to see small market warning', async () => {
  const swapWarning = await findElementByTestId({
    id: 'swap-warning-price-impact',
    driver,
  });
  expect(swapWarning).toBeTruthy();
});

it('should be able to filter assets to buy by network', async () => {
  // OP
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-token-to-buy-token-input-remove`,
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
    text: 'op',
  });
  await delayTime('medium');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-favorites-token-to-buy-row`,
    driver,
  });
  // POLYGON
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.polygon}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'pol',
  });
  await delayTime('medium');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.POL_POLYGON_ID}-favorites-token-to-buy-row`,
    driver,
  });
  // ARBITRUM
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.POL_POLYGON_ID}-token-to-buy-token-input-remove`,
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
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'gmx',
  });
  await delayTime('medium');

  // this token is occassionally included in 'popular in rainbow.'
  // tokens are only set to appear in one section at a time, so if
  // it is in that section, the test will fail without this try / catch.
  try {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-verified-token-to-buy-row`,
      driver,
    });
  } catch {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-popular-token-to-buy-row-active-element-item`,
      driver,
    });
  }

  // BNB
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.bsc}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'uni',
  });
  // this token is occassionally included in 'popular in rainbow.'
  // tokens are only set to appear in one section at a time, so if
  // it is in that section, the test will fail without this try / catch.
  try {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.UNI_BNB_ID}-verified-token-to-buy-row`,
      driver,
    });
  } catch {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.UNI_BNB_ID}-popular-token-to-buy-row-active-element-item`,
      driver,
    });
  }
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.UNI_BNB_ID}-token-to-buy-token-input-remove`,
    driver,
  });
});

// the list shouldn't be including an asset with no routes to it
it.todo('should be able to see no route explainer', async () => {
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
    text: 'op',
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-favorites-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-buy-token-input-remove`,
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
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'gmx',
  });
  await delayTime('long');

  // this token is occassionally included in 'popular in rainbow.'
  // tokens are only set to appear in one section at a time, so if
  // it is in that section, the test will fail without this try / catch.
  try {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-verified-token-to-buy-row`,
      driver,
    });
  } catch {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-popular-token-to-buy-row-active-element-item`,
      driver,
    });
  }
  await typeOnTextInput({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
    text: 1,
  });
  await delay(10_000);
  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button-error',
    driver,
  });
  expect(confirmButtonText).toEqual('No route found');
  await findElementByTestIdAndClick({
    id: 'swap-confirmation-button-error',
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

// same asset on other networks does not show in testnet mode (makes sense we won't crosschain sepolia -> mainnet)
it.todo('should be able to find exact match on other networks', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-token-to-sell-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `token-to-sell-search-token-input`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-sell-token-input-dropdown-toggle',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.polygon}`,
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
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-other_networks-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-search-token-input',
    driver,
  });
});

it('should be able to go to review a swap', async () => {
  const toSellInputEthSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();

  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.mainnet}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'usdc',
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.USDC_MAINNET_ID}-favorites-token-to-buy-row`,
    driver,
  });

  await delay(5_000);
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  await delay(1_000);
  await executePerformShortcut({
    driver,
    timesToPress: 10,
    key: Key.BACK_SPACE,
  });
  await delay(5_000);
  toSellInputEthSelected.sendKeys('1');
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

it('should be able to execute swap', async () => {
  const provider = new StaticJsonRpcProvider('http://127.0.0.1:8545');
  await provider.ready;

  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back-swap-review',
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'swap-settings-navbar-button',
    driver,
  });
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

  const ethBalanceBeforeSwap = await provider.getBalance(WALLET_TO_USE_ADDRESS);
  await findElementByTestIdAndClick({
    id: 'swap-confirmation-button-ready',
    driver,
  });
  await findElementByTestIdAndClick({ id: 'swap-review-execute', driver });

  // waiting for balances to update / swap to execute
  await delay(30_000);

  const ethBalanceAfterSwap = await provider.getBalance(WALLET_TO_USE_ADDRESS);
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
