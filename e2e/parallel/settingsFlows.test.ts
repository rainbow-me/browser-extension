/* eslint-disable no-await-in-loop */
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goBackTwice,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettings,
  navigateToSettingsPrivacy,
  toggleStatus,
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
  afterAll(async () => await driver?.quit());

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should be able to toggle analytics', async () => {
    await navigateToSettingsPrivacy(driver, rootURL);

    // find toggle status and expect to be true
    if (browser === 'firefox') {
      expect(await toggleStatus('analytics-toggle', driver)).toBe('false');

      await findElementByTestIdAndClick({ id: 'analytics-toggle', driver });
      expect(await toggleStatus('analytics-toggle', driver)).toBe('true');

      await findElementByTestIdAndClick({ id: 'analytics-toggle', driver });
      expect(await toggleStatus('analytics-toggle', driver)).toBe('false');
    } else {
      expect(await toggleStatus('analytics-toggle', driver)).toBe('true');

      await findElementByTestIdAndClick({ id: 'analytics-toggle', driver });
      expect(await toggleStatus('analytics-toggle', driver)).toBe('false');

      await findElementByTestIdAndClick({ id: 'analytics-toggle', driver });
      expect(await toggleStatus('analytics-toggle', driver)).toBe('true');
    }
  });

  it('should be able to hide asset balances', async () => {
    // find toggle status and expect to be false
    expect(await toggleStatus('hide-assets-toggle', driver)).toBe('false');
    // go home + check balance is shown
    await goBackTwice(driver);
    const balanceShown = await findElementByTestId({
      id: 'balance-shown',
      driver,
    });
    expect(balanceShown).toBeTruthy();
    // toggle to true
    await navigateToSettingsPrivacy(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'hide-assets-toggle', driver });
    expect(await toggleStatus('hide-assets-toggle', driver)).toBe('true');
    // go home + check balance hidden
    await goBackTwice(driver);
    const balanceHidden = await findElementByTestId({
      id: 'balance-hidden',
      driver,
    });
    expect(balanceHidden).toBeTruthy();
  });

  it('should be able to change password and then lock and unlock with it', async () => {
    await navigateToSettingsPrivacy(driver, rootURL);

    await findElementByTestIdAndClick({
      id: 'change-password-button',
      driver,
    });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await findElementByTestIdAndClick({ id: 'continue-button', driver });
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
    // Check that password input type is "password" before clicking visibility button
    const passwordInputBeforeClick = await findElementByTestId({
      id: 'new-password-input',
      driver,
    });
    expect(await passwordInputBeforeClick.getAttribute('type')).toBe(
      'password',
    );

    await findElementByTestIdAndClick({
      id: 'password-visibility-button',
      driver,
    });

    // Check that password input type changed to "text" after clicking visibility button
    const passwordInputAfterClick = await findElementByTestId({
      id: 'new-password-input',
      driver,
    });
    expect(await passwordInputAfterClick.getAttribute('type')).toBe('text');
    expect(await findElementByText(driver, 'Weak')).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'update-password', driver });
    await goBackTwice(driver);
    await findElementByTestIdAndClick({
      id: 'home-page-header-right',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'lock', driver });

    await typeOnTextInput({ id: 'password-input', driver, text: 'test5678' });
    await findElementByTestIdAndClick({ id: 'unlock-button', driver });
  });
  it('should be able to navigate to settings', async () => {
    await navigateToSettings(driver, rootURL);
  });
  it('should be able to check theme options', async () => {
    // Verify 'Dark' is shown as the current theme
    const darkThemeText = await findElementByText(driver, 'Dark');
    expect(darkThemeText).toBeTruthy();

    // Click on 'Theme' to open theme selector
    await findElementByText(driver, 'Theme').then((el) => el.click());

    // Switch to 'Light' theme
    await findElementByText(driver, 'Light').then((el) => el.click());

    // Verify 'Light' theme is now shown
    const lightThemeText = await findElementByText(driver, 'Light');
    expect(lightThemeText).toBeTruthy();

    // Switch back to 'Dark' theme
    await findElementByText(driver, 'Theme').then((el) => el.click());
    await findElementByText(driver, 'Dark').then((el) => el.click());

    // Verify 'Dark' theme is shown again
    const darkThemeTextAgain = await findElementByText(driver, 'Dark');
    expect(darkThemeTextAgain).toBeTruthy();
  });
  it('should be able to check language options', async () => {
    // Verify 'English' is shown as the current language
    const englishLanguage = await findElementByText(driver, 'English');
    expect(englishLanguage).toBeTruthy();

    // Click on 'Language' to navigate to language selection
    await findElementByText(driver, 'Language').then((el) => el.click());

    // Switch to Spanish (Español)
    await findElementByText(driver, 'Español').then((el) => el.click());

    // Navigate back to settings - note that UI is now in Spanish
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });

    // Verify 'Español' is shown (and 'Idioma' exists since UI is in Spanish)
    const spanishLanguage = await findElementByText(driver, 'Español');
    expect(spanishLanguage).toBeTruthy();
    const idiomaText = await findElementByText(driver, 'Idioma');
    expect(idiomaText).toBeTruthy();

    // Click on 'Idioma' (Language in Spanish) to switch back
    await findElementByText(driver, 'Idioma').then((el) => el.click());
    await findElementByText(driver, 'English').then((el) => el.click());
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });

    // Verify 'English' is shown again and UI is back to English
    const englishLanguageAgain = await findElementByText(driver, 'English');
    expect(englishLanguageAgain).toBeTruthy();
    const languageText = await findElementByText(driver, 'Language');
    expect(languageText).toBeTruthy();
  });

  it('should be able to check currency options', async () => {
    // Verify 'United States Dollar' (USD) is shown as the current currency
    const usdCurrency = await findElementByText(driver, 'United States Dollar');
    expect(usdCurrency).toBeTruthy();

    // Click on 'Currency' to navigate to currency selection
    await findElementByText(driver, 'Currency').then((el) => el.click());

    // Switch to Euro (EUR)
    await findElementByText(driver, 'Euro').then((el) => el.click());

    // Navigate back to settings to verify the change
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });

    // Verify 'Euro' is now shown as the selected currency
    const euroCurrency = await findElementByText(driver, 'Euro');
    expect(euroCurrency).toBeTruthy();

    // Navigate to home screen and check for Euro symbol
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    const euroSymbol = await findElementByText(driver, '€');
    expect(euroSymbol).toBeTruthy();

    // Go back to settings and switch back to USD
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
    await findElementByText(driver, 'Currency').then((el) => el.click());
    await findElementByText(driver, 'United States Dollar').then((el) =>
      el.click(),
    );
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });

    // Verify 'United States Dollar' is shown again
    const usdCurrencyAgain = await findElementByText(
      driver,
      'United States Dollar',
    );
    expect(usdCurrencyAgain).toBeTruthy();

    // Navigate to home screen and check for dollar symbol
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    const dollarSymbol = await findElementByText(driver, '$');
    expect(dollarSymbol).toBeTruthy();
  });
});
