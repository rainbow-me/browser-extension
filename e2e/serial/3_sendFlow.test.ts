/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, expect, it } from 'vitest';

import {
  delayTime,
  fillPrivateKey,
  findElementAndClick,
  findElementByTestId,
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
import { TEST_VARIABLES } from '../walletVariables';

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

afterAll(() => driver.quit());

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

  await fillPrivateKey(driver, TEST_VARIABLES.SEED_WALLET.PK);

  await findElementByTestIdAndClick({
    id: 'import-wallets-button',
    driver,
  });

  await delayTime('medium');

  await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
  await typeOnTextInput({
    id: 'confirm-password-input',
    driver,
    text: 'test1234',
  });
  await findElementByTestIdAndClick({ id: 'set-password-button', driver });
  await delayTime('long');
  await findElementByText(driver, 'Rainbow is ready to use');
});

it('should be able to go to setings', async () => {
  await goToPopup(driver, rootURL);
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
});

it('should be able to connect to hardhat and go to send flow', async () => {
  const btn = await querySelector(driver, '[data-testid="connect-to-hardhat"]');
  await waitAndClick(btn, driver);
  const button = await findElementByText(driver, 'Disconnect from Hardhat');
  expect(button).toBeTruthy();
  await findElementByTestIdAndClick({ id: 'navbar-button-with-back', driver });
  await findElementAndClick({ id: 'header-link-send', driver });
});

it('should be able to save contact on send flow', async () => {
  const input = await querySelector(driver, '[data-testid="to-address-input"]');
  await input.sendKeys('rainbowwallet.eth');
  await delayTime('long');
  const saveButton = await findElementByTestId({
    id: 'navbar-contact-button-save',
    driver,
  });
  expect(saveButton).toBeTruthy();
  await waitAndClick(saveButton, driver);
  const confirmContactButton = await querySelector(
    driver,
    '[data-testid="contact-prompt-confirm"]',
  );
  expect(confirmContactButton).toBeTruthy();
  await waitAndClick(confirmContactButton, driver);

  const displayName = await findElementByTestId({
    id: 'to-address-input-display',
    driver,
  });
  const displayNameText = await displayName.getText();
  expect(displayNameText).toBe('rainbowwallet.eth');
});

it('should be able to edit contact on send flow', async () => {
  await findElementByTestIdAndClick({
    id: 'navbar-contact-button-edit',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'navbar-contact-button-edit-edit',
    driver,
  });
  await delayTime('medium');

  const contactInput = await findElementByTestId({
    id: 'contact-prompt-input',
    driver,
  });
  expect(contactInput).toBeTruthy();

  await contactInput.clear();
  await contactInput.sendKeys('rianbo');

  await findElementByTestIdAndClick({ id: 'contact-prompt-confirm', driver });

  const displayName = await findElementByTestId({
    id: 'to-address-input-display',
    driver,
  });
  const displayNameText = await displayName.getText();
  expect(displayNameText).toBe('rianbo');
});

it('should be able to delete contact on send flow', async () => {
  await findElementByTestIdAndClick({
    id: 'navbar-contact-button-edit',
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'navbar-contact-button-edit-delete',
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'contact-prompt-delete-confirm',
    driver,
  });

  const displayName = await findElementByTestId({
    id: 'to-address-input-display',
    driver,
  });
  const displayNameText = await displayName.getText();
  expect(displayNameText).toBe('rainbowwallet.eth');
});

it('should be able to clear to address input on send flow', async () => {
  await findElementByTestIdAndClick({
    id: 'input-wrapper-close-to-address-input',
    driver,
  });
  const input = await findElementByTestId({ id: 'to-address-input', driver });
  await input.sendKeys('rainbowwallet.eth');
  await delayTime('long');
});

it('should be able to select token on send flow', async () => {
  await findElementByTestIdAndClick({
    id: 'input-wrapper-dropdown-token-input',
    driver,
  });
  // dai
  await findElementByTestIdAndClick({
    id: 'token-input-asset-0x6b175474e89094c44da98b954eedeac495271d0f_1',
    driver,
  });
});

it('should be able to click max and switch on send flow', async () => {
  const switchButton = await querySelector(
    driver,
    '[data-testid="value-input-switch"]',
  );
  expect(switchButton).toBeTruthy();

  await findElementByTestIdAndClick({ id: 'value-input-max', driver });

  const inputMask = await findElementByTestId({
    id: 'send-input-mask',
    driver,
  });
  await inputMask.clear();
  await inputMask.sendKeys('0.01');
});

it('should be able to go to review on send flow', async () => {
  await findElementByTestIdAndClick({ id: 'send-review-button', driver });
});

it('should be able to interact with destination menu on review on send flow', async () => {
  await findElementByTestIdAndClick({
    id: 'send-review-edit-contact-trigger',
    driver,
  });
  const viewContactItem = await findElementByTestId({
    id: 'send-review-edit-contact-view',
    driver,
  });
  expect(viewContactItem).toBeTruthy();
  const copyContactItem = await findElementByTestId({
    id: 'send-review-edit-contact-copy',
    driver,
  });
  expect(copyContactItem).toBeTruthy();
  const editContactItem = await findElementByTestId({
    id: 'send-review-edit-contact-edit',
    driver,
  });
  expect(editContactItem).toBeTruthy();
  await waitAndClick(copyContactItem, driver);
});

it('should be able to send transaction on review on send flow', async () => {
  await findElementByTestIdAndClick({ id: 'review-confirm-button', driver });
});
