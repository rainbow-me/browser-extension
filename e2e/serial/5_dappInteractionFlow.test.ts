import 'chromedriver';
import 'geckodriver';
import { getAddress } from '@ethersproject/address';
import { By, WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  awaitTextChange,
  delayTime,
  fillPrivateKey,
  findElementById,
  findElementByIdAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getAllWindowHandles,
  getExtensionIdByName,
  getOnchainBalance,
  getTextFromDappText,
  getWindowHandle,
  goToPopup,
  goToTestApp,
  goToWelcome,
  initDriverWithOptions,
  shortenAddress,
  switchWindows,
  transactionStatus,
  typeOnTextInput,
  waitAndClick,
} from '../helpers';
import { TEST_VARIABLES, URLS } from '../walletVariables';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';
const shortenedAddress = shortenAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS);

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
  it('should be able import a wallet via pk', async () => {
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

    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    await fillPrivateKey(driver, TEST_VARIABLES.SEED_WALLET.PK);

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await typeOnTextInput({
      id: 'confirm-password-input',
      driver,
      text: 'test1234',
    });
    await findElementByTestIdAndClick({ id: 'set-password-button', driver });
    await findElementByText(driver, 'Rainbow is ready to use');
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

  it('should be able to connect to mm dapp on the hardhat network', async () => {
    await goToTestApp(URLS.MM_TEST_APP, 'container-fluid', driver, 'class');
    const dappHandler = await getWindowHandle({ driver });

    await findElementByIdAndClick({ id: 'connectButton', driver });

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    await findElementByTestIdAndClick({ id: 'switch-network-menu', driver });

    await findElementByTestIdAndClick({ id: 'switch-network-item-5', driver });

    const networkLabel = await findElementByTestId({
      id: 'network-label',
      driver,
    });

    expect(await networkLabel.getText()).toBe('Hardhat');

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    // the dapp UI doesn't update the chain ID
    // on the page unless the page is refreshed
    await driver.navigate().refresh();
    // make sure the page has finished loading
    await driver.findElement(By.css(`[class="container-fluid"]`));

    const chain = await findElementById({ id: 'chainId', driver });
    const chainText = await chain.getText();
    await expect(chainText).toBe('0x539');

    const accounts = await findElementById({ id: 'accounts', driver });
    expect(accounts).toBeTruthy();

    const connectedAddress = await accounts.getText();
    expect(getAddress(connectedAddress)).toBe(
      getAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS),
    );
  });

  it('should be able to complete a personal sign', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'personalSign', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const message = await findElementByTestId({
      id: 'sign-message-text',
      driver,
    });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    const personalSignResult = await findElementById({
      id: 'personalSignResult',
      driver,
    });
    const personalSignText = await personalSignResult.getText();
    expect(personalSignText).toBeTruthy();
  });

  it('should be able to sign typed data (v3)', async () => {
    const dappHandler = await getWindowHandle({ driver });

    await switchWindows(dappHandler, driver);

    const button = await findElementById({ id: 'signTypedDataV3', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const message = await findElementByTestId({
      id: 'sign-message-text',
      driver,
    });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    const verifyButton = await findElementById({
      id: 'signTypedDataV3Verify',
      driver,
    });
    await waitAndClick(verifyButton, driver);

    const result = await getTextFromDappText({
      id: 'signTypedDataV3VerifyResult',
      driver,
    });
    expect(result).toBe(TEST_VARIABLES.SEED_WALLET.ADDRESS.toLowerCase());
  });

  it('should be able to sign typed data (v4)', async () => {
    const dappHandler = await getWindowHandle({ driver });

    await switchWindows(dappHandler, driver);

    const button = await findElementById({ id: 'signTypedDataV4', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const message = await findElementByTestId({
      id: 'sign-message-text',
      driver,
    });
    expect(message).toBeTruthy();

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    const verifyButton = await findElementById({
      id: 'signTypedDataV4Verify',
      driver,
    });
    await waitAndClick(verifyButton, driver);

    const result = await getTextFromDappText({
      id: 'signTypedDataV4VerifyResult',
      driver,
    });
    expect(result).toBe(TEST_VARIABLES.SEED_WALLET.ADDRESS.toLowerCase());
  });

  it('should be able to create token', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'createToken', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    const token = await findElementById({ id: 'tokenAddress', driver });
    const tokenText = await token.getText();
    expect(tokenText).toContain('0x');
    expect(tokenText.length).toEqual(42);

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to transfer token', async () => {
    // get token contract address

    const token = await findElementById({ id: 'tokenAddress', driver });
    const tokenText = await token.getText();

    // find pre-send balance of token created in last test
    const senderPreSendbalance = await getOnchainBalance(
      TEST_VARIABLES.SEED_WALLET.ADDRESS,
      tokenText,
    );
    // recipient address hardcoded on test dapp and used here
    const recipientPreSendBalance = await getOnchainBalance(
      TEST_VARIABLES.DAPP_RECIPIENT.ADDRESS,
      tokenText,
    );

    const dappHandler = await getWindowHandle({ driver });

    const watchButton = await findElementById({ id: 'transferTokens', driver });
    await waitAndClick(watchButton, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    // find post-send token address
    const senderPostSendbalance = await getOnchainBalance(
      TEST_VARIABLES.SEED_WALLET.ADDRESS,
      tokenText,
    );
    // recipient address hardcoded on test dapp and used here
    const recipientPostSendBalance = await getOnchainBalance(
      TEST_VARIABLES.DAPP_RECIPIENT.ADDRESS,
      tokenText,
    );

    // test dapp hardcodes the amount of tokens created and transfered. expected values are as below
    expect(Number(senderPreSendbalance)).toBe(100000);
    expect(Number(senderPostSendbalance)).toBe(
      Number(senderPreSendbalance) - 15000,
    );
    expect(Number(recipientPreSendBalance)).toBe(0);
    expect(Number(recipientPostSendBalance)).toBe(
      Number(recipientPreSendBalance) + 15000,
    );

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to approve tokens', async () => {
    const dappHandler = await getWindowHandle({ driver });

    await switchWindows(dappHandler, driver);

    const watchButton = await findElementById({ id: 'approveTokens', driver });
    await waitAndClick(watchButton, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to transfer tokens without gas', async () => {
    // get token contract address

    const token = await findElementById({ id: 'tokenAddress', driver });
    const tokenText = await token.getText();

    // find pre-send balance of token created in last test
    const senderPreSendbalance = await getOnchainBalance(
      TEST_VARIABLES.SEED_WALLET.ADDRESS,
      tokenText,
    );
    // recipient address hardcoded on test dapp and used here
    const recipientPreSendBalance = await getOnchainBalance(
      TEST_VARIABLES.DAPP_RECIPIENT.ADDRESS,
      tokenText,
    );

    const dappHandler = await getWindowHandle({ driver });

    await switchWindows(dappHandler, driver);

    const watchButton = await findElementById({
      id: 'transferTokensWithoutGas',
      driver,
    });
    await waitAndClick(watchButton, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    // find post-send token address
    const senderPostSendbalance = await getOnchainBalance(
      TEST_VARIABLES.SEED_WALLET.ADDRESS,
      tokenText,
    );
    // recipient address hardcoded on test dapp and used here
    const recipientPostSendBalance = await getOnchainBalance(
      TEST_VARIABLES.DAPP_RECIPIENT.ADDRESS,
      tokenText,
    );

    // test dapp hardcodes the amount of tokens created and transfered. expected values are as below
    expect(Number(senderPreSendbalance)).toBe(85000);
    expect(Number(senderPostSendbalance)).toBe(
      Number(senderPreSendbalance) - 15000,
    );
    expect(Number(recipientPreSendBalance)).toBe(15000);
    expect(Number(recipientPostSendBalance)).toBe(
      Number(recipientPreSendBalance) + 15000,
    );

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to approve token without gas', async () => {
    const dappHandler = await getWindowHandle({ driver });

    await switchWindows(dappHandler, driver);

    const watchButton = await findElementById({
      id: 'approveTokensWithoutGas',
      driver,
    });
    await waitAndClick(watchButton, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);

    const txnStatus = await transactionStatus();
    expect(txnStatus).toBe('success');
  });

  it('should be able to do a legacy send', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'sendButton', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);
  });

  it('should be able to do a EIP 1559 send', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({ id: 'sendEIP1559Button', driver });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);
  });

  it('should be able to deploy a collection', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'deployCollectiblesButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);
    await delayTime('very-long');

    await awaitTextChange('collectiblesStatus', 'Deployed', driver);
  });

  it('should be able to mint a collectible', async () => {
    const dappHandler = await getWindowHandle({ driver });

    await findElementByIdAndClick({ id: 'mintButton', driver });

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);
    await delayTime('very-long');

    await awaitTextChange('collectiblesStatus', 'Mint completed', driver);
  });

  it('should be able to approve a collectible', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'approveButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);
    await delayTime('very-long');

    await awaitTextChange('collectiblesStatus', 'Approve completed', driver);
  });

  it('should be able to set approval for all for a collectible', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'setApprovalForAllButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);
    await delayTime('very-long');

    await awaitTextChange(
      'collectiblesStatus',
      'Set Approval For All completed',
      driver,
    );
  });

  it('should be able to revoke approval for a collectible', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'revokeButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);
    await delayTime('very-long');

    await awaitTextChange('collectiblesStatus', 'Revoke completed', driver);
  });

  it('should be able to transfer a collectible', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementById({
      id: 'transferFromButton',
      driver,
    });
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await switchWindows(popupHandler, driver);

    const address = await findElementByText(driver, shortenedAddress);
    expect(address).toBeTruthy();

    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await switchWindows(dappHandler, driver);
    await delayTime('very-long');

    await awaitTextChange(
      'collectiblesStatus',
      'Transfer From completed',
      driver,
    );
  });
});
