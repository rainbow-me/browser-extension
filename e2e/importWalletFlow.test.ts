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
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  goToPopup,
  goToTestApp,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  typeOnTextInput,
  waitAndClick,
} from './helpers';

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

// Import a wallet
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

it('should be able to connect to bx test dapp', async () => {
  await delayTime('long');
  await goToTestApp(driver);
  const dappHandler = await driver.getWindowHandle();

  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);

  const modalTitle = await findElementByText(driver, 'Connect a Wallet');
  expect(modalTitle).toBeTruthy();

  const mmButton = await querySelector(
    driver,
    '[data-testid="rk-wallet-option-rainbow"]',
  );
  await waitAndClick(mmButton, driver);

  // wait for window handlers to update
  await delayTime('medium');
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);

  // switch account
  await findElementAndClick({ id: 'switch-wallet-menu', driver });
  await findElementAndClick({ id: 'switch-wallet-item-0', driver });
  // switch network
  await findElementAndClick({ id: 'switch-network-menu', driver });
  await findElementAndClick({ id: 'switch-network-item-1', driver });

  await delayTime('medium');
  await findElementAndClick({ id: 'accept-request-button', driver });

  await driver.switchTo().window(dappHandler);
  const topButton = await querySelector(
    driver,
    '[data-testid="rk-account-button"]',
  );

  expect(topButton).toBeTruthy();
  await waitAndClick(topButton, driver);

  const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
  expect(ensLabel).toBeTruthy();
});

it('should be able to go back to extension and switch account and chain', async () => {
  await goToPopup(driver, rootURL);
  await findElementAndClick({ id: 'home-page-header-left', driver });
  await findElementAndClick({ id: 'home-page-header-connected-apps', driver });
  await findElementAndClick({ id: 'switch-network-menu', driver });
  await findElementAndClick({ id: 'switch-network-item-2', driver });

  await goToTestApp(driver);
  const expectedNetwork = 'Network: Polygon - matic';
  const network = await querySelector(driver, '[id="network"]');
  const actualNetwork = await network.getText();
  expect(actualNetwork).toEqual(expectedNetwork);

  const expectedAccountAddress = 'Account: 0x';
  const accountAddress = await querySelector(driver, '[id="accountAddress"]');
  const actualAccountAddress = await accountAddress.getText();
  expect(actualAccountAddress.includes(expectedAccountAddress)).toBe(true);
});

it('should be able to accept a signing request', async () => {
  await goToTestApp(driver);

  const dappHandler = await driver.getWindowHandle();
  const button = await querySelector(driver, '[id="signTx"]');
  expect(button).toBeTruthy();
  await button.click();

  await delayTime('medium');
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);

  await delayTime('medium');
  await findElementAndClick({ id: 'accept-request-button', driver });

  await delayTime('medium');
  await driver.switchTo().window(dappHandler);
});

it.skip('should be able to accept a typed data signing request', async () => {
  // TODO check if the signature is correct, we're not signing anything yet
  await delayTime('long');
  const dappHandler = await driver.getWindowHandle();

  const button = await querySelector(driver, '[id="signTypedData"]');
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);
  await delayTime('medium');
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  await delayTime('medium');
  await findElementAndClick({ id: 'accept-request-button', driver });
  await delayTime('medium');
  await driver.switchTo().window(dappHandler);
});

it.skip('should be able to accept a transaction request', async () => {
  // TODO send tx, we're not signing anything yet
  await delayTime('long');
  const dappHandler = await driver.getWindowHandle();

  const button = await querySelector(driver, '[id="sendTx"]');
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);
  await delayTime('medium');
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  await delayTime('medium');
  await findElementAndClick({ id: 'accept-request-button', driver });
  await driver.switchTo().window(dappHandler);
});

it('should be able to disconnect from connected dapps', async () => {
  await goToPopup(driver, rootURL);
  await findElementAndClick({ id: 'home-page-header-left', driver });
  await findElementAndClick({ id: 'home-page-header-connected-apps', driver });
  await findElementAndClick({ id: 'switch-network-menu', driver });
  await findElementAndClick({ id: 'switch-network-menu-disconnect', driver });
  await goToTestApp(driver);
  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
});

it('should be able to test the sandbox for the popup', async () => {
  await goToPopup(driver, rootURL);
  await findElementAndClick({ id: 'home-page-header-right', driver });
  await findElementAndClick({ id: 'settings-link', driver });
  const btn = await querySelector(driver, '[data-testid="test-sandbox-popup"]');
  await waitAndClick(btn, driver);
  const text = await driver.switchTo().alert().getText();
  expect(text).toBe('Popup sandboxed!');
  await driver.switchTo().alert().accept();
});

it('should be able to test the sandbox for the background', async () => {
  const btn = await querySelector(
    driver,
    '[data-testid="test-sandbox-background"]',
  );
  await waitAndClick(btn, driver);
  await delayTime('long');
  const text = await driver.switchTo().alert().getText();
  expect(text).toBe('Background sandboxed!');
  await driver.switchTo().alert().accept();
});
