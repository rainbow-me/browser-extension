/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, expect, it } from 'vitest';

import {
  delayTime,
  findElementAndClick,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  typeOnTextInput,
} from './helpers';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

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
    text: 'djweth.eth',
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

it('should display account name', async () => {
  await goToPopup(driver, rootURL);
  const label = await querySelector(
    driver,
    '[data-testid="header"] [data-testid="account-name"]',
  );

  const actual = await label.getText();
  const expected = ['0x70c1...43C4', 'djweth.eth'];
  expect(expected.includes(actual)).toEqual(true);
});

it('should shuffle account', async () => {
  await findElementAndClick({ id: 'header-account-name-shuffle', driver });
  const label = await querySelector(
    driver,
    '[data-testid="header"] [data-testid="account-name"]',
  );
  const actual = await label.getText();
  const expected = ['0x5B57...7C35', 'estebanmino.eth'];
  expect(expected.includes(actual)).toEqual(true);
});

it('should be able to lock and unlock the extension', async () => {
  // Lock
  await findElementAndClick({
    id: 'header-account-name-link-to-wallet',
    driver,
  });
  await findElementAndClick({ id: 'wallet-lock-button', driver });

  // Unlock
  await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
  await findElementByTestIdAndClick({ id: 'unlock-button', driver });
});
