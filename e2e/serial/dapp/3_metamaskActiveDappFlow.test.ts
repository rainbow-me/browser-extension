import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementByTestIdAndClick,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  getWindowHandle,
  importWalletFlow,
  initDriverWithOptions,
  querySelector,
  typeOnTextInput,
  untilDocumentLoaded,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rainbowUrl = getRootUrl();
let metamaskUrl = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('MetaMask active dApp flow', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
      metamask: true,
    });
    const rainbowExtensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!rainbowExtensionId) throw new Error('Rainbow Extension not found');
    rainbowUrl += rainbowExtensionId;
    const metamaskExtensionId = await getExtensionIdByName(driver, 'MetaMask');
    if (!metamaskExtensionId) throw new Error('MetaMask Extension not found');
    metamaskUrl += metamaskExtensionId;
  });

  afterAll(() => driver.quit());

  it('should be able open rainbow and import a wallet via private key', async () => {
    await importWalletFlow(
      driver,
      rainbowUrl,
      TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET,
    );

    // TO DO: remove when default provider mode is fixed
    await driver.get(rainbowUrl + '/popup.html#/home');
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
    await findElementByTestIdAndClick({
      id: 'set-rainbow-default-toggle',
      driver,
    });
  });

  it('should be able open metamask and import a wallet via private key', async () => {
    const [, metamaskHandle] = await driver.getAllWindowHandles();
    await driver.switchTo().window(metamaskHandle);
    await driver.get(metamaskUrl + '/home.html#onboarding/welcome');
    await driver.wait(untilDocumentLoaded(), 5_000);

    // Welcome screen
    await findElementByTestIdAndClick({
      id: 'onboarding-terms-checkbox',
      driver,
    });
    await findElementByTextAndClick(driver, 'Create a new wallet');

    // Analytics screen
    await findElementByTextAndClick(driver, 'No thanks');

    // Create password
    await typeOnTextInput({
      id: 'create-password-new',
      driver,
      text: 'test1234',
    });
    await typeOnTextInput({
      id: 'create-password-confirm',
      driver,
      text: 'test1234',
    });
    await findElementByTestIdAndClick({ driver, id: 'create-password-terms' });
    await findElementByTextAndClick(driver, 'Create a new wallet');

    // Secure your wallet
    await findElementByTextAndClick(
      driver,
      'Remind me later (not recommended)',
    );

    // Alert
    await findElementByTextAndClick(
      driver,
      'I understand that until I back up my Secret Recovery Phrase, I may lose my accounts and all of their assets.',
    );
    await findElementByTestIdAndClick({ driver, id: 'skip-srp-backup' });

    // Wallet creation successful
    await findElementByTextAndClick(driver, 'Got it!');
    await findElementByTextAndClick(driver, 'Next');
    await findElementByTextAndClick(driver, 'Done');
  });

  it('should be able to connect to bx test dapp with metamask', async () => {
    // Open New Tab
    await driver.switchTo().newWindow('tab');
    await driver.get('https://rainbowkit-example.vercel.app/');
    await driver.wait(untilDocumentLoaded(), 20_000);
    const dappHandle = await getWindowHandle({ driver });

    // RainbowKit
    const button = await findElementByText(driver, 'Connect Wallet');
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    const modalTitle = await findElementByText(driver, 'Connect a Wallet');
    expect(modalTitle).toBeTruthy();

    const mmButton = await querySelector(
      driver,
      '[data-testid="rk-wallet-option-metaMask"]',
    );
    await waitAndClick(mmButton, driver);

    // Wait for popup launch
    await delayTime('long');
    const popupHandle = (await driver.getAllWindowHandles()).pop() as string;
    await driver.switchTo().window(popupHandle);
    await driver.wait(untilDocumentLoaded(), 20_000);

    // Connect Prompt
    await findElementByTextAndClick(driver, 'Next');
    await delayTime('long');
    await findElementByTestIdAndClick({
      driver,
      id: 'page-container-footer-next',
    });

    await delayTime('long');
    await driver.switchTo().window(dappHandle);

    // Validate RainbowKit Connect
    const topButton = await querySelector(
      driver,
      '[data-testid="rk-account-button"]',
    );
    expect(topButton).toBeTruthy();

    // Disconnect from dApp
    await findElementByTestIdAndClick({ driver, id: 'rk-account-button' });
    await findElementByTestIdAndClick({ driver, id: 'rk-disconnect-button' });
  });

  it('should be able to connect to bx test dapp with rainbow', async () => {
    // Open New Tab
    await driver.switchTo().newWindow('tab');
    await driver.get(
      'https://rainbowkit-example-git-daniel-rainbow-providers-rainbowdotme.vercel.app/',
    );
    await driver.wait(untilDocumentLoaded(), 20_000);
    const dappHandle = await getWindowHandle({ driver });

    // RainbowKit
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

    // Wait for popup launch
    await delayTime('long');
    const popupHandle = (await driver.getAllWindowHandles()).pop() as string;
    await driver.switchTo().window(popupHandle);
    await driver.wait(untilDocumentLoaded(), 20_000);

    // Connect Prompt
    await findElementByTestIdAndClick({ id: 'accept-request-button', driver });

    await delayTime('long');
    await driver.switchTo().window(dappHandle);

    // Validate RainbowKit Connect
    const topButton = await querySelector(
      driver,
      '[data-testid="rk-account-button"]',
    );
    expect(topButton).toBeTruthy();

    // Disconnect from dApp
    await findElementByTestIdAndClick({ driver, id: 'rk-account-button' });
    await findElementByTestIdAndClick({ driver, id: 'rk-disconnect-button' });
  });
});
