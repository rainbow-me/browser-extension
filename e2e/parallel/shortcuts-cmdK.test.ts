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
  checkExtensionURL,
  delayTime,
  doNotFindElementByTestId,
  executePerformShortcut,
  findElementByTestId,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  isElementFoundByText,
  takeScreenshotOnFailure,
  typeOnTextInput,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Cmd+K menu unique functionality', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;

    // Import wallet for testing
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.SEED_WALLET.PK);
  });

  afterAll(async () => driver.quit());

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
  });

  it('should open and close Cmd+K menu', async () => {
    await goToPopup(driver, rootURL);

    await executePerformShortcut({ driver, key: 'k' });

    const commandInput = await findElementByTestId({
      id: 'command-k-input',
      driver,
    });
    expect(commandInput).toBeTruthy();

    const suggestionsText = await findElementByText(driver, 'Suggestions');
    expect(suggestionsText).toBeTruthy();

    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await doNotFindElementByTestId({ id: 'command-k-input', driver });
  });

  it('should search and filter commands', async () => {
    await executePerformShortcut({ driver, key: 'k' });

    await typeOnTextInput({
      id: 'command-k-input',
      driver,
      text: 'swap',
    });

    const swapCommand = await findElementByTestId({
      id: 'command-shortcut-Swap',
      driver,
    });
    expect(swapCommand).toBeTruthy();

    await executePerformShortcut({
      driver,
      key: 'BACK_SPACE',
      timesToPress: 4,
    });

    await typeOnTextInput({
      id: 'command-k-input',
      driver,
      text: 'send',
    });

    const sendCommand = await findElementByTestId({
      id: 'command-shortcut-Send',
      driver,
    });
    expect(sendCommand).toBeTruthy();

    await executePerformShortcut({ driver, key: 'ESCAPE' });
  });

  it('should navigate to Bridge via Cmd+K', async () => {
    await executePerformShortcut({ driver, key: 'k' });

    await typeOnTextInput({
      id: 'command-k-input',
      driver,
      text: 'bridge',
    });

    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'bridge');

    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await checkExtensionURL(driver, 'home');
  });

  it('should navigate to QR Code via Cmd+K', async () => {
    await executePerformShortcut({ driver, key: 'k' });

    await typeOnTextInput({
      id: 'command-k-input',
      driver,
      text: 'qr',
    });

    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'qr-code');

    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await checkExtensionURL(driver, 'home');
  });

  it('should navigate to Connected Apps via Cmd+K', async () => {
    await executePerformShortcut({ driver, key: 'k' });

    await typeOnTextInput({
      id: 'command-k-input',
      driver,
      text: 'connected',
    });

    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'connected');

    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await checkExtensionURL(driver, 'home');
  });

  it('should search for tokens by name and validate token details page', async () => {
    await executePerformShortcut({ driver, key: 'k' });

    await typeOnTextInput({
      id: 'command-k-input',
      driver,
      text: 'ETH',
    });
    await delayTime('medium');

    const ethFound = await isElementFoundByText({
      text: 'Ethereum',
      driver,
    });
    expect(ethFound).toBe(true);

    await executePerformShortcut({ driver, key: 'ENTER' });

    await checkExtensionURL(driver, 'token-details');

    const sendButton = await findElementByText(driver, 'Send');
    expect(sendButton).toBeTruthy();

    const swapButton = await findElementByText(driver, 'Swap');
    expect(swapButton).toBeTruthy();

    const bridgeButton = await findElementByText(driver, 'Bridge');
    expect(bridgeButton).toBeTruthy();

    const balanceText = await findElementByText(driver, 'Balance');
    expect(balanceText).toBeTruthy();

    await driver.executeScript(
      'window.scrollTo(0, document.body.scrollHeight / 2);',
    );

    const priceElements = await isElementFoundByText({
      text: '1D',
      driver,
    });
    expect(priceElements).toBe(true);

    const aboutText = await findElementByText(driver, 'About');
    expect(aboutText).toBeTruthy();

    const ethereumText = await isElementFoundByText({
      text: 'Ethereum',
      driver,
    });
    expect(ethereumText).toBe(true);

    const ethSymbol = await isElementFoundByText({
      text: 'ETH',
      driver,
    });
    expect(ethSymbol).toBe(true);

    await driver.executeScript(
      'window.scrollTo(0, document.body.scrollHeight);',
    );

    const totalSupplyText = await isElementFoundByText({
      text: 'Total Supply',
      driver,
    });
    expect(totalSupplyText).toBe(true);

    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await checkExtensionURL(driver, 'home');
  });

  it('should handle keyboard navigation within Cmd+K menu', async () => {
    await executePerformShortcut({ driver, key: 'k' });

    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 3,
    });

    await executePerformShortcut({
      driver,
      key: 'ARROW_UP',
      timesToPress: 2,
    });

    await executePerformShortcut({ driver, key: 'ESCAPE' });
  });
});
