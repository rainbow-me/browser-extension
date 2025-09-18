import { verifyMessage, verifyTypedData } from '@ethersproject/wallet';
import { By, WebDriver } from 'selenium-webdriver';
import { getAddress, isHex } from 'viem';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { ChainId } from '~/core/types/chains';

import {
  cleanupDriver,
  clickAcceptRequestButton,
  connectToTestDapp,
  delayTime,
  fillPrivateKey,
  findElementByIdAndClick,
  findElementByTestIdAndClick,
  findElementByText,
  getAllWindowHandles,
  getExtensionIdByName,
  getRootUrl,
  getTextFromText,
  getWindowHandle,
  goToPopup,
  goToTestApp,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  safeNavigate,
  safeWindowSwitch,
  shortenAddress,
  switchWallet,
  takeScreenshotOnFailure,
  typeOnTextInput,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

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

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('App interactions flow', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
      testSuite: 'window-switching', // Heavy window/tab switching test
      disableHeadless: true, // Modal detection requires non-headless mode
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
  });

  afterAll(() => cleanupDriver(driver));

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
    await delayTime('long');
    await findElementByText(driver, 'Rainbow is ready to use');
  });

  it('should be able to go to setings', async () => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
  });

  it.todo('should be able to set rainbow as default wallet', async () => {
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

  it('should be able to add a new wallet via pk 2', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    await fillPrivateKey(driver, TEST_VARIABLES.PRIVATE_KEY_WALLET_2.SECRET);

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
  });

  it('should be able to add a new wallet via pk 3', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    await fillPrivateKey(driver, TEST_VARIABLES.PRIVATE_KEY_WALLET_3.SECRET);

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
  });

  it('should be able to switch to the first pk wallet', async () => {
    await delayTime('medium');
    await switchWallet(TEST_VARIABLES.SEED_WALLET.ADDRESS, rootURL, driver);
    await delayTime('very-long');
    const wallet = await getTextFromText({ id: 'account-name', driver });
    expect(wallet).toBe(shortenAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS));
  });

  it('should be able to connect to bx test dapp', async () => {
    const { dappHandler } = await connectToTestDapp(driver);

    // switch account
    await findElementByTestIdAndClick({ id: 'switch-wallet-menu', driver });
    await delayTime('medium');
    await findElementByTestIdAndClick({ id: 'switch-wallet-item-2', driver });
    // switch network
    await findElementByTestIdAndClick({ id: 'switch-network-menu', driver });
    await delayTime('medium');
    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.mainnet}`,
      driver,
    });

    await delayTime('medium');
    await clickAcceptRequestButton(driver);

    await safeWindowSwitch(driver, dappHandler);
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
    // Use safe navigation to handle cross-origin navigation with BiDi
    await safeNavigate(driver, `${rootURL}/popup.html#/home`);
    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'app-connection-menu-connected-apps',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'connected-app-menu-bx-test-dapp.vercel.app',
      driver,
    });

    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.mainnet}`,
      driver,
    });
    await goToTestApp(driver);

    // IDK why firefox doesn't reconnect
    // This is probably some RK bug
    if (process.env.BROWSER === 'firefox') {
      await driver.navigate().refresh();
    }

    const expectedNetwork = 'Network: Ethereum';
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

    await safeWindowSwitch(driver, popupHandler);

    await delayTime('medium');
    await clickAcceptRequestButton(driver);

    await delayTime('medium');
    await safeWindowSwitch(driver, dappHandler);
    const signatureTextSelector = await querySelector(
      driver,
      '[id="signTxSignature"]',
    );
    const signatureText = await signatureTextSelector.getText();
    const signature = signatureText.replace('sign message data sig: ', '');

    expect(signature).toMatch(/^0x/);
    expect(isHex(signature)).toBe(true);
    const recoveredAddress = verifyMessage(MESSAGE, signature);
    expect(getAddress(recoveredAddress)).eq(
      getAddress(TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS),
    );
  });

  it('should be able to accept a typed data signing request', async () => {
    const dappHandler = await getWindowHandle({ driver });

    const button = await querySelector(driver, '[id="signTypedData"]');
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });

    await safeWindowSwitch(driver, popupHandler);
    await delayTime('medium');
    await clickAcceptRequestButton(driver);
    await delayTime('medium');
    await safeWindowSwitch(driver, dappHandler);
    const signatureTextSelector = await querySelector(
      driver,
      '[id="signTypedDataSignature"]',
    );
    const signatureText = await signatureTextSelector.getText();
    const signature = signatureText.replace('typed message data sig: ', '');
    expect(isHex(signature)).toBe(true);

    const recoveredAddress = verifyTypedData(
      TYPED_MESSAGE.domain,
      TYPED_MESSAGE.types,
      TYPED_MESSAGE.value,
      signature,
    );
    expect(getAddress(recoveredAddress)).eq(
      getAddress(TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS),
    );
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

    await safeWindowSwitch(driver, popupHandler);
    await delayTime('very-long');
    await clickAcceptRequestButton(driver);
    await delayTime('long');
    await safeWindowSwitch(driver, dappHandler);
  });

  it('should check initial networks and RPCs state', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
    await findElementByTestIdAndClick({ id: 'networks-link', driver });

    // Check mainnet and see how many RPCs it has initially
    await findElementByTestIdAndClick({ id: 'network-row-1', driver });
    await delayTime('medium');
    const initialRpcElements = await driver.findElements(
      By.css('[data-testid^="rpc-row-item"]'),
    );
    const initialRpcCount = initialRpcElements.length;
    console.log(`Initial RPC count for mainnet: ${initialRpcCount}`);
    expect(initialRpcCount).toBe(1);

    // Go back to networks list
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    await delayTime('medium');

    // Check how many networks we have initially
    const initialNetworkElements = await driver.findElements(
      By.css('[data-testid^="network-row"]'),
    );
    const initialNetworkCount = initialNetworkElements.length;
    console.log(`Initial network count: ${initialNetworkCount}`);
    expect(initialNetworkCount).toBe(6);
  });

  it('should be able to add a custom RPC for mainnet', async () => {
    await goToTestApp(driver);
    const dappHandler = await getWindowHandle({ driver });

    // Click the add RPC button
    const addRpcButton = await querySelector(driver, '[id="addRPC"]');
    expect(addRpcButton).toBeTruthy();
    await waitAndClick(addRpcButton, driver);
    await delayTime('long');

    await safeWindowSwitch(driver, dappHandler);
    await delayTime('medium');
  });

  it('should be able to add a custom network', async () => {
    const dappHandler = await getWindowHandle({ driver });

    // Click the add network button
    const addNetworkButton = await querySelector(driver, '[id="addNetwork"]');
    expect(addNetworkButton).toBeTruthy();
    await waitAndClick(addNetworkButton, driver);

    // Switch to popup to approve the network addition
    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });
    await driver.switchTo().window(popupHandler);

    await delayTime('medium');
    await clickAcceptRequestButton(driver);
    await delayTime('long');

    // Switch back to dapp - the network has been added
    await safeWindowSwitch(driver, dappHandler);
    await delayTime('medium');
  });

  it('should be able to disconnect from connected dapps', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'app-connection-menu-connected-apps',
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

  it('should verify custom RPC and network were added', async () => {
    // After disconnecting, let's verify the RPC and network were actually added
    await goToPopup(driver, rootURL, '#/home');
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
    await findElementByTestIdAndClick({ id: 'networks-link', driver });

    // Check mainnet RPCs - should have one more than before
    await findElementByTestIdAndClick({ id: 'network-row-1', driver });
    await delayTime('medium');

    const finalRpcElements = await driver.findElements(
      By.css('[data-testid^="rpc-row-item"]'),
    );
    const finalRpcCount = finalRpcElements.length;
    console.log(`Final RPC count for mainnet: ${finalRpcCount}`);

    // We should have at least one more RPC than initially
    expect(finalRpcCount).toBeGreaterThan(1);

    // Go back to networks list
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    await delayTime('medium');

    // Check total networks - should have one more than before
    const finalNetworkElements = await driver.findElements(
      By.css('[data-testid^="network-row"]'),
    );
    const finalNetworkCount = finalNetworkElements.length;
    console.log(`Final network count: ${finalNetworkCount}`);

    // We should have at least one more network than initially
    expect(finalNetworkCount).toBeGreaterThan(6);
  });
});
