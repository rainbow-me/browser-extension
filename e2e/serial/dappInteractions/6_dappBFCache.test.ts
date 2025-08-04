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

import {
  delayTime,
  fillPrivateKey,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  goToTestApp,
  goToWelcome,
  initDriverWithOptions,
  takeScreenshotOnFailure,
  typeOnTextInput,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

const triggerBFCache = async (driver: WebDriver) => {
  await driver.executeScript(`
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.restoredFromBFCache = true;
      }
    });
  `);

  await driver.get('chrome://terms/');
  await driver.navigate().back();

  const restoredFromBFCache = await driver.executeScript(
    'return window.restoredFromBFCache',
  );
  if (!restoredFromBFCache) {
    throw new Error('Failed to trigger BFCache');
  }
};

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Dapp provider BFCache behavior', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
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

  afterAll(() => driver?.quit());

  it('has working provider stream after BFCache restore', async () => {
    // Import a wallet via private key
    await goToWelcome(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'import-wallet-button', driver });
    await findElementByTestIdAndClick({ id: 'import-wallet-option', driver });
    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });
    await fillPrivateKey(driver, TEST_VARIABLES.SEED_WALLET.PK);
    await findElementByTestIdAndClick({ id: 'import-wallets-button', driver });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await typeOnTextInput({
      id: 'confirm-password-input',
      driver,
      text: 'test1234',
    });
    await findElementByTestIdAndClick({ id: 'set-password-button', driver });
    await delayTime('long');
    await findElementByText(driver, 'Rainbow is ready to use');

    // Connect to Hardhat network
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({
      id: 'home-page-header-right',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
    await findElementByTestIdAndClick({ id: 'connect-to-hardhat', driver });
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });

    // Open test dapp
    await goToTestApp(driver);

    const request = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 0,
    });

    const initialResult = await driver.executeScript(
      `return window.ethereum.request(${request})`,
    );
    expect(initialResult).toBe('0x1');

    await triggerBFCache(driver);

    const bfcacheResult = await driver.executeScript(
      `return window.ethereum.request(${request})`,
    );
    expect(bfcacheResult).toBe('0x1');
  });
});
