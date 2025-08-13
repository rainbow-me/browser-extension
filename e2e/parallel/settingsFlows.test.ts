/* eslint-disable no-await-in-loop */
import { describe, expect, it } from 'vitest';

import {
  findElementByTestId,
  findElementByTestIdAndClick,
  goBackTwice,
  importWalletFlow,
  navigateToSettingsPrivacy,
  toggleStatus,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

const browser = process.env.BROWSER || 'chrome';

describe('Navigate Settings & Privacy and its flows', () => {
  it('should be able import a wallet via seed', async ({ driver, rootURL }) => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should be able to toggle analytics', async ({ driver, rootURL }) => {
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

  it('should be able to hide asset balances', async ({ driver, rootURL }) => {
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

  it('should be able to change password and then lock and unlock with it', async ({
    driver,
    rootURL,
  }) => {
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
