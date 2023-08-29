import 'chromedriver';
import 'geckodriver';
import { Key, WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  delayTime,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlow,
  initDriverWithOptions,
  performShortcutWithNormalKey,
  performShortcutWithSpecialKey,
  toggleStatus,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('navigate through settings flows with shortcuts', () => {
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
  it('should display account name', async () => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.ADDRESS);
  });

  // shortcut tests begin
  it('should be able to navigate to settings via shortcuts', async () => {
    await performShortcutWithNormalKey(driver, Key, '.');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await checkExtensionURL(driver, 'settings');
  });

  it('should be able to navigate back home with keyboard', async () => {
    await performShortcutWithSpecialKey(driver, 'ESCAPE');
    await delayTime('medium');
  });

  it('should be able to navigate to settings via keyboard', async () => {
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await checkExtensionURL(driver, 'settings');
  });

  it('should be able to navigate to Privacy & Security using keyboard', async () => {
    await delayTime('medium');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await checkExtensionURL(driver, 'privacy');
  });

  it('should be able to toggle analytics with keyboard', async () => {
    await delayTime('medium');
    const defaultToggleStatus = await toggleStatus('analytics-toggle', driver);
    expect(defaultToggleStatus).toBe('true');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await delayTime('long');
    const changedToggleStatus = await toggleStatus('analytics-toggle', driver);
    expect(changedToggleStatus).toBe('false');
  });

  it('should be able to toggle hide asset balances with keyboard', async () => {
    await delayTime('medium');
    const defaultToggleStatus = await toggleStatus(
      'hide-assets-toggle',
      driver,
    );
    expect(defaultToggleStatus).toBe('false');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    const changedToggleStatus = await toggleStatus(
      'hide-assets-toggle',
      driver,
    );
    expect(changedToggleStatus).toBe('true');
  });

  it('should be able to toggle auto hide small balances with keyboard', async () => {
    await delayTime('medium');
    const defaultToggleStatus = await toggleStatus(
      'hide-small-balances-toggle',
      driver,
    );
    expect(defaultToggleStatus).toBe('false');
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    const changedToggleStatus = await toggleStatus(
      'hide-small-balances-toggle',
      driver,
    );
    expect(changedToggleStatus).toBe('true');
  });

  it('should be able to change password using only the keyboard', async () => {
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
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
    await performShortcutWithSpecialKey(driver, 'TAB');
    await performShortcutWithSpecialKey(driver, 'ENTER');
  });

  it('should be able to navigate to Wallets & Keys with the keyboard', async () => {
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await checkExtensionURL(driver, 'wallets-and-keys');
  });

  it('should be able to navigate to Wallet Details with the keyboard', async () => {
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ENTER');
    await checkExtensionURL(driver, 'wallet-details');
  });

  it('should be able to open the wallet context menu and close it with the keyboard', async () => {
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'ARROW_DOWN');
    await performShortcutWithSpecialKey(driver, 'SPACE');
    const contextMenuOption = await findElementByText(driver, 'Private Key');
    expect(contextMenuOption).toBeTruthy();
  });
});
