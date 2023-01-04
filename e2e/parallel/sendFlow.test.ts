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
  findElementByText,
  getExtensionIdByName,
  goToPopup,
  goToTestApp,
  initDriverWithOptions,
  querySelector,
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

it.skip('should be able create a new wallet', async () => {
  await goToPopup(driver, rootURL);
  await findElementAndClick({
    id: 'header-account-name-link-to-wallet',
    driver,
  });
  await driver
    .findElement({ id: 'wallet-password-input' })
    .sendKeys('password');
  await findElementAndClick({ id: 'wallet-password-submit', driver });
  await findElementAndClick({ id: 'wallet-create-button', driver });
  await findElementAndClick({ id: 'wallets-go-back', driver });
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

it.skip('should be able to connect to bx test dapp', async () => {
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

it.skip('should be able to go back to extension and switch account and chain', async () => {
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

it.skip('should be able to accept a signing request', async () => {
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

it.skip('should be able to disconnect from connected dapps', async () => {
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
  console.log('text', text);
  expect(text).toBe('Background sandboxed!');
  await driver.switchTo().alert().accept();
});

it('should be able to connect to hardhat and go to send flow', async () => {
  const btn = await querySelector(driver, '[data-testid="connect-to-hardhat"]');
  await waitAndClick(btn, driver);
  const button = await findElementByText(driver, 'Disconnect from Hardhat');
  expect(button).toBeTruthy();
  await findElementAndClick({ id: 'navbar-button-with-back', driver });
  await findElementAndClick({ id: 'header-link-send', driver });
});

it('should be able to save contact on send flow', async () => {
  const input = await querySelector(driver, '[data-testid="to-address-input"]');
  await input.sendKeys('rainbowwallet.eth');
  await delayTime('long');
  const saveButton = await querySelector(
    driver,
    '[data-testid="navbar-contact-button-save"]',
  );
  expect(saveButton).toBeTruthy();
  await waitAndClick(saveButton, driver);
  const confirmContactButton = await querySelector(
    driver,
    '[data-testid="contact-prompt-confirm"]',
  );
  expect(confirmContactButton).toBeTruthy();
  await waitAndClick(confirmContactButton, driver);

  const displayName = await querySelector(
    driver,
    '[data-testid="to-address-input-display"]',
  );
  const displayNameText = await displayName.getText();
  expect(displayNameText).toBe('rainbowwallet.eth');
});

it('should be able to edit contact on send flow', async () => {
  const button = await querySelector(
    driver,
    '[data-testid="navbar-contact-button-edit"]',
  );
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);

  const editButton = await querySelector(
    driver,
    '[data-testid="navbar-contact-button-edit-edit"]',
  );
  expect(editButton).toBeTruthy();
  await waitAndClick(editButton, driver);
  await delayTime('medium');

  const contactInput = await querySelector(
    driver,
    '[data-testid="contact-prompt-input"]',
  );
  expect(contactInput).toBeTruthy();

  await contactInput.clear();
  await contactInput.sendKeys('rianbo');

  const confirmContactButton = await querySelector(
    driver,
    '[data-testid="contact-prompt-confirm"]',
  );
  expect(confirmContactButton).toBeTruthy();
  await waitAndClick(confirmContactButton, driver);

  const displayName = await querySelector(
    driver,
    '[data-testid="to-address-input-display"]',
  );
  const displayNameText = await displayName.getText();
  expect(displayNameText).toBe('rianbo');
});

it('should be able to delete contact on send flow', async () => {
  const button2 = await querySelector(
    driver,
    '[data-testid="navbar-contact-button-edit"]',
  );
  expect(button2).toBeTruthy();
  await waitAndClick(button2, driver);

  const deleteButton = await querySelector(
    driver,
    '[data-testid="navbar-contact-button-edit-delete"]',
  );
  expect(deleteButton).toBeTruthy();
  await waitAndClick(deleteButton, driver);

  const confirmContactButton2 = await querySelector(
    driver,
    '[data-testid="contact-prompt-delete-confirm"]',
  );
  expect(confirmContactButton2).toBeTruthy();
  await waitAndClick(confirmContactButton2, driver);
  const displayName = await querySelector(
    driver,
    '[data-testid="to-address-input-display"]',
  );
  const displayNameText = await displayName.getText();
  expect(displayNameText).toBe('rainbowwallet.eth');
});

it('should be able to clear to address input on send flow', async () => {
  const clearButton = await querySelector(
    driver,
    '[data-testid="input-wrapper-close-to-address-input"]',
  );
  expect(clearButton).toBeTruthy();
  await waitAndClick(clearButton, driver);

  const input = await querySelector(driver, '[data-testid="to-address-input"]');
  await input.sendKeys('rainbowwallet.eth');
});

it('should be able to select token on send flow', async () => {
  const dropdown = await querySelector(
    driver,
    '[data-testid="input-wrapper-dropdown-token-input"]',
  );
  expect(dropdown).toBeTruthy();
  await waitAndClick(dropdown, driver);

  const asset = await querySelector(
    driver,
    '[data-testid="token-input-asset-eth_1"]',
  );
  expect(asset).toBeTruthy();
  await waitAndClick(asset, driver);
});

it('should be able to click max and switch on send flow', async () => {
  const switchButton = await querySelector(
    driver,
    '[data-testid="value-input-switch"]',
  );
  expect(switchButton).toBeTruthy();

  const maxButton = await querySelector(
    driver,
    '[data-testid="value-input-max"]',
  );

  await waitAndClick(maxButton, driver);

  const inputMask = await querySelector(
    driver,
    '[data-testid="send-input-mask"]',
  );
  await inputMask.clear();
  await inputMask.sendKeys('1');
});
