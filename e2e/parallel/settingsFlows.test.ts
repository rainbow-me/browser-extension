/* eslint-disable no-await-in-loop */
import { WebDriver } from 'selenium-webdriver';
import { describe, expect, it } from 'vitest';

import { TEST_VARIABLES } from '../fixtures/wallets';
import { delayTime } from '../helpers/delays';
import {
  findElementByTestId,
  findElementByTestIdAndClick,
  toggleStatus,
} from '../helpers/elements';
import { browser } from '../helpers/environment';
import { typeOnTextInput } from '../helpers/input';
import { goBackTwice, goToPopup } from '../helpers/navigation';
import { importWalletFlow } from '../helpers/onboarding';

async function navigateToSettingsPrivacy(driver: WebDriver, rootURL: string) {
  await goToPopup(driver, rootURL, '#/home');
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
  await findElementByTestIdAndClick({ id: 'privacy-security-link', driver });
  await delayTime('medium');
}

describe('Navigate Settings & Privacy and its flows', () => {
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
});
