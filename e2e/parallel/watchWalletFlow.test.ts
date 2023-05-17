import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementByIdAndClick,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getTextFromText,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  shortenAddress,
  switchWallet,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Watch wallet then add more and switch between them', () => {
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

  // Watch a wallet
  it('should be able watch a wallet', async () => {
    //  Start from welcome screen
    await goToWelcome(driver, rootURL);
    await findElementByTestIdAndClick({
      id: 'import-wallet-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'watch-wallet-option',
      driver,
    });

    await typeOnTextInput({
      id: 'secret-textarea',
      driver,
      text: TEST_VARIABLES.WATCHED_WALLET.PRIMARY_ADDRESS,
    });

    await findElementByTestIdAndClick({
      id: 'watch-wallets-button',
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

  it('should display watched account name', async () => {
    await goToPopup(driver, rootURL);
    const label = await querySelector(
      driver,
      '[data-testid="header"] [data-testid="account-name"]',
    );

    const actual = await label.getText();
    const expected = [
      '0x70c1...43C4',
      TEST_VARIABLES.WATCHED_WALLET.PRIMARY_ADDRESS,
    ];
    expect(expected.includes(actual)).toEqual(true);
  });

  it('should be able to add a new wallet via pkey', async () => {
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

    await typeOnTextInput({
      id: 'secret-textarea',
      driver,
      text: TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET,
    });

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
    await delayTime('medium');

    it('should display pk account wallet name', async () => {
      const account = await getTextFromText({ id: 'account-name', driver });
      expect(account).toBe(
        shortenAddress(TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS),
      );
    });
  });

  it('should be able to add a new wallet via watch', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'watch-wallets-button',
      driver,
    });

    await typeOnTextInput({
      id: 'secret-textarea',
      driver,
      text: TEST_VARIABLES.WATCHED_WALLET.SECONDARY_ADDRESS,
    });

    await findElementByTestIdAndClick({
      id: 'watch-wallets-button',
      driver,
    });
    await delayTime('medium');

    it('should display watched account name', async () => {
      await goToPopup(driver, rootURL);
      const label = await querySelector(
        driver,
        '[data-testid="header"] [data-testid="account-name"]',
      );

      const actual = await label.getText();
      const expected = [
        '0x089b...be9E',
        TEST_VARIABLES.WATCHED_WALLET.SECONDARY_ADDRESS,
      ];
      expect(expected.includes(actual)).toEqual(true);
    });
  });

  it('should be able to add a new wallet via seed', async () => {
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

    await typeOnTextInput({
      id: 'secret-textarea',
      driver,
      text: TEST_VARIABLES.SEED_WALLET.SECRET,
    });

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'add-wallets-button',
      driver,
    });
    await delayTime('medium');

    it('should display seed account name', async () => {
      const account = await getTextFromText({ id: 'account-name', driver });
      expect(account).toBe(shortenAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS));
    });
  });

  it('should be able to switch to the pk wallet', async () => {
    await delayTime('medium');
    await switchWallet(
      TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS,
      rootURL,
      driver,
    );
    const wallet = await getTextFromText({ id: 'account-name', driver });
    expect(wallet).toBe(
      shortenAddress(TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS),
    );
  });

  it('should be able to switch to the watched wallet', async () => {
    await delayTime('medium');
    await switchWallet(
      TEST_VARIABLES.WATCHED_WALLET.PRIMARY_ADDRESS,
      rootURL,
      driver,
    );

    const label = await querySelector(
      driver,
      '[data-testid="header"] [data-testid="account-name"]',
    );

    const actual = await label.getText();
    const expected = [
      '0x70c1...43C4',
      TEST_VARIABLES.WATCHED_WALLET.PRIMARY_ADDRESS,
    ];
    expect(expected.includes(actual)).toEqual(true);
  });

  it('should be able to switch to the seed wallet', async () => {
    await delayTime('medium');
    await switchWallet(TEST_VARIABLES.SEED_WALLET.ADDRESS, rootURL, driver);
    const wallet = await getTextFromText({ id: 'account-name', driver });
    expect(wallet).toBe(shortenAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS));
  });

  it('should be able to switch to the second watched wallet', async () => {
    await delayTime('medium');
    await switchWallet(
      TEST_VARIABLES.WATCHED_WALLET.SECONDARY_ADDRESS,
      rootURL,
      driver,
    );

    const label = await querySelector(
      driver,
      '[data-testid="header"] [data-testid="account-name"]',
    );

    const actual = await label.getText();
    const expected = [
      '0x089b...be9E',
      TEST_VARIABLES.WATCHED_WALLET.SECONDARY_ADDRESS,
    ];
    expect(expected.includes(actual)).toEqual(true);
  });
});
