import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementById,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
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

  afterAll(async () => driver.quit());

  it('should be able import a wallet via seed', async () => {
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

  it('should be able to connect to bx test dapp', async () => {
    await driver.get('https://bx-e2e-dapp.vercel.app/');
    await delayTime('medium');
    const dappHandler = await driver.getWindowHandle();

    const button = await findElementById({ id: 'connectButton', driver });
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    await delayTime('medium');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await driver.switchTo().window(dappHandler);

    const accounts = await findElementById({ id: 'accounts', driver });
    expect(accounts).toBeTruthy();

    const connectedAddress = await accounts.getText();
    expect(connectedAddress).toBe(walletAddress);
  });

  it('should be able to switch network to hardhat', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'home-page-header-connected-apps',
      driver,
    });

    const connection = await findElementByText(
      driver,
      'bx-e2e-dapp.vercel.app',
    );
    await waitAndClick(connection, driver);
    await findElementByTestIdAndClick({ id: 'switch-network-item-5', driver });

    await driver.get('https://bx-e2e-dapp.vercel.app/');
    await delayTime('medium');
    const dappHandler = await driver.getWindowHandle();

    await driver.switchTo().window(dappHandler);

    const chain = await findElementById({ id: 'chainId', driver });
    const chainText = await chain.getText();
    await expect(chainText).toBe('0x539');
  });

  it('should be able to deploy a collection', async () => {
    await delayTime('medium');
    const dappHandler = await driver.getWindowHandle();

    const button = await findElementById({
      id: 'deployCollectiblesButton',
      driver,
    });
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    await delayTime('long');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');

    await driver.switchTo().window(dappHandler);
    await delayTime('very-long');

    const confirmation = await findElementById({
      id: 'collectiblesStatus',
      driver,
    });
    const confrimationText = await confirmation.getText();
    expect(confrimationText).toBe('Deployed');
  });

  it('should be able to mint a collectible', async () => {
    await delayTime('medium');
    const dappHandler = await driver.getWindowHandle();

    const button = await findElementById({
      id: 'mintButton',
      driver,
    });
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    await delayTime('long');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');

    await driver.switchTo().window(dappHandler);
    await delayTime('very-long');

    const confirmation = await findElementById({
      id: 'collectiblesStatus',
      driver,
    });
    const confrimationText = await confirmation.getText();
    expect(confrimationText).toBe('Mint completed');
  });

  it('should be able to approve a collectible', async () => {
    await delayTime('medium');
    const dappHandler = await driver.getWindowHandle();

    const button = await findElementById({
      id: 'approveButton',
      driver,
    });
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    await delayTime('long');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');

    await driver.switchTo().window(dappHandler);
    await delayTime('very-long');

    const confirmation = await findElementById({
      id: 'collectiblesStatus',
      driver,
    });
    const confrimationText = await confirmation.getText();
    expect(confrimationText).toBe('Approve completed');
  });

  it('should be able to set approval for all for a collectible', async () => {
    await delayTime('medium');
    const dappHandler = await driver.getWindowHandle();

    const button = await findElementById({
      id: 'setApprovalForAllButton',
      driver,
    });
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    await delayTime('long');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');

    await driver.switchTo().window(dappHandler);
    await delayTime('very-long');

    const confirmation = await findElementById({
      id: 'collectiblesStatus',
      driver,
    });
    const confrimationText = await confirmation.getText();
    expect(confrimationText).toBe('Set Approval For All completed');
  });

  it('should be able to revoke approval for a collectible', async () => {
    await delayTime('medium');
    const dappHandler = await driver.getWindowHandle();

    const button = await findElementById({
      id: 'revokeButton',
      driver,
    });
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    await delayTime('long');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');

    await driver.switchTo().window(dappHandler);
    await delayTime('very-long');

    const confirmation = await findElementById({
      id: 'collectiblesStatus',
      driver,
    });
    const confrimationText = await confirmation.getText();
    expect(confrimationText).toBe('Revoke completed');
  });

  it('should be able to transfer a collectible', async () => {
    await delayTime('medium');
    const dappHandler = await driver.getWindowHandle();

    const button = await findElementById({
      id: 'transferFromButton',
      driver,
    });
    await waitAndClick(button, driver);

    await delayTime('medium');
    const handlers = await driver.getAllWindowHandles();

    const popupHandler =
      handlers.find((handler) => handler !== dappHandler) || '';

    await driver.switchTo().window(popupHandler);

    await delayTime('long');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');

    await driver.switchTo().window(dappHandler);
    await delayTime('very-long');

    const confirmation = await findElementById({
      id: 'collectiblesStatus',
      driver,
    });
    const confrimationText = await confirmation.getText();
    expect(confrimationText).toBe('Transfer From completed');
  });
});
