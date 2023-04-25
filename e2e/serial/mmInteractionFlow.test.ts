import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementById,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getAllWindowHandles,
  getExtensionIdByName,
  getTextFromDappText,
  getWindowHandle,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  typeOnTextInput,
  waitAndClick,
} from '../helpers';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';
const walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
// eslint-disable-next-line prettier/prettier
const shortenedAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38, 42)}`;

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

  afterAll(() => driver.quit());

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
    await driver.get('https://bx-e2e-dapp.vercel.app/');
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'connectButton', driver });
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    // wait for window handlers to update
    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);

    await delayTime('long');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await driver.switchTo().window(dappHandler);

    const accounts = await findElementById({ id: 'accounts', driver });
    expect(accounts).toBeTruthy();

    const connectedAddress = await accounts.getText();
    expect(connectedAddress).toBe(walletAddress);
  });

  // Personal Sign
  it('should be able to complete a personal sign', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'personalSign', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);

    await delayTime('long');
    const message = await findElementByTestId({
      id: 'sign-message-text',
      driver,
    });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');

    const personalSignResult = await findElementById({
      id: 'personalSignResult',
      driver,
    });
    const personalSignText = await personalSignResult.getText();
    expect(personalSignText).toBeTruthy;
  });

  // Sign Typed Data V3
  it('should be able to sign typed data (v3)', async () => {
    const dappHandler = await getWindowHandle({ driver });
    await driver.switchTo().window(dappHandler);

    const button = await findElementById({ id: 'signTypedDataV3', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);

    await delayTime('long');
    const message = await findElementByTestId({
      id: 'sign-message-text',
      driver,
    });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');

    const verifyButton = await findElementById({
      id: 'signTypedDataV3Verify',
      driver,
    });
    await waitAndClick(verifyButton, driver);

    const result = await getTextFromDappText({
      id: 'signTypedDataV3VerifyResult',
      driver,
    });
    expect(result).toBe(walletAddress.toLowerCase());
  });

  // Sign Typed Data V4
  it('should be able to sign typed data (v4)', async () => {
    const dappHandler = await getWindowHandle({ driver });

    await driver.switchTo().window(dappHandler);

    const button = await findElementById({ id: 'signTypedDataV4', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);

    await delayTime('long');
    const message = await findElementByTestId({
      id: 'sign-message-text',
      driver,
    });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');

    const verifyButton = await findElementById({
      id: 'signTypedDataV4Verify',
      driver,
    });
    await waitAndClick(verifyButton, driver);

    const result = await getTextFromDappText({
      id: 'signTypedDataV4VerifyResult',
      driver,
    });
    expect(result).toBe(walletAddress.toLowerCase());
  });
});
