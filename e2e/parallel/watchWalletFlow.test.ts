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

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';
const watchedWallet = 'djweth.eth';
const seedWallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const pkWallet = '0x38eDa688Cd8DFC6FeE8016c85803a584A0564dDC';

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
      text: watchedWallet,
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
    const expected = ['0x70c1...43C4', watchedWallet];
    expect(expected.includes(actual)).toEqual(true);
  });

  it('should be able to lock and unlock the extension', async () => {
    // Lock
    await findElementByTestIdAndClick({
      id: 'home-page-header-right',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'lock', driver });

    // Unlock
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTestIdAndClick({ id: 'unlock-button', driver });
  });

  it('should be able to test the sandbox for the popup', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
    const btn = await querySelector(
      driver,
      '[data-testid="test-sandbox-popup"]',
    );
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
    expect(text).toBe('Background sandboxed!');
    await driver.switchTo().alert().accept();
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
      text: '0xaeb5635a53c33d3c0d92c32881d7613ee9fe18be77772054f5e025bc4fa8c851',
    });

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
    await delayTime('medium');

    it('should display pk account wallet name', async () => {
      const account = await getTextFromText({ id: 'account-name', driver });
      expect(account).toBe(await shortenAddress(pkWallet));
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
    await delayTime('medium');

    it('should display seed account name', async () => {
      const account = await getTextFromText({ id: 'account-name', driver });
      expect(account).toBe(await shortenAddress(pkWallet));
    });
  });

  it('should be able to switch to the watched wallet', async () => {
    await switchWallet(watchedWallet, rootURL, driver);
    const wallet = await getTextFromText({ id: 'account-name', driver });
    expect(wallet).toBe(await shortenAddress(watchedWallet));
  });

  it('should be able to switch to the pk wallet', async () => {
    await switchWallet(pkWallet, rootURL, driver);
    const wallet = await getTextFromText({ id: 'account-name', driver });
    expect(wallet).toBe(await shortenAddress(pkWallet));
  });

  it('should be able to switch to the seed wallet', async () => {
    await switchWallet(seedWallet, rootURL, driver);
    const wallet = await getTextFromText({ id: 'account-name', driver });
    expect(wallet).toBe(await shortenAddress(seedWallet));
  });
});
