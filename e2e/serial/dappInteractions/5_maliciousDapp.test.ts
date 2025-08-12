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
  captureScreenshot,
  checkWalletName,
  delayTime,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getAllWindowHandles,
  getExtensionIdByName,
  getRootUrl,
  getWindowHandle,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
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

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await captureScreenshot(context);
  });
  afterAll(() => driver?.quit());

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should display account name', async () => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.ADDRESS);
  });

  it('should be able to go to setings', async () => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
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

  it('should be able to navigate to the malicious app and click connect', async () => {
    await delayTime('long');
    await driver.get('https://test-dap-welps.vercel.app/');
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementByTestId({
      id: 'rk-connect-button',
      driver,
    });
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    await delayTime('long');

    await findElementByTestIdAndClick({
      id: 'rk-wallet-option-rainbow',
      driver,
    });
    await delayTime('long');

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });
    await driver.switchTo().window(popupHandler);
  });

  it('should be able to navigate to switch to BX and see malicious app warning', async () => {
    await delayTime('long');
    const dappWarning = await findElementByTestId({
      id: 'malicious-request-warning',
      driver,
    });
    const warningText = await dappWarning.getText();

    const warningText1 = 'This app is likely malicious';
    const warningText2 =
      'Signing messages or transactions from this app could result in losing your assets';

    expect(dappWarning).toBeTruthy();
    expect(warningText).toContain(warningText1);
    expect(warningText).toContain(warningText2);
  });
});
