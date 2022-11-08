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
  const label = await querySelector(driver, '[data-testid="account-name"]');
  const actual = await label.getText();
  const expected = '0x70c1...43C4';
  expect(actual).toEqual(expected);
});

it('should shuffle account', async () => {
  await driver.findElement({ id: 'account-name-shuffle' }).click();
  const label = await querySelector(driver, '[data-testid="account-name"]');
  const actual = await label.getText();
  const expected = '0x5B57...7C35';
  expect(actual).toEqual(expected);
});

it('should be able to turn ON injection', async () => {
  let label = await querySelector(driver, '[data-testid="injection-status"]');
  let actual = await label.getText();
  let expected = 'NO';
  expect(actual).toEqual(expected);

  await driver.findElement({ id: 'injection-button' }).click();
  // Wait till the DOM re-renders
  await delay(1000);

  label = await querySelector(driver, '[data-testid="injection-status"]');
  actual = await label.getText();
  expected = 'YES';

  expect(actual).toEqual(expected);
});

it('should be able to connect to bx test dapp', async () => {
  await driver.get('https://bx-test-dapp.vercel.app/');
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

  await driver.findElement({ id: 'accept-button' }).click();

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
  await delay(500);
  await driver.findElement({ id: 'page-header-left-action' }).click();
  await delay(500);
  await driver.findElement({ id: 'suffle-session-button' }).click();
  await delay(500);
  await driver.get('https://bx-test-dapp.vercel.app/');
  // wait for dapp to load new account and network
  await delay(2000);
  const expectedNetwork = 'Network: Ethereum - homestead';
  const network = await querySelector(driver, '[id="network"]');
  const actualNetwork = await network.getText();
  expect(actualNetwork).toEqual(expectedNetwork);

  const expectedAccountAddress =
    'Account: 0x5B570F0F8E2a29B7bCBbfC000f9C7b78D45b7C35';
  const accountAddress = await querySelector(driver, '[id="accountAddress"]');
  const actualAccountAddress = await accountAddress.getText();
  expect(actualAccountAddress).toEqual(expectedAccountAddress);
});
