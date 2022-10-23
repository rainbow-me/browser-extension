/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, expect, it } from 'vitest';
import {
  querySelector,
  delay,
  getExtensionIdByName,
  initDriverWithOptions,
  findElementByText,
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

  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
  await button.click();

  const modalTitle = await findElementByText(driver, 'Connect a Wallet');
  expect(modalTitle).toBeTruthy();

  const mmButton = await querySelector(
    driver,
    '[data-testid="rk-wallet-option-metaMask"]',
  );

  await mmButton.click();

  const topButton = await querySelector(
    driver,
    '[data-testid="rk-account-button"]',
  );

  expect(topButton).toBeTruthy();
  await topButton.click();

  const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
  expect(ensLabel).toBeTruthy();
});
