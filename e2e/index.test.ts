/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, expect, it } from 'vitest';

import {
  delay,
  findElementByText,
  getExtensionIdByName,
  initDriverWithOptions,
  querySelector,
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

it('Should open the popup', async () => {
  await driver.get(rootURL + '/popup.html');
});

it('should display account name', async () => {
  const label = await querySelector(
    driver,
    '[data-testid="header"] [data-testid="account-name"]',
  );
  const actual = await label.getText();
  const expected = '0x70c1...43C4';
  expect(actual).toEqual(expected);
});

it('should shuffle account', async () => {
  await delay(500);
  await driver.findElement({ id: 'account-name-shuffle' }).click();
  const label = await querySelector(
    driver,
    '[data-testid="header"] [data-testid="account-name"]',
  );
  const actual = await label.getText();
  const expected = '0x5B57...7C35';
  expect(actual).toEqual(expected);
});

it('should be able to connect to bx test dapp', async () => {
  await driver.get('https://bx-test-dapp.vercel.app/');
  await delay(2000);

  const dappHandler = await driver.getWindowHandle();

  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
  await button.click();

  const modalTitle = await findElementByText(driver, 'Connect a Wallet');
  expect(modalTitle).toBeTruthy();

  const mmButton = await querySelector(
    driver,
    '[data-testid="rk-wallet-option-metaMask"]',
  );
  // wait for dapp
  await delay(500);
  await mmButton.click();

  // wait for window handlers to update
  await delay(100);
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  // wait for extension to load
  await delay(2000);

  // switch account
  await driver.findElement({ id: 'switch-wallet-menu' }).click();
  await driver.findElement({ id: 'switch-wallet-item-0' }).click();
  // switch network
  await driver.findElement({ id: 'switch-network-menu' }).click();
  await driver.findElement({ id: 'switch-network-item-1' }).click();

  await driver.findElement({ id: 'accept-request-button' }).click();

  await driver.switchTo().window(dappHandler);
  const topButton = await querySelector(
    driver,
    '[data-testid="rk-account-button"]',
  );

  expect(topButton).toBeTruthy();
  await topButton.click();

  const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
  expect(ensLabel).toBeTruthy();
});

it('should be able to go back to extension and switch account and chain', async () => {
  await driver.get(rootURL + '/popup.html');
  await driver.findElement({ id: 'injection-button' }).click();
  // Wait till the DOM re-renders
  await delay(1000);
  await driver.findElement({ id: 'injection-button' }).click();
  // Wait till the DOM re-renders
  await delay(1000);
  await delay(1000);
  await driver.findElement({ id: 'home-page-header-left' }).click();
  await delay(500);
  await driver.findElement({ id: 'home-page-header-connected-apps' }).click();

  await driver.findElement({ id: 'switch-network-menu' }).click();
  await driver.findElement({ id: 'switch-network-item-2' }).click();

  await delay(500);
  await driver.get('https://bx-test-dapp.vercel.app/');
  // wait for dapp to load new account and network
  await delay(2000);
  const expectedNetwork = 'Network: Polygon - matic';
  const network = await querySelector(driver, '[id="network"]');
  const actualNetwork = await network.getText();
  expect(actualNetwork).toEqual(expectedNetwork);

  const expectedAccountAddress =
    'Account: 0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
  const accountAddress = await querySelector(driver, '[id="accountAddress"]');
  const actualAccountAddress = await accountAddress.getText();
  expect(actualAccountAddress).toEqual(expectedAccountAddress);
});

it('should be able to accept a signing request', async () => {
  // switch session to mainnet
  await driver.get(rootURL + '/popup.html');
  await delay(500);
  await driver.findElement({ id: 'injection-button' }).click();
  // Wait till the DOM re-renders
  await delay(500);
  await driver.findElement({ id: 'injection-button' }).click();
  // Wait till the DOM re-renders
  await delay(500);
  await driver.findElement({ id: 'home-page-header-left' }).click();
  await delay(500);
  await driver.findElement({ id: 'home-page-header-connected-apps' }).click();
  await delay(500);

  await driver.findElement({ id: 'switch-network-menu' }).click();
  await driver.findElement({ id: 'switch-network-item-0' }).click();

  await delay(1000);
  await driver.get('https://bx-test-dapp.vercel.app/');
  await delay(2000);

  // TODO check if the signature is correct, we're not signing anything yet
  const dappHandler = await driver.getWindowHandle();

  const button = await querySelector(driver, '[id="signTypedData"]');
  expect(button).toBeTruthy();
  await button.click();
  await delay(500);

  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  await delay(2000);

  await driver.findElement({ id: 'accept-request-button' }).click();
  await delay(500);
  await driver.switchTo().window(dappHandler);

  await delay(1000);

  const buttonSend = await querySelector(driver, '[id="sendTx"]');
  expect(buttonSend).toBeTruthy();
  await buttonSend.click();
  await delay(500);

  const handlers2 = await driver.getAllWindowHandles();

  const popupHandler2 =
    handlers2.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler2);
  await delay(2000);

  await driver.findElement({ id: 'accept-request-button' }).click();
  await driver.switchTo().window(dappHandler);
});

it.skip('should be able to accept a transaction request', async () => {
  // TODO send tx, we're not signing anything yet
  const dappHandler = await driver.getWindowHandle();
  await delay(1000);

  const button = await querySelector(driver, '[id="sendTx"]');
  expect(button).toBeTruthy();
  await button.click();
  await delay(100);

  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  await delay(2000);

  await driver.findElement({ id: 'accept-request-button' }).click();
  await delay(2000);
  await driver.switchTo().window(dappHandler);
});

it('should be able to disconnect from connected dapps', async () => {
  await driver.get(rootURL + '/popup.html');
  await delay(1000);
  await driver.findElement({ id: 'home-page-header-left' }).click();
  await delay(500);
  await driver.findElement({ id: 'home-page-header-connected-apps' }).click();

  await driver.findElement({ id: 'switch-network-menu' }).click();
  await driver.findElement({ id: 'switch-network-menu-disconnect' }).click();

  await driver.get('https://bx-test-dapp.vercel.app/');
  // wait for dapp to load new account and network
  await delay(1000);
  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
});
