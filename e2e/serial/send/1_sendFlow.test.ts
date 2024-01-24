import 'chromedriver';
import 'geckodriver';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
beforeEach(async (context: any) => {
  context.driver = driver;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
afterEach(async (context: any) => {
  await takeScreenshotOnFailure(context);
});

afterAll(() => driver.quit());

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

  const inputMask = await findElementByTestId({
    id: 'send-input-mask',
    driver,
  });
  await inputMask.clear();
  await inputMask.sendKeys('0.01');
});

it('should be able to switch gas prices via dropdown on send flow', async () => {
  await findElementByTestIdAndClick({ id: 'gas-menu', driver });
  const txnSpeed = await findElementByText(driver, 'Transaction Speed');
  expect(txnSpeed).toBeTruthy();
  await findElementByTextAndClick(driver, 'Urgent');
  await delayTime('medium');
  const urgent = await findElementByText(driver, 'Urgent');
  expect(urgent).toBeTruthy();
});

it('should be able to open up the custom gas menu on the send flow', async () => {
  await findElementByTestIdAndClick({ id: 'custom-gas-menu', driver });
  const gasSettings = await findElementByText(driver, 'Gas Settings');
  expect(gasSettings).toBeTruthy();
});

it('should be able to open up the explainers on the custom gas menu', async () => {
  // explainer 1
  await findElementByTestIdAndClick({
    id: 'current-base-fee-explainer',
    driver,
  });
  await delayTime('medium');
  const current = await findElementByText(driver, 'The base fee is');
  expect(current).toBeTruthy();
  await findElementByTestIdAndClick({ id: 'explainer-action-button', driver });

  // explainer 2
  await findElementByTestIdAndClick({ id: 'max-base-fee-explainer', driver });
  await delayTime('medium');
  const max = await findElementByText(driver, 'This is the maximum');
  expect(max).toBeTruthy();
  await findElementByTestIdAndClick({ id: 'explainer-action-button', driver });

  // explainer 3
  await findElementByTestIdAndClick({
    id: 'max-priority-fee-explainer',
    driver,
  });
  await delayTime('medium');
  const miner = await findElementByText(driver, 'The miner tip goes');
  expect(miner).toBeTruthy();
  await findElementByTestIdAndClick({ id: 'explainer-action-button', driver });
});

it('should be able to customize gas', async () => {
  await typeOnTextInput({ id: 'max-base-fee-input', text: '300', driver });
  const baseFeeGweiInputMask = await querySelector(
    driver,
    "[data-testid='max-base-fee-input'] [data-testid='gwei-input-mask']",
  );

  console.log(
    'baseFeeGweiInputMask',
    await baseFeeGweiInputMask.getAttribute('value'),
  );

  expect(await baseFeeGweiInputMask.getAttribute('value')).toContain('300');

  await typeOnTextInput({ id: 'miner-tip-input', text: '300', driver });
  const minerTipGweiInputMask = await querySelector(
    driver,
    "[data-testid='miner-tip-input'] [data-testid='gwei-input-mask']",
  );

  console.log(
    'minerTipGweiInputMask',
    await minerTipGweiInputMask.getAttribute('value'),
  );

  expect(await minerTipGweiInputMask.getAttribute('value')).toContain('300');
  await findElementByTestIdAndClick({ id: 'set-gas-button', driver });

  const gasMenu = await findElementByTestId({ id: 'gas-menu', driver });
  expect(await gasMenu.getText()).toContain('Custom');
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
  const inputMask = await findElementByTestId({
    id: 'send-input-mask',
    driver,
  });
  await inputMask.sendKeys('0.01');
});

it('should be able to go to review on send flow', async () => {
  await findElementByTestIdAndClick({ id: 'send-review-button', driver });
});

it('should be able to send transaction on review on send flow', async () => {
  await findElementByTestIdAndClick({ id: 'review-confirm-button', driver });
  const sendTransaction = await transactionStatus();
  expect(await sendTransaction).toBe('success');
});
