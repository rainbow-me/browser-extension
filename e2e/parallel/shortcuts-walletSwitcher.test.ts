import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  delayTime,
  executePerformShortcut,
  findElementById,
  findElementByTestId,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  importWalletFlowUsingKeyboardNavigation,
  initDriverWithOptions,
  isElementFoundByText,
  returnAttributesOfActiveElement,
  shortenAddress,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

const shortenedMainAddress = shortenAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS);
const shortenedSecondaryAddress = shortenAddress(
  TEST_VARIABLES.EMPTY_WALLET.ADDRESS,
);

describe.runIf(browser !== 'firefox')(
  'navigate through wallet switcher flows with shortcuts and keyboard',
  () => {
    beforeAll(async () => {
      driver = await initDriverWithOptions({
        browser,
        os,
      });
      const extensionId = await getExtensionIdByName(driver, 'Rainbow');
      if (!extensionId) throw new Error('Extension not found');
      rootURL += extensionId;
    });
    afterAll(async () => driver.quit());

    it('should be able import a wallet via pk', async () => {
      await importWalletFlowUsingKeyboardNavigation(
        driver,
        rootURL,
        TEST_VARIABLES.SEED_WALLET.PK,
      );
    });

    it('should display account name', async () => {
      await checkWalletName(
        driver,
        rootURL,
        TEST_VARIABLES.SEED_WALLET.ADDRESS,
      );
    });

    it('should be able import a wallet via pk', async () => {
      await importWalletFlowUsingKeyboardNavigation(
        driver,
        rootURL,
        TEST_VARIABLES.EMPTY_WALLET.PK,
        true,
      );
    });

    it('should display account name', async () => {
      await checkWalletName(
        driver,
        rootURL,
        TEST_VARIABLES.EMPTY_WALLET.ADDRESS,
      );
    });

    it('navigate to wallet switcher with tab/arrows', async () => {
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'wallet-switcher');
      // need this to unfocus search field on slow running tests
      await findElementByTextAndClick(driver, 'wallets');
      await executePerformShortcut({ driver, key: 'ESCAPE' });
    });

    it('navigate to wallet switcher with shortcut', async () => {
      await executePerformShortcut({ driver, key: 'w' });
      await checkExtensionURL(driver, 'wallet-switcher');
    });

    it('select search bar with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
      await delayTime('long');
      const placeholder = await returnAttributesOfActiveElement(
        driver,
        'placeholder',
      );
      expect(placeholder).toBe('Search wallets');
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      await executePerformShortcut({ driver, key: 'w' });
    });

    it('select wallet with number keys', async () => {
      const walletAccount1Content = await findElementByTestId({
        driver,
        id: 'wallet-account-1',
      });

      const walletAccount1Name = (await walletAccount1Content.getText()).split(
        '\n',
      );
      expect(walletAccount1Name[1]).toBe(shortenedMainAddress);
      const walletAccount2Content = await findElementByTestId({
        driver,
        id: 'wallet-account-2',
      });

      const walletAccount2Name = (await walletAccount2Content.getText()).split(
        '\n',
      );
      expect(walletAccount2Name[1]).toBe(shortenedSecondaryAddress);
      await executePerformShortcut({ driver, key: '2' });
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      const activeWallet = await findElementById({
        id: 'header-account-name-shuffle',
        driver,
      });
      expect(await activeWallet.getText()).toBe(walletAccount2Name[1]);
    });

    it('select wallet with keyboard navigation + ENTER', async () => {
      await executePerformShortcut({ driver, key: 'w' });
      await checkExtensionURL(driver, 'wallet-switcher');
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
      const walletAccount1Content = await findElementByTestId({
        driver,
        id: 'wallet-account-1',
      });

      const walletAccount1Name = (await walletAccount1Content.getText()).split(
        '\n',
      );
      await executePerformShortcut({ driver, key: 'ENTER' });
      expect(walletAccount1Name[1]).toBe(shortenedMainAddress);
    });

    // bug currently on this flow. will un-skip once its fixed.
    it.skip('open wallet context menu with navigation + SPACE (Broken)', async () => {
      await executePerformShortcut({ driver, key: 'w' });
      await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
      await executePerformShortcut({ driver, key: 'SPACE' });
      await findElementByText(driver, 'Rename Wallet');
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      const renameWallet = await isElementFoundByText({
        text: 'Rename Wallet',
        driver,
      });
      expect(renameWallet).toBe(false);
    });
  },
);
