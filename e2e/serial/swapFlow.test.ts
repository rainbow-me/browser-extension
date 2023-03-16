/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, expect, it } from 'vitest';

import {
  delayTime,
  findElementAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
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
  await findElementAndClick({ id: 'home-page-header-right', driver });
  await findElementAndClick({ id: 'settings-link', driver });
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

it('should be able to go to swap settings and check rows are visible', async () => {
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

it('should be able to go to settings and turn on flashbots', async () => {
  await findElementByTestIdAndClick({ id: 'navbar-button-with-back', driver });
  await findElementAndClick({ id: 'home-page-header-right', driver });
  await findElementAndClick({ id: 'settings-link', driver });
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

it('should be able to go to swap settings and check flashbots row is visible', async () => {
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

it('should be able to interact with flashbots settings', async () => {
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
    text: '\b4',
  });

  const warning = findElementByTestId({
    id: 'swap-settings-slippage-warning',
    driver,
  });
  expect(warning).toBeTruthy();
});

it('should be able to set default values for settings and go back to swap', async () => {
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

it('should be able to open token to sell input', async () => {
  await findElementByTestIdAndClick({
    id: 'input-wrapper-dropdown-token-to-sell-token-input',
    driver,
  });
});
