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
  getOnchainBalance,
  getTextFromDappText,
  getWindowHandle,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  transactionStatus,
  typeOnTextInput,
  waitAndClick,
} from '../helpers';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';
const walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const recipientWalletAddress = '0x2f318C334780961FB129D2a6c30D0763d9a5C970';
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

  it('should be able to connect to mm dapp', async () => {
    await delayTime('long');
    await driver.get('https://bx-e2e-dapp.vercel.app/');
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'connectButton', driver });
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

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
    expect(personalSignText).toBeTruthy();
  });

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
    const dappHandler = await getWindowHandle({ driver });

    await driver.switchTo().window(dappHandler);

    const chain = await findElementById({ id: 'chainId', driver });
    const chainText = await chain.getText();
    await expect(chainText).toBe('0x539');
  });

  it('should be able to create token', async () => {
    const dappHandler = await getWindowHandle({ driver });
    await driver.switchTo().window(dappHandler);

    const button = await findElementById({ id: 'createToken', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);

    await delayTime('long');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');

    const token = await findElementById({ id: 'tokenAddress', driver });
    const tokenText = await token.getText();
    expect(tokenText).toContain('0x');
    expect(tokenText.length).toEqual(42);

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to transfer token', async () => {
    // get token contract address
    await delayTime('medium');
    const token = await findElementById({ id: 'tokenAddress', driver });
    const tokenText = await token.getText();

    // find pre-send balance of token created in last test
    const senderPreSendbalance = await getOnchainBalance(
      walletAddress,
      tokenText,
    );
    // recipient address hardcoded on test dapp and used here
    const recipientPreSendBalance = await getOnchainBalance(
      recipientWalletAddress,
      tokenText,
    );

    const dappHandler = await getWindowHandle({ driver });
    await driver.switchTo().window(dappHandler);

    const watchButton = await findElementById({ id: 'transferTokens', driver });
    await waitAndClick(watchButton, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);
    await delayTime('long');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');

    // find post-send token address
    const senderPostSendbalance = await getOnchainBalance(
      walletAddress,
      tokenText,
    );
    // recipient address hardcoded on test dapp and used here
    const recipientPostSendBalance = await getOnchainBalance(
      recipientWalletAddress,
      tokenText,
    );

    // test dapp hardcodes the amount of tokens created and transfered. expected values are as below
    expect(Number(senderPreSendbalance)).toBe(100000);
    expect(Number(senderPostSendbalance)).toBe(85000);
    expect(Number(recipientPreSendBalance)).toBe(0);
    expect(Number(recipientPostSendBalance)).toBe(15000);

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to approve tokens', async () => {
    const dappHandler = await getWindowHandle({ driver });
    await driver.switchTo().window(dappHandler);

    const watchButton = await findElementById({ id: 'approveTokens', driver });
    await waitAndClick(watchButton, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);
    await delayTime('medium');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to transfer tokens without gas', async () => {
    // get token contract address
    await delayTime('medium');
    const token = await findElementById({ id: 'tokenAddress', driver });
    const tokenText = await token.getText();

    // find pre-send balance of token created in last test
    const senderPreSendbalance = await getOnchainBalance(
      walletAddress,
      tokenText,
    );
    // recipient address hardcoded on test dapp and used here
    const recipientPreSendBalance = await getOnchainBalance(
      recipientWalletAddress,
      tokenText,
    );

    const dappHandler = await getWindowHandle({ driver });
    await driver.switchTo().window(dappHandler);

    const watchButton = await findElementById({
      id: 'transferTokensWithoutGas',
      driver,
    });
    await waitAndClick(watchButton, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);
    await delayTime('medium');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');

    // find post-send token address
    const senderPostSendbalance = await getOnchainBalance(
      walletAddress,
      tokenText,
    );
    // recipient address hardcoded on test dapp and used here
    const recipientPostSendBalance = await getOnchainBalance(
      recipientWalletAddress,
      tokenText,
    );

    // test dapp hardcodes the amount of tokens created and transfered. expected values are as below
    expect(Number(senderPreSendbalance)).toBe(85000);
    expect(Number(senderPostSendbalance)).toBe(70000);
    expect(Number(recipientPreSendBalance)).toBe(15000);
    expect(Number(recipientPostSendBalance)).toBe(30000);

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to approve token without gas', async () => {
    const dappHandler = await getWindowHandle({ driver });
    await driver.switchTo().window(dappHandler);

    const watchButton = await findElementById({
      id: 'approveTokensWithoutGas',
      driver,
    });
    await waitAndClick(watchButton, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);
    await delayTime('medium');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to do a legacy send', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'sendButton', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);

    await delayTime('medium');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');
  });

  it('should be able to do a EIP 1559 send', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'sendEIP1559Button', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);

    await delayTime('medium');

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');

    await driver.switchTo().window(dappHandler);
    await delayTime('medium');
  });

  it('should be able to deploy a collection', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'deployCollectiblesButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

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
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'mintButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

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
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'approveButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

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
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'setApprovalForAllButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

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
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'revokeButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

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
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'transferFromButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

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
