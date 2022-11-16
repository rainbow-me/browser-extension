/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

import 'chromedriver';
import 'geckodriver';
import { ethers } from 'ethers';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, expect, it } from 'vitest';

import {
  delay,
  findElementAndClick,
  findElementByText,
  getExtensionIdByName,
  goToPopup,
  goToTestApp,
  initDriverWithOptions,
  querySelector,
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
  await driver.findElement({ id: 'name-section-shuffle-account' }).click();
  const label = await querySelector(
    driver,
    '[data-testid="header"] [data-testid="account-name"]',
  );
  const actual = await label.getText();
  const expected = '0x5B57...7C35';
  expect(actual).toEqual(expected);
});

it('should be able create a new wallet', async () => {
  await driver.get(rootURL + '/popup.html');
  await delay(1000);
  await driver.findElement({ id: 'account-name-link-to-wallet' }).click();
  await delay(300);
  await driver
    .findElement({ id: 'wallet-password-input' })
    .sendKeys('password');
  await delay(300);
  await driver.findElement({ id: 'wallet-password-submit' }).click();
  await delay(300);
  await driver.findElement({ id: 'wallet-create-button' }).click();
  await delay(300);
  await driver.findElement({ id: 'wallets-go-back' }).click();
});

it('should be able to connect to bx test dapp', async () => {
  await goToTestApp(driver);
  const dappHandler = await driver.getWindowHandle();

  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);

  const modalTitle = await findElementByText(driver, 'Connect a Wallet');
  expect(modalTitle).toBeTruthy();

  const mmButton = await querySelector(
    driver,
    '[data-testid="rk-wallet-option-metaMask"]',
  );
  await waitAndClick(mmButton, driver);

  // wait for window handlers to update
  await delay(200);
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);

  // switch account
  await findElementAndClick('switch-wallet-menu', driver);
  await findElementAndClick('switch-wallet-item-0', driver);

  await findElementAndClick('switch-wallet-item', driver);
  await findElementAndClick('switch-wallet-item-2', driver);

  // switch network
  await delay(500);
  await findElementAndClick('switch-network-menu', driver);
  await findElementAndClick('switch-network-item-1', driver);

  await findElementAndClick('accept-request-button', driver);

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
  await findElementAndClick('home-page-header-left', driver);
  await findElementAndClick('home-page-header-connected-apps', driver);
  await delay(100);
  await findElementAndClick('switch-network-menu', driver);
  await findElementAndClick('switch-network-item-2', driver);

  await goToTestApp(driver);
  // wait for dapp to load new account and network
  await delay(1000);
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
  await delay(500);
  await goToTestApp(driver);
  // TODO check if the signature is correct, we're not signing anything yet
  await delay(1000);
  const dappHandler = await driver.getWindowHandle();

  const button = await querySelector(driver, '[id="signTx"]');
  expect(button).toBeTruthy();
  await button.click();
  await delay(100);

  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  await delay(2000);

  await driver.findElement({ id: 'accept-request-button' }).click();

  await driver.switchTo().window(dappHandler);

  const button2 = await querySelector(driver, '[id="signTx"]');
  expect(button2).toBeTruthy();

  const signatureElement = await querySelector(
    driver,
    '[id="signTxSignature"]',
  );
  const signatureElementText = await signatureElement.getText();
  const signature = signatureElementText.replace('sign message data sig: ', '');
  expect(ethers.utils.isHexString(signature)).toBe(true);
});

it('should be able to accept a typed data signing request', async () => {
  // TODO check if the signature is correct, we're not signing anything yet
  await delay(1000);
  const dappHandler = await driver.getWindowHandle();

  const button = await querySelector(driver, '[id="signTypedData"]');
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);
  await delay(200);
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  await findElementAndClick('accept-request-button', driver);
  await delay(500);
  await driver.switchTo().window(dappHandler);
});

it('should be able to accept a transaction request', async () => {
  // TODO send tx, we're not signing anything yet
  await delay(1000);
  const dappHandler = await driver.getWindowHandle();

  const button = await querySelector(driver, '[id="sendTx"]');
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);
  await delay(200);
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  await findElementAndClick('accept-request-button', driver);
  await driver.switchTo().window(dappHandler);

  const signatureElement = await querySelector(
    driver,
    '[id="signTypedDataSignature"]',
  );
  const signatureElementText = await signatureElement.getText();
  const signature = signatureElementText.replace(
    'typed message data sig: ',
    '',
  );
  expect(ethers.utils.isHexString(signature)).toBe(true);
});

it('should be able to disconnect from connected dapps', async () => {
  await goToPopup(driver, rootURL);
  await findElementAndClick('home-page-header-left', driver);
  await findElementAndClick('home-page-header-connected-apps', driver);
  await delay(500);
  await findElementAndClick('switch-network-menu', driver);
  await findElementAndClick('switch-network-menu-disconnect', driver);

  await goToTestApp(driver);
  // wait for dapp to load new account and network
  await delay(500);
  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
});
