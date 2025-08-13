/* eslint-disable no-await-in-loop */
import { describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementByTestIdAndClick,
  findElementByText,
  goToPopup,
  goToWelcome,
  passSecretQuiz,
  querySelector,
  typeOnTextInput,
  waitAndClick,
} from '../helpers';

describe('New wallet flow', () => {
  // Create a new wallet
  it('should be able create a new wallet', async ({ driver, rootURL }) => {
    await goToWelcome(driver, rootURL);

    await findElementByTestIdAndClick({
      id: 'create-wallet-button',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'show-recovery-phrase-button',
      driver,
    });

    await passSecretQuiz(driver);

    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await typeOnTextInput({
      id: 'confirm-password-input',
      driver,
      text: 'test1234',
    });

    await findElementByTestIdAndClick({ id: 'set-password-button', driver });
    await delayTime('long');
    await findElementByText(driver, 'Rainbow is ready to use');
  });

  it('should display account name', async ({ driver, rootURL }) => {
    await goToPopup(driver, rootURL);
    const label = await querySelector(
      driver,
      '[data-testid="header"] [data-testid="account-name"]',
    );

    const actual = await label.getText();
    expect(actual.substr(0, 2) === '0x' && actual.length === 11).toEqual(true);
  });

  it('should be able to lock and unlock the extension', async ({
    driver,
    rootURL,
  }) => {
    await goToPopup(driver, rootURL, '#/home');
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

  it('should be able to test the sandbox for the popup', async ({
    driver,
    rootURL,
  }) => {
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

  it('should be able to test the sandbox for the background', async ({
    driver,
  }) => {
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
