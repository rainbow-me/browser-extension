import 'chromedriver';
import 'geckodriver';
import { getAddress } from '@ethersproject/address';
import { isHexString } from '@ethersproject/bytes';
import { verifyMessage, verifyTypedData } from '@ethersproject/wallet';
import { WebDriver } from 'selenium-webdriver';
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

describe.runIf(browser !== 'firefox')('dApp flow', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeEach(async (context: any) => {
    context.driver = driver;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterEach(async (context: any) => {
    await takeScreenshotOnFailure(context);
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
    await findElementByTestIdAndClick({ id: 'switch-wallet-item-2', driver });
    // switch network
    await findElementByTestIdAndClick({ id: 'switch-network-menu', driver });
    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.mainnet}`,
      driver,
    });

    await delayTime('medium');
    await clickAcceptRequestButton(driver);

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
    await clickAcceptRequestButton(driver);

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

    await driver.switchTo().window(popupHandler);
    await delayTime('medium');
    await clickAcceptRequestButton(driver);
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

    await driver.switchTo().window(popupHandler);
    await delayTime('very-long');
    await clickAcceptRequestButton(driver);
    await delayTime('long');
    await driver.switchTo().window(dappHandler);
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
});
