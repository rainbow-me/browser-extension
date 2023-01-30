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

it('should be able to connect to hardhat and go to send flow', async () => {
  const btn = await querySelector(driver, '[data-testid="connect-to-hardhat"]');
  await waitAndClick(btn, driver);
  const button = await findElementByText(driver, 'Disconnect from Hardhat');
  expect(button).toBeTruthy();
  await findElementAndClick({ id: 'navbar-button-with-back', driver });
  await findElementAndClick({ id: 'header-link-send', driver });
});

it('should be able to go back and go to send flow', async () => {
  await delayTime('veryLong');
  await findElementAndClick({ id: 'navbar-button-with-back', driver });
  await delayTime('veryLong');
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

  // dai
  const asset = await querySelector(
    driver,
    '[data-testid="token-input-asset-0x6b175474e89094c44da98b954eedeac495271d0f_1"]',
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
  await inputMask.sendKeys('0.01');
});

it('should be able to go to review on send flow', async () => {
  const reviewButton = await querySelector(
    driver,
    '[data-testid="send-review-button"]',
  );
  expect(reviewButton).toBeTruthy();
  await waitAndClick(reviewButton, driver);
});

it('should be able to interact with destination menu on review on send flow', async () => {
  const editContactButton = await querySelector(
    driver,
    '[data-testid="send-review-edit-contact-trigger"]',
  );
  expect(editContactButton).toBeTruthy();
  await waitAndClick(editContactButton, driver);

  const viewContactItem = await querySelector(
    driver,
    '[data-testid="send-review-edit-contact-view"]',
  );
  expect(viewContactItem).toBeTruthy();
  const copyContactItem = await querySelector(
    driver,
    '[data-testid="send-review-edit-contact-copy"]',
  );
  expect(copyContactItem).toBeTruthy();
  const editContactItem = await querySelector(
    driver,
    '[data-testid="send-review-edit-contact-edit"]',
  );
  expect(editContactItem).toBeTruthy();
  await waitAndClick(copyContactItem, driver);
});

it('should be able to send transaction on review on send flow', async () => {
  const sendButton = await querySelector(
    driver,
    '[data-testid="review-confirm-button"]',
  );
  expect(sendButton).toBeTruthy();
  await waitAndClick(sendButton, driver);
});
