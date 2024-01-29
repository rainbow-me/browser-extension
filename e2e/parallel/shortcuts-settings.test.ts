import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  delayTime,
  executePerformShortcut,
  findElementByTestId,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlowUsingKeyboardNavigation,
  initDriverWithOptions,
  isElementFoundByText,
  toggleStatus,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe.runIf(browser !== 'firefox')(
  'navigate through settings flows with shortcuts',
  () => {
    beforeAll(async () => {
      driver = await initDriverWithOptions({
        browser,
        os,
      });
      const extensionId = await getExtensionIdByName(driver, 'Rainbow');
      if (!extensionId) throw new Error('Extension not found');
      console.log(
        'url used in beforeAll of shortcut-settings-test: ',
        (rootURL += extensionId),
      );
      rootURL += extensionId;
    });
    afterAll(async () => driver.quit());

    it('should be able import a wallet via seed', async () => {
      await importWalletFlowUsingKeyboardNavigation(
        driver,
        rootURL,
        TEST_VARIABLES.EMPTY_WALLET.SECRET,
      );
    });

    it('should display account name', async () => {
      await checkWalletName(
        driver,
        rootURL,
        TEST_VARIABLES.EMPTY_WALLET.ADDRESS,
      );
    });

    // shortcut tests begin
    it('should be able to navigate to settings via shortcuts', async () => {
      await executePerformShortcut({ driver, key: 'DECIMAL' });
      await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'settings');
    });

    it('should be able to navigate back home with esc', async () => {
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      await delayTime('medium');
    });

    it('should be able to navigate back home with arrow left', async () => {
      await executePerformShortcut({ driver, key: 'DECIMAL' });
      await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'settings');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await delayTime('medium');
    });

    it('should be able to navigate to settings via keyboard', async () => {
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await executePerformShortcut({ driver, key: 'TAB' });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'settings');
    });

    it('should be able to toggle Set Rainbow As Default Wallet via keyboard', async () => {
      await delayTime('medium');
      const defaultToggleStatus = await toggleStatus(
        'set-rainbow-default-toggle',
        driver,
      );
      expect(defaultToggleStatus).toBe('true');
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await delayTime('long');
      const changedToggleStatus = await toggleStatus(
        'set-rainbow-default-toggle',
        driver,
      );
      expect(changedToggleStatus).toBe('false');
    });

    it('should be able to navigate to Networks using keyboard', async () => {
      await delayTime('medium');
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
      await executePerformShortcut({ driver, key: 'ARROW_RIGHT' });
      await checkExtensionURL(driver, 'networks');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
    });

    it('should be able to navigate to Privacy & Security using keyboard', async () => {
      await delayTime('medium');
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 4 });
      await executePerformShortcut({ driver, key: 'ARROW_RIGHT' });
      await checkExtensionURL(driver, 'privacy');
    });

    it('should be able to toggle analytics with keyboard', async () => {
      await delayTime('medium');
      const defaultToggleStatus = await toggleStatus(
        'analytics-toggle',
        driver,
      );
      expect(defaultToggleStatus).toBe('true');
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await delayTime('long');
      const changedToggleStatus = await toggleStatus(
        'analytics-toggle',
        driver,
      );
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

    it('should be able to validate that balances are hidden', async () => {
      await executePerformShortcut({
        driver,
        key: 'ARROW_LEFT',
        timesToPress: 2,
      });
      const balanceHidden = await findElementByTestId({
        id: 'balance-hidden',
        driver,
      });
      expect(balanceHidden).toBeTruthy();
      await executePerformShortcut({ driver, key: 'DECIMAL' });
      await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
      await executePerformShortcut({ driver, key: 'ENTER' });
    });

    it('should be able to navigate back to Privacy & Security using keyboard ', async () => {
      await executePerformShortcut({ driver, key: 'DECIMAL' });
      await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 4 });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'privacy');
    });

    it('should be able to toggle auto hide small balances with keyboard', async () => {
      await delayTime('medium');
      await driver.sleep(10000);
      const defaultToggleStatus = await toggleStatus(
        'hide-small-balances-toggle',
        driver,
      );
      expect(defaultToggleStatus).toBe('false');
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 4 });
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

    it('should be able to navigate to auto-lock options', async () => {
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 6 });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'autolock');
    });

    it('should be able to change auto-lock option', async () => {
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 5 });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      const chosenAutoLockTime = await findElementByTestId({
        id: 'auto-lock-option',
        driver,
      });
      expect(await chosenAutoLockTime.getText()).toContain('10 minutes');
    });

    it('should be able to navigate to Wallets & Keys with the keyboard', async () => {
      await executePerformShortcut({
        driver,
        key: 'ESCAPE',
      });
      await executePerformShortcut({
        driver,
        key: 'ARROW_DOWN',
        timesToPress: 3,
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
      const contextMenuOption = await isElementFoundByText({
        text: 'Private Key',
        driver,
      });
      expect(contextMenuOption).toBe(true);
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      const newContextMenuOption = await isElementFoundByText({
        text: 'Private Key',
        driver,
      });
      expect(newContextMenuOption).toBe(false);
    });

    it('should be able to navigate back to settings page', async () => {
      await executePerformShortcut({
        driver,
        key: 'ARROW_LEFT',
        timesToPress: 2,
      });
      await checkExtensionURL(driver, 'settings');
    });

    it('should be able to navigate to transaction options', async () => {
      await executePerformShortcut({
        driver,
        key: 'ARROW_DOWN',
        timesToPress: 6,
      });
      await executePerformShortcut({ driver, key: 'ARROW_RIGHT' });
      await checkExtensionURL(driver, 'transactions');
    });

    it('should be able to change default txn speed', async () => {
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 2,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await executePerformShortcut({ driver, key: 'ARROW_UP' });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      const fastGasLabel = await isElementFoundByText({
        text: 'Fast',
        driver,
      });
      expect(fastGasLabel).toBe(true);
    });

    it('should be able to toggle flashbots', async () => {
      const defaultToggleStatus = await toggleStatus(
        'flashbots-transactions-toggle',
        driver,
      );
      expect(defaultToggleStatus).toBe('false');
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 3,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await delayTime('long');
      const changedToggleStatus = await toggleStatus(
        'flashbots-transactions-toggle',
        driver,
      );
      expect(changedToggleStatus).toBe('true');
    });

    it('should be able navigate to currencies', async () => {
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 7,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'currency');
    });

    it('should be able navigate to select new currency', async () => {
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 2,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      const currencyTextContent = await findElementByTestId({
        id: 'currency-selection',
        driver,
      });
      expect(await currencyTextContent.getText()).toContain('Ethereum');
    });

    it('should be able navigate to languages', async () => {
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 8,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'language');
    });

    it('should be able navigate to switch to spanish and back to english', async () => {
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 5,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      const chosenLanguageOption = await findElementByText(driver, 'Idioma');
      expect(chosenLanguageOption).toBeTruthy();
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 8,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'language');
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 2,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
    });

    it('should be able navigate to switch theme and open context menu', async () => {
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await executePerformShortcut({
        driver,
        key: 'TAB',
        timesToPress: 10,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      const systemOption = await findElementByText(driver, 'System');
      const lightOption = await findElementByText(driver, 'Light');
      expect(systemOption && lightOption).toBeTruthy();
      await executePerformShortcut({ driver, key: 'ARROW_UP' });
      await executePerformShortcut({ driver, key: 'ENTER' });
    });

    it('should be able to switch theme to light', async () => {
      await executePerformShortcut({ driver, key: 'ARROW_UP' });
      await executePerformShortcut({ driver, key: 'ENTER' });
      const chosenThemeOption = await findElementByText(driver, 'Light');
      expect(chosenThemeOption).toBeTruthy();
    });
  },
);
