/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

import 'chromedriver';
import 'geckodriver';
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
  await goToPopup(driver, rootURL);
});

it('should display account name', async () => {
  const label = await querySelector(
    driver,
    '[data-testid="header"] [data-testid="account-name"]',
  );
  const actual = await label.getText();
  const expected = ['0x70c1...43C4', 'djweth.eth'];
  expect(expected.includes(actual)).toEqual(true);
});

it('should shuffle account', async () => {
  await findElementAndClick({ id: 'header-account-name-shuffle', driver });
  const label = await querySelector(
    driver,
    '[data-testid="header"] [data-testid="account-name"]',
  );
  const actual = await label.getText();
  const expected = '0x5B57...7C35';
  expect(actual).toEqual(expected);
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
  await findElementAndClick({ id: 'switch-wallet-menu', driver });
  await findElementAndClick({ id: 'switch-wallet-item-0', driver });
  // switch network
  await findElementAndClick({ id: 'switch-network-menu', driver });
  await findElementAndClick({ id: 'switch-network-item-1', driver });

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

  const expectedAccountAddress =
    'Account: 0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
  const accountAddress = await querySelector(driver, '[id="accountAddress"]');
  const actualAccountAddress = await accountAddress.getText();
  expect(actualAccountAddress).toEqual(expectedAccountAddress);
});

it('should be able to accept a signing request', async () => {
  // switch session to mainnet
  await goToPopup(driver, rootURL);
  await findElementAndClick({ id: 'home-page-header-left', driver });
  await findElementAndClick({ id: 'home-page-header-connected-apps', driver });
  await findElementAndClick({ id: 'switch-network-menu', driver });
  await findElementAndClick({ id: 'switch-network-item-0', driver });

  await goToTestApp(driver);

  // TODO check if the signature is correct, we're not signing anything yet
  const dappHandler = await driver.getWindowHandle();

  const button = await querySelector(driver, '[id="signTypedData"]');
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);
  await delay(200);
  const handlers = await driver.getAllWindowHandles();

  const popupHandler =
    handlers.find((handler) => handler !== dappHandler) || '';

  await driver.switchTo().window(popupHandler);
  await findElementAndClick({ id: 'accept-request-button', driver });
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
