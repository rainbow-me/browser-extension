import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  delayTime,
  executePerformShortcut,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlow,
  initDriverWithOptions,
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
    await executePerformShortcut({ driver, key: '.' });
    await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'settings');
  });

  it('should be able to navigate back home with keyboard', async () => {
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await delayTime('medium');
  });

  it('should be able to navigate to settings via keyboard', async () => {
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'settings');
  });

  it('should be able to navigate to Privacy & Security using keyboard', async () => {
    await delayTime('medium');
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'privacy');
  });

  it('should be able to toggle analytics with keyboard', async () => {
    await delayTime('medium');
    const defaultToggleStatus = await toggleStatus('analytics-toggle', driver);
    expect(defaultToggleStatus).toBe('true');
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
    await executePerformShortcut({ driver, key: 'ENTER' });
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
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
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
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    const changedToggleStatus = await toggleStatus(
      'hide-small-balances-toggle',
      driver,
    );
    expect(changedToggleStatus).toBe('true');
  });

  it('should be able to change password using only the keyboard', async () => {
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
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
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
  });

  it('should be able to navigate to Wallets & Keys with the keyboard', async () => {
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 7,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'wallets-and-keys');
  });

  it('should be able to navigate to Wallet Details with the keyboard', async () => {
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'wallet-details');
  });

  it('should be able to open the wallet context menu and close it with the keyboard', async () => {
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 3,
    });
    await executePerformShortcut({ driver, key: 'SPACE' });
    const contextMenuOption = await findElementByText(driver, 'Private Key');
    expect(contextMenuOption).toBeTruthy();
  });
});
