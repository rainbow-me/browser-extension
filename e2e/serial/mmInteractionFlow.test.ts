import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delay,
  delayTime,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getTextFromDappText,
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
const walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

describe('App interactions flow', () => {
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
  it('should be able import a wallet via seed', async () => {
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
  });

  it('should be able to go to setings', async () => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
  });

  it('should be able to set rainbow as default wallet', async () => {
    await findElementByTestIdAndClick({
      id: 'set-rainbow-default-toggle',
      driver,
    });
  });

  it('should be able to connect to hardhat', async () => {
    await findElementByTestIdAndClick({ id: 'connect-to-hardhat', driver });
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
  });

  // connect to dapp
  it('should be able to connect to mm dapp', async () => {
    await delayTime('long');
    await driver.get('https://metamask.github.io/test-dapp/');
    await delay(1000);
    const dappHandler = await driver.getWindowHandle();

    const button = await querySelector(driver, '[id="connectButton"]');
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    // wait for window handlers to update
    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    await delayTime('medium');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await driver.switchTo().window(dappHandler);

    const accounts = await querySelector(driver, '[id="accounts"]');
    expect(accounts).toBeTruthy();

    const account = await findElementByText(driver, walletAddress);
    expect(account).toBeTruthy();
  });

  // Personal Sign
  it('should be able to complete a personal sign', async () => {
    const dappHandler = await driver.getWindowHandle();

    const button = await querySelector(driver, '[id="personalSign"]');
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    const message = await findElementByTestId({ id: 'text-area', driver });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, '0xf39F...2266');
    expect(address).toBeTruthy();

    await delayTime('long');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await driver.switchTo().window(dappHandler);

    await delayTime('long');
    const personalSignData = await querySelector(
      driver,
      '[id="personalSignResult"]',
    );
    expect(personalSignData).toBeTruthy();

    const result = await findElementByText(driver, walletAddress);
    expect(result).toBeTruthy();
  });

  // Sign Typed Data V3
  it('should be able to sign typed data (v3)', async () => {
    const dappHandler = await driver.getWindowHandle();
    await driver.switchTo().window(dappHandler);

    const button = await querySelector(driver, '[id="signTypedDataV3"]');
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    const message = await findElementByTestId({ id: 'text-area', driver });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, '0xf39F...2266');
    expect(address).toBeTruthy();

    await delayTime('long');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');

    await driver.switchTo().window(dappHandler);

    const verifyButton = await querySelector(
      driver,
      '[id="signTypedDataV3Verify"]',
    );
    await waitAndClick(verifyButton, driver);

    const result = await getTextFromDappText({
      id: 'signTypedDataV3VerifyResult',
      driver,
    });
    expect(result).toBe(walletAddress.toLowerCase());
  });

  // Sign Typed Data V4
  it('should be able to sign typed data (v4)', async () => {
    const dappHandler = await driver.getWindowHandle();
    await driver.switchTo().window(dappHandler);

    const button = await querySelector(driver, '[id="signTypedDataV4"]');
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    const message = await findElementByTestId({ id: 'text-area', driver });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, '0xf39F...2266');
    expect(address).toBeTruthy();

    await delayTime('medium');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await driver.switchTo().window(dappHandler);

    const verifyButton = await querySelector(
      driver,
      '[id="signTypedDataV4Verify"]',
    );
    await delayTime('long');
    await waitAndClick(verifyButton, driver);

    const result = await getTextFromDappText({
      id: 'signTypedDataV4VerifyResult',
      driver,
    });
    expect(result).toBe(walletAddress.toLowerCase());
  });
});
