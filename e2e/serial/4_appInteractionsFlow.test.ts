import 'chromedriver';
import 'geckodriver';
import { getAddress } from '@ethersproject/address';
import { isHexString } from '@ethersproject/bytes';
import { verifyMessage, verifyTypedData } from '@ethersproject/wallet';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementByTestIdAndClick,
  findElementByText,
  getAllWindowHandles,
  getExtensionIdByName,
  getWindowHandle,
  goToPopup,
  goToTestApp,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  typeOnTextInput,
  waitAndClick,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

const TYPED_MESSAGE = {
  domain: {
    chainId: 1,
    name: 'Ether Mail',
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    version: '1',
  },
  types: {
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
  },
  value: {
    contents: 'Hello, Bob!',
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
  },
};
const MESSAGE = 'rainbow rocks 🌈';
const CONNECTED_ADDRESS = '0x90F79bf6EB2c4f870365E785982E1f101E93b906';

let rootURL = 'chrome-extension://';
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

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
      text: TEST_VARIABLES.SEED_WALLET.SECRET,
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
    await findElementByText(driver, 'Rainbow is ready to use');
  });

  it('should be able to go to setings', async () => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
  });

  it.skip('should be able to set rainbow as default wallet', async () => {
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
    await delayTime('long');
    await goToTestApp(driver);
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementByText(driver, 'Connect Wallet');
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    const modalTitle = await findElementByText(driver, 'Connect a Wallet');
    expect(modalTitle).toBeTruthy();

    const mmButton = await querySelector(
      driver,
      '[data-testid="rk-wallet-option-rainbow"]',
    );
    await waitAndClick(mmButton, driver);

    const { popupHandler } = await getAllWindowHandles({
      driver,
      dappHandler,
    });

    await driver.switchTo().window(popupHandler);

    // switch account
    await findElementByTestIdAndClick({ id: 'switch-wallet-menu', driver });
    await findElementByTestIdAndClick({ id: 'switch-wallet-item-3', driver });
    // switch network
    await findElementByTestIdAndClick({ id: 'switch-network-menu', driver });
    await findElementByTestIdAndClick({ id: 'switch-network-item-0', driver });

    await delayTime('medium');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await driver.switchTo().window(dappHandler);
    const topButton = await querySelector(
      driver,
      '[data-testid="rk-account-button"]',
    );

    expect(topButton).toBeTruthy();
    await waitAndClick(topButton, driver);

    const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
    expect(ensLabel).toBeTruthy();
  });

  it('should be able to go back to extension and switch account and chain', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'home-page-header-connected-apps',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'connected-app-menu-bx-test-dapp.vercel.app',
      driver,
    });

    await findElementByTestIdAndClick({ id: 'switch-network-item-0', driver });

    await goToTestApp(driver);
    const expectedNetwork = 'Network: Ethereum - homestead';
    const network = await querySelector(driver, '[id="network"]');
    const actualNetwork = await network.getText();
    expect(actualNetwork).toEqual(expectedNetwork);

    const expectedAccountAddress = 'Account: 0x';
    const accountAddress = await querySelector(driver, '[id="accountAddress"]');
    const actualAccountAddress = await accountAddress.getText();
    expect(actualAccountAddress.includes(expectedAccountAddress)).toBe(true);
  });

  it('should be able to accept a signing request', async () => {
    await goToTestApp(driver);

    const dappHandler = await getWindowHandle({ driver });
    const button = await querySelector(driver, '[id="signTx"]');
    expect(button).toBeTruthy();
    await button.click();

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);

    await delayTime('medium');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await delayTime('medium');
    await driver.switchTo().window(dappHandler);
    const signatureTextSelector = await querySelector(
      driver,
      '[id="signTxSignature"]',
    );
    const signatureText = await signatureTextSelector.getText();
    const signature = signatureText.replace('sign message data sig: ', '');

    expect(isHexString(signature)).toBe(true);
    const recoveredAddress = verifyMessage(MESSAGE, signature);
    expect(getAddress(recoveredAddress)).eq(getAddress(CONNECTED_ADDRESS));
  });

  it('should be able to accept a typed data signing request', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await querySelector(driver, '[id="signTypedData"]');
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);
    await delayTime('medium');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('medium');
    await driver.switchTo().window(dappHandler);
    const signatureTextSelector = await querySelector(
      driver,
      '[id="signTypedDataSignature"]',
    );
    const signatureText = await signatureTextSelector.getText();
    const signature = signatureText.replace('typed message data sig: ', '');
    expect(isHexString(signature)).toBe(true);

    const recoveredAddress = verifyTypedData(
      TYPED_MESSAGE.domain,
      TYPED_MESSAGE.types,
      TYPED_MESSAGE.value,
      signature,
    );
    expect(getAddress(recoveredAddress)).eq(getAddress(CONNECTED_ADDRESS));
  });

  it('should be able to accept a transaction request', async () => {
    await delayTime('long');
    await goToTestApp(driver);

    const dappHandler = await getWindowHandle({ driver });

    await delayTime('long');
    const button = await querySelector(driver, '[id="sendTx"]');

    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await driver.switchTo().window(popupHandler);
    await delayTime('long');
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
    await delayTime('long');
    await driver.switchTo().window(dappHandler);
  });

  it('should be able to disconnect from connected dapps', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'home-page-header-connected-apps',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'connected-app-menu-bx-test-dapp.vercel.app',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'switch-network-menu-disconnect',
      driver,
    });
    await goToTestApp(driver);
    const button = await findElementByText(driver, 'Connect Wallet');
    expect(button).toBeTruthy();
  });
});
