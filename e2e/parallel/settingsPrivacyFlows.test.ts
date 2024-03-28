/* eslint-disable no-await-in-loop */
import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getNumberOfWallets,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettings,
  passSecretQuiz,
  querySelector,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Navigate Settings & Privacy and its flows', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });
  afterAll(async () => await driver.quit());

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should be able to reveal secret', async () => {
    await navigateToSettings(driver, rootURL);

    await findElementByTestIdAndClick({ id: 'wallets-and-keys', driver });
    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    await findElementByTestIdAndClick({ id: 'view-recovery-phrase', driver });
    await findElementByTestIdAndClick({ id: 'show-phrase', driver });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTestIdAndClick({ id: 'continue-button', driver });

    // check words exist and match expected seed word
    const requiredWordsIndexes = [4, 8, 12];
    const requiredWords: string[] = [];

    for (const index of requiredWordsIndexes) {
      const wordElement = await querySelector(
        driver,
        `[data-testid="seed_word_${index}"]`,
      );
      const wordText = await wordElement.getText();
      requiredWords.push(wordText);
    }

    const words = TEST_VARIABLES.EMPTY_WALLET.SECRET.split(' ');
    const correctWords: string[] = [words[3], words[7], words[11]];
    expect(requiredWords).toMatchObject(correctWords);

    await findElementByTestIdAndClick({
      id: 'saved-these-words-button',
      driver,
    });

    // make sure it navigates back correctly
    const walletsKeysText = await findElementByText(driver, 'Wallets & Keys');
    expect(walletsKeysText).toBeTruthy();
  });

  it('should be able to reveal pkey', async () => {
    await navigateToSettings(driver, rootURL);

    await findElementByTestIdAndClick({ id: 'wallets-and-keys', driver });
    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    await findElementByTestIdAndClick({
      id: `wallet-${TEST_VARIABLES.EMPTY_WALLET.ADDRESS}`,
      driver,
    });
    await findElementByTextAndClick(driver, 'View Private Key');
    await findElementByTestIdAndClick({ id: 'show-pk', driver });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTestIdAndClick({ id: 'continue-button', driver });

    // check words exist and match expected seed word
    const pkey = await findElementByTestId({ id: 'private-key-hash', driver });

    expect(await pkey.getText()).toBe(TEST_VARIABLES.EMPTY_WALLET.PK);

    await findElementByTextAndClick(driver, 'saved this');

    // make sure it navigates back correctly
    const walletsKeysText = await findElementByText(driver, 'Wallets & Keys');
    expect(walletsKeysText).toBeTruthy();
  });

  it('should be able to rename a wallet', async () => {
    await navigateToSettings(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'wallets-and-keys', driver });
    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    await findElementByTestIdAndClick({
      id: `wallet-${TEST_VARIABLES.EMPTY_WALLET.ADDRESS}`,
      driver,
    });
    await delayTime('medium');
    await findElementByTextAndClick(driver, 'Rename Wallet');
    await typeOnTextInput({
      id: 'wallet-name-input',
      driver,
      text: 'test name',
    });
    await findElementByTestIdAndClick({ id: 'rename-wallet-done', driver });

    const testName = await findElementByText(driver, 'test name');

    expect(testName).toBeTruthy;
    expect(TEST_VARIABLES.SEED_WALLET.ADDRESS).toBeTruthy();
  });

  it('should be able to copy an address', async () => {
    await findElementByTextAndClick(driver, 'test name');
    await delayTime('medium');
    await findElementByTextAndClick(driver, 'Copy Address');

    const copiedText = await findElementByText(driver, 'Address Copied');
    expect(copiedText).toBeTruthy();

    // wait for copy popup to go away
    await delayTime('very-long');
  });

  it('should be able to create a new wallet from a new seed', async () => {
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'create-a-new-wallet', driver });
    await findElementByTestIdAndClick({ id: 'new-wallet-group', driver });
    await findElementByTestIdAndClick({ id: 'show-phrase', driver });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTestIdAndClick({ id: 'continue-button', driver });

    await passSecretQuiz(driver);

    await typeOnTextInput({
      id: 'wallet-name-input',
      text: 'new seed wallet',
      driver,
    });
    await navigateToSettings(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'wallets-and-keys', driver });
    expect(await getNumberOfWallets(driver, 'wallet-group-')).toBe(2);
  });

  it('should be able to create a new wallet from an existing seed', async () => {
    await findElementByTestIdAndClick({ id: 'create-a-new-wallet', driver });
    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    await typeOnTextInput({
      id: 'wallet-name-input',
      text: 'new pk wallet',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'confirm-name-button', driver });
    const accountName = await findElementByTestId({
      id: 'account-name',
      driver,
    });
    expect(await accountName.getText()).toBe('new pk wallet');
    await navigateToSettings(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'wallets-and-keys', driver });
    const textContent = await findElementByTestId({
      id: 'wallet-group-1',
      driver,
    });
    expect(await textContent.getText()).toContain('2 Wallets');
  });

  it('should be able to hide / unhide a wallet', async () => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'account-name', driver });
    const numOfWallets = await getNumberOfWallets(driver, 'wallet-account-');
    await findElementByTestIdAndClick({ id: 'more-info-1', driver });
    await delayTime('medium');
    await findElementByTextAndClick(driver, 'Hide Wallet');
    await findElementByTestIdAndClick({ id: 'remove-button', driver });
    const numOfWalletsAfterHide = await getNumberOfWallets(
      driver,
      'wallet-account-',
    );
    expect(numOfWalletsAfterHide).toBe(numOfWallets - 1);
    await navigateToSettings(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'wallets-and-keys', driver });
    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    await findElementByTextAndClick(driver, 'Hidden');
    await delayTime('medium');
    await findElementByTextAndClick(driver, 'Unhide Wallet');
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'account-name', driver });
    const numOfWalletsAfterUnhide = await getNumberOfWallets(
      driver,
      'wallet-account-',
    );
    expect(numOfWalletsAfterUnhide).toBe(numOfWallets);
  });

  it('should be able to delete a wallet', async () => {
    await navigateToSettings(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'wallets-and-keys', driver });
    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    const numOfWallets = await getNumberOfWallets(driver, 'wallet-item-');

    await findElementByTextAndClick(driver, 'new pk wallet');
    await findElementByTextAndClick(driver, 'Delete Wallet');
    await findElementByTestIdAndClick({ id: 'remove-button', driver });

    // wait for modal to go away
    await delayTime('long');
    const numOfWalletsAfterDeletion = await getNumberOfWallets(
      driver,
      'wallet-item-',
    );

    // expect the current # of wallets to be the previous number + 1
    expect(numOfWalletsAfterDeletion).toBe(numOfWallets - 1);
  });
});
