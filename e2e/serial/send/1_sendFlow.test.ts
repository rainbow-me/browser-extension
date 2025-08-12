import { WebDriver } from 'selenium-webdriver';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

import {
  delayTime,
  findElementById,
  findElementByIdAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  querySelector,
  shortenAddress,
  takeScreenshotOnFailure,
  transactionStatus,
  typeOnTextInput,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
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

beforeEach<{ driver: WebDriver }>(async (context) => {
  context.driver = driver;
});

afterEach<{ driver: WebDriver }>(async (context) => {
  await takeScreenshotOnFailure(context);
});

afterAll(() => driver?.quit());

it('should be able import a wallet via pk', async () => {
  await importWalletFlow(driver, rootURL, TEST_VARIABLES.SEED_WALLET.PK);
});

it('should be able import a second wallet via pk then switch back to wallet 1', async () => {
  await importWalletFlow(
    driver,
    rootURL,
    TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET,
    true,
  );
  await findElementByIdAndClick({ id: 'header-account-name-shuffle', driver });
  await findElementByTestIdAndClick({ id: 'wallet-account-1', driver });
  const accountName = await findElementById({
    id: 'header-account-name-shuffle',
    driver,
  });
  expect(await accountName.getText()).toBe(
    shortenAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS),
  );
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
  await findElementByTestIdAndClick({ id: 'header-link-send', driver });
});

it('should be able to save contact on send flow', async () => {
  const input = await querySelector(driver, '[data-testid="to-address-input"]');
  await input.sendKeys('rainbowwallet.eth');
  await delayTime('very-long');
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
    id: 'token-input-asset-eth_1',
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
  await delayTime('long');
  await findElementByTestIdAndClick({ id: 'value-input-max', driver });
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
  await delayTime('very-long');
  await findElementByTestIdAndClick({ id: 'review-confirm-button', driver });
  const sendTransaction = await transactionStatus();
  expect(await sendTransaction).toBe('success');
});

it('should be able to rename a wallet from the wallet switcher', async () => {
  await goToPopup(driver, rootURL);
  await findElementByIdAndClick({
    id: 'header-account-name-shuffle',
    driver,
  });
  await findElementByTestIdAndClick({ id: 'more-info-2', driver });
  await findElementByTextAndClick(driver, 'Rename Wallet');
  await typeOnTextInput({
    id: 'wallet-name-input',
    driver,
    text: 'test name',
  });
  await findElementByTextAndClick(driver, 'Done');
  const newWalletName = await findElementByText(driver, 'test name');
  expect(newWalletName).toBeTruthy();
});

it('should be able to go to send flow and choose recipient based on suggestions', async () => {
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
  await findElementByTestIdAndClick({ id: 'header-link-send', driver });
  await delayTime('medium');
  await findElementByTestIdAndClick({
    id: 'wallet-1',
    driver,
  });
  await delayTime('medium');
  const recipientAddress = await findElementByTestId({
    id: 'recipient-address',
    driver,
  });
  expect(await recipientAddress.getText()).toBe(
    shortenAddress(TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS),
  );
});

it('should be able to select token on send flow', async () => {
  await findElementByTestIdAndClick({
    id: 'input-wrapper-dropdown-token-input',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-input-asset-eth_1',
    driver,
  });
  await findElementByTestIdAndClick({ id: 'value-input-max', driver });
  await delayTime('long');
  await findElementByTestIdAndClick({ id: 'value-input-max', driver });
});

it('should be able to go to review on send flow', async () => {
  await findElementByTestIdAndClick({ id: 'send-review-button', driver });
});

it('should be able to send transaction on review on send flow', async () => {
  await findElementByTestIdAndClick({ id: 'review-confirm-button', driver });
  const sendTransaction = await transactionStatus();
  expect(await sendTransaction).toBe('success');
});
