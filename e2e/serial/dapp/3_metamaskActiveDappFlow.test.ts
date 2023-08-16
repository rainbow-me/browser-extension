import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, it } from 'vitest';

import {
  findElementByTestIdAndClick,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlow,
  initDriverWithOptions,
  typeOnTextInput,
  untilDocumentLoaded,
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
  });

  it('should be able open metamask and import a wallet via private key', async () => {
    const [, metamaskHandler] = await driver.getAllWindowHandles();
    await driver.switchTo().window(metamaskHandler);
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
});
