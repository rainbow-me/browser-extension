import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementById,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getTextFromText,
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

describe('Import wallet flow via seed and pkey and switch between the accounts', () => {
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

  // Import a wallet
  it('should be able to import a wallet via seed', async () => {
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
      id: 'edit-wallets-button',
      driver,
    });
    await delayTime('short');

    const wallet = await findElementByText(driver, '0x7099...79C8');
    await waitAndClick(wallet, driver);
    await delayTime('short');

    const walletTwo = await findElementByText(driver, '0x3C44...93BC');
    await waitAndClick(walletTwo, driver);
    await delayTime('short');

    const importButton = await findElementByText(driver, 'Add 5 wallets');
    await waitAndClick(importButton, driver);
    await delayTime('short');

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
    await delayTime('medium');

    // switch back to main wallet screen
    await goToPopup(driver, rootURL, '#/home');
    await delayTime('medium');

    const walletNameText = await getTextFromText({
      id: 'account-name',
      driver,
    });
    expect(walletNameText).toBe('0xf39F...2266');
  });

  // import via pkey
  it('should be able to import a wallet via private key', async () => {
    await goToPopup(driver, rootURL, '#/home');
    const btn = await findElementById({
      id: 'header-account-name-shuffle',
      driver,
    });
    await waitAndClick(btn, driver);
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({ id: 'import-secret-option', driver });
    await typeOnTextInput({
      id: 'secret-textarea',
      driver,
      text: '0x4d5ab8131240e007ca19bdee71155d3441ffcb3b2948bcd28d497db26b9ea747',
    });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });

    const walletNameText = await getTextFromText({
      id: 'account-name',
      driver,
    });
    expect(walletNameText).toBe('0x4E3C...52ee');
  });

  it('should be able watch a wallet', async () => {
    const btn = await findElementById({
      id: 'header-account-name-shuffle',
      driver,
    });
    await waitAndClick(btn, driver);
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'watch-wallet-option',
      driver,
    });

    await typeOnTextInput({
      id: 'secret-textarea',
      driver,
      text: 'djweth.eth',
    });

    await findElementByTestIdAndClick({
      id: 'watch-wallets-button',
      driver,
    });

    const walletNameText = await getTextFromText({
      id: 'account-name',
      driver,
    });
    expect(walletNameText).toBe('djweth.eth');
  });

  // switch wallets
  it('should be able to switch between the imported accounts', async () => {
    await findElementByTestIdAndClick({ id: 'account-name', driver });
    await delayTime('medium');

    // find the first wallet in list and click to switch
    const walletOne = await findElementByText(driver, '0xf39F...2266');
    await waitAndClick(walletOne, driver);
    await delayTime('medium');

    // expect account name to be displayed at top of wallet now
    const walletOneName = await getTextFromText({
      id: 'account-name',
      driver,
    });
    expect(walletOneName).toBe('0xf39F...2266');

    // repeat the above for pkey
    await findElementByTestIdAndClick({ id: 'account-name', driver });
    await delayTime('medium');

    const walletTwo = await findElementByText(driver, '0x4E3C...52ee');
    await waitAndClick(walletTwo, driver);
    await delayTime('medium');

    const walletTwoName = await getTextFromText({
      id: 'account-name',
      driver,
    });
    expect(walletTwoName).toBe('0x4E3C...52ee');

    // repeat the above for watched wallet
    await findElementByTestIdAndClick({ id: 'account-name', driver });
    await delayTime('medium');

    const walletThree = await findElementByText(driver, 'djweth.eth');
    await waitAndClick(walletThree, driver);
    await delayTime('medium');

    const walletThreeName = await getTextFromText({
      id: 'account-name',
      driver,
    });
    expect(walletThreeName).toBe('djweth.eth');
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
});
