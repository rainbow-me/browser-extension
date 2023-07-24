/* eslint-disable no-await-in-loop */
import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  fillPrivateKey,
  findElementByIdAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettingsPrivacy,
  querySelector,
  toggleStatus,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

async function goBackTwice() {
  await delayTime('short');
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
}

describe('Navigate Settings and its flows', () => {
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
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should be able to add a new wallet via pk', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    await fillPrivateKey(driver, TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET);

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
  });
  it('should be able to hide asset balances', async () => {
    await navigateToSettingsPrivacy(driver, rootURL);
    // find toggle status and expect to be false
    expect(await toggleStatus('hide-assets-toggle', driver)).toBe('false');
    // go check balance is shown
    await goBackTwice();
    const balanceShown = await findElementByTestId({
      id: 'balance-shown',
      driver,
    });
    expect(balanceShown).toBeTruthy;
    // toggle to true
    await navigateToSettingsPrivacy(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'hide-assets-toggle', driver });
    expect(await toggleStatus('hide-assets-toggle', driver)).toBe('true');
    // check balance hidden
    await goBackTwice();
    const balanceHidden = await findElementByTestId({
      id: 'balance-hidden',
      driver,
    });
    expect(balanceHidden).toBeTruthy;
  });

  it.skip('should be able to change password and then lock and unlock with it', async () => {
    await navigateToSettingsPrivacy(driver, rootURL);

    await findElementByTestIdAndClick({
      id: 'change-password-button',
      driver,
    });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTextAndClick(driver, 'Continue');
    await typeOnTextInput({
      id: 'new-password-input',
      driver,
      text: 'test5678',
    });
    await typeOnTextInput({
      id: 'confirm-new-password-input',
      driver,
      text: 'test5678',
    });
    await findElementByTextAndClick(driver, 'Update Password');
    await goBackTwice();
    await findElementByTestIdAndClick({
      id: 'home-page-header-right',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'lock', driver });

    await typeOnTextInput({ id: 'password-input', driver, text: 'test5678' });
    await findElementByTestIdAndClick({ id: 'unlock-button', driver });
  });

  it('should be able to reveal secret', async () => {
    await navigateToSettingsPrivacy(driver, rootURL);

    await findElementByTextAndClick(driver, 'Wallets & Keys');
    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    await findElementByTextAndClick(driver, 'View Recovery Phrase');
    await findElementByTextAndClick(driver, 'Show Recovery Phrase');
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTextAndClick(driver, 'Continue');

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

    await findElementByTextAndClick(driver, 'saved these words');

    // make sure it navigates back correctly
    const walletsKeysText = await findElementByText(driver, 'Wallets & Keys');
    expect(walletsKeysText).toBeTruthy;
  });
  it('should be able to reveal pkey', async () => {
    await navigateToSettingsPrivacy(driver, rootURL);

    await findElementByTextAndClick(driver, 'Wallets & Keys');
    await findElementByTestIdAndClick({ id: 'wallet-group-2', driver });
    await findElementByTextAndClick(driver, 'View Private Key');
    await findElementByTextAndClick(driver, 'Show Private Key');
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTextAndClick(driver, 'Continue');

    // check words exist and match expected seed word
    const pkey = await findElementByTestId({ id: 'private-key-hash', driver });

    expect(await pkey.getText()).toBe(TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET);

    await findElementByTextAndClick(driver, 'saved this');

    // make sure it navigates back correctly
    const walletsKeysText = await findElementByText(driver, 'Wallets & Keys');
    expect(walletsKeysText).toBeTruthy;
  });

  it('should be able to rename a wallet', async () => {
    await navigateToSettingsPrivacy(driver, rootURL);
    await findElementByTextAndClick(driver, 'Wallets & Keys');
    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    await driver.sleep(100000);
    await findElementByTestIdAndClick({
      id: `wallet-${TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS}`,
      driver,
    });
    await findElementByTextAndClick(driver, 'Rename Wallet');
    await typeOnTextInput({
      id: 'wallet-name-input',
      driver,
      text: 'test name',
    });
    await findElementByTextAndClick(driver, 'Done');
    const testName = await findElementByText(driver, 'test name');

    expect(testName).toBeTruthy;
    expect(TEST_VARIABLES.SEED_WALLET.ADDRESS).toBeTruthy;
  });

  it('should be able to copy an address', async () => {
    await findElementByTextAndClick(driver, 'test name');
    await findElementByTextAndClick(driver, 'Copy Address');

    const copiedText = await findElementByText(driver, 'Address Copied');
    expect(copiedText).toBeTruthy;
  });

  it('should be able to delete a wallet', async () => {
    async function getNumberOfWallets() {
      // go back and find the number of wallets currently imported
      await findElementByTestIdAndClick({
        id: 'navbar-button-with-back',
        driver,
      });
      const numOfWallets = await findElementByTestId({
        id: 'number-of-wallets',
        driver,
      });
      // get the text from the element + store the num in a variable, return the num
      const numberText = await numOfWallets.getText();
      const wallets = numberText.match(RegExp);
      return Number(wallets[0]);
    }

    const numOfWallets = await getNumberOfWallets();

    await findElementByTestIdAndClick({ id: 'wallet-group-1', driver });
    await findElementByTextAndClick(driver, 'test name');
    await findElementByTextAndClick(driver, 'Delete Wallet');
    await findElementByTestIdAndClick({ id: 'remove-button', driver });

    const numOfWalletsAfterDeletion = await getNumberOfWallets();

    // expect the current # of wallets to be the previous number + 1
    expect(numOfWalletsAfterDeletion).toBe(numOfWallets - 1);
  });

  it.skip('should be able to create a new wallet from a new seed', async () => {
    async function getWordFromSeed(id) {
      const el = await findElementByTestId({ id: id, driver });
      const word = await el.getText();
      return word;
    }
    await findElementByTextAndClick(driver, 'New Secret Phrase & Wallet');
    await findElementByTextAndClick(driver, 'Show Recovery Phrase');
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTextAndClick(driver, 'Continue');
    const word4 = await getWordFromSeed('seed_word_4');
    console.log(word4);
    const word8 = await getWordFromSeed('seed_word_8');
    console.log(word8);
    const word12 = await getWordFromSeed('seed_word_12');
    console.log(word12);
    await findElementByTextAndClick(driver, 'saved these words');
    await findElementByTextAndClick(driver, word4);
    await findElementByTextAndClick(driver, word8);
    await findElementByTextAndClick(driver, word12);
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    const wallet2 = await findElementByTestId({ id: 'wallet-group-3', driver });
    expect(wallet2).toBeTruthy();
  });
});
