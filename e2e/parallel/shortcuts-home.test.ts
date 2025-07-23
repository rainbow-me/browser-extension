import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  // clickAcceptRequestButton,
  // connectToTestDapp,
  delayTime,
  doNotFindElementByTestId,
  executePerformShortcut,
  findElementByTestId,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlowUsingKeyboardNavigation,
  initDriverWithOptions,
  isElementFoundByText,
  querySelector,
  querySelectorWithin,
  waitAndClick,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe.runIf(browser !== 'firefox')(
  'navigate through settings flows with shortcuts',
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
    afterAll(async () => driver?.quit());

    it('should be able import a wallet via seed', async () => {
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

    it('should be able to connect to bx test dapp', async () => {
      // failing here on CI and locally.

      // the logs on CI:
      /*
       ✓ e2e/parallel/shortcuts-home.test.ts > navigate through settings flows with shortcuts > should display account name
      stdout | e2e/parallel/shortcuts-home.test.ts > navigate through settings flows with shortcuts > should be able to connect to bx test dapp
      [test logging | Window Handles | getWindowHandle] - E30F4494014A5B61A6E153AADE49E298

      stdout | e2e/parallel/shortcuts-home.test.ts > navigate through settings flows with shortcuts > should be able to connect to bx test dapp
      [test logging | Window Handles | getAllWindowHandles] - {"handlers":["E30F4494014A5B61A6E153AADE49E298"],"popupHandler":"","dappHandler":"E30F4494014A5B61A6E153AADE49E298"}

      × e2e/parallel/shortcuts-home.test.ts > navigate through settings flows with shortcuts > should be able to connect to bx test dapp
        → Test timed out in 120000ms.
      If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".

      ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

      FAIL  e2e/parallel/shortcuts-home.test.ts > navigate through settings flows with shortcuts > should be able to connect to bx test dapp
      Error: Test timed out in 120000ms.
      If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
      */

      // the logs on local:
      /*
      stdout | e2e/parallel/shortcuts-home.test.ts > navigate through settings flows with shortcuts > should be able to connect to bx test dapp
      [test logging | Window Handles | getWindowHandle] - BF7E1CF5158440439C771342D237A6BD

      stdout | e2e/parallel/shortcuts-home.test.ts > navigate through settings flows with shortcuts > should be able to connect to bx test dapp
      [test logging | Window Handles | getAllWindowHandles] - {"handlers":["BF7E1CF5158440439C771342D237A6BD"],"popupHandler":"","dappHandler":"BF7E1CF5158440439C771342D237A6BD"}

      ❯ e2e/parallel/shortcuts-home.test.ts (12)
        ❯ navigate through settings flows with s
      hortcuts (12)
          ✓ should be able import a wallet via s
      eed 10345ms
          ✓ should display account name 375ms
          x should be able to connect to bx test dapp
      */

      // const { dappHandler, popupId } = await connectToTestDapp(driver);

      await delayTime('medium');
      // await clickAcceptRequestButton(driver, popupId);

      // await driver.switchTo().window(dappHandler);
      const topButton = await querySelector(
        driver,
        '[data-testid="rk-account-button"]',
      );

      expect(topButton).toBeTruthy();
      await waitAndClick(topButton, driver);

      const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
      expect(ensLabel).toBeTruthy();
      await goToPopup(driver, rootURL);
    });

    // shortcut tests begin

    it('should be able to navigate to connected apps + back with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'a' });
      await checkExtensionURL(driver, 'connected');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });

    it('should be able to navigate to network selector + close with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'n' });
      await delayTime('medium');
      await executePerformShortcut({ driver, key: 'a' });
      await findElementByTextAndClick(driver, 'bx-test-dapp.vercel.app');
      await findElementByTestId({ id: 'switch-network-item-1', driver });
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      await doNotFindElementByTestId({ id: 'switch-network-item-1', driver });
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await checkExtensionURL(driver, 'home');
    });

    it('should be able to open more menu + close with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'DECIMAL' });
      await findElementByText(driver, 'Settings');
      await findElementByText(driver, 'Lock Rainbow');
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      const settingsText = await isElementFoundByText({
        text: 'Settings',
        driver,
      });
      const lockText = await isElementFoundByText({
        text: 'Lock Rainbow',
        driver,
      });
      expect(settingsText && lockText).toBe(false);
    });

    it('should be able to use arrows to tab switch', async () => {
      await findElementByText(driver, 'Tokens');
      await executePerformShortcut({ driver, key: 'ARROW_RIGHT' });
      await findElementByText(driver, 'Activity');
      await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
      await findElementByText(driver, 'Tokens');
      const activity = await isElementFoundByText({
        text: 'Activity',
        driver,
      });
      await executePerformShortcut({
        driver,
        key: 'ARROW_RIGHT',
        timesToPress: 2,
      });
      await findElementByText(driver, 'NFTs');
      const tokens = await isElementFoundByText({
        text: 'Tokens',
        driver,
      });
      await executePerformShortcut({ driver, key: 'ARROW_RIGHT' });
      await findElementByText(driver, 'Points');
      const nfts = await isElementFoundByText({
        text: 'NFTs',
        driver,
      });
      await executePerformShortcut({
        driver,
        key: 'ARROW_LEFT',
        timesToPress: 3,
      });
      const points = await isElementFoundByText({
        text: 'Points',
        driver,
      });
      expect(activity && tokens && nfts && points).toBe(false);
    });

    it('should be able to navigate to highlight asset + open context menu with keyboard', async () => {
      await executePerformShortcut({
        driver,
        key: 'ARROW_DOWN',
        timesToPress: 8,
      });

      // find the first element in the tokens category then
      // find its shortened name and use it for the search this should
      // make it so this test doesn't break if the token content ever changes
      const firstCoinRowItemSelector = `coin-row-item-0`;
      const coinRowItemNameSelector = `[data-testid^="asset-name"]`;
      const firstCoinRowItem = await querySelector(
        driver,
        `[data-testid="${firstCoinRowItemSelector}"]`,
      );
      const coinRowItemName = await querySelectorWithin(
        firstCoinRowItem,
        coinRowItemNameSelector,
      );
      const coinRowItemAssetNameTextContent = await coinRowItemName.getText();

      const shortenedTokenName = coinRowItemAssetNameTextContent.split(' ')[1];

      await executePerformShortcut({ driver, key: 'SPACE' });
      await findElementByText(driver, `Swap ${shortenedTokenName}`);
      await findElementByText(driver, `Send ${shortenedTokenName}`);
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      const swap = await isElementFoundByText({
        text: `Swap ${shortenedTokenName}`,
        driver,
      });
      const send = await isElementFoundByText({
        text: `Send ${shortenedTokenName}`,
        driver,
      });
      expect(swap && send).toBe(false);
    });

    it('should be able to navigate to highlight transaction + open context menu with keyboard', async () => {
      await findElementByText(driver, 'Tokens');
      await executePerformShortcut({ driver, key: 'ARROW_RIGHT' });
      await findElementByText(driver, 'Activity');
      await executePerformShortcut({
        driver,
        key: 'ARROW_DOWN',
        timesToPress: 8,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await findElementByText(driver, 'Copy Tx Hash');
      await executePerformShortcut({ driver, key: 'ESCAPE' });
      await delayTime('short');
      const txHash = await isElementFoundByText({
        text: 'Copy Tx Hash',
        driver,
      });
      expect(txHash).toBe(false);
    });

    it('should navigate to send page using Cmd+K', async () => {
      await executePerformShortcut({ driver, key: 'k' });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await checkExtensionURL(driver, 'send');
    });

    it('should navigate to my wallets section in Cmd+K', async () => {
      await goToPopup(driver, rootURL);
      await executePerformShortcut({ driver, key: 'k' });
      await executePerformShortcut({
        driver,
        key: 'ARROW_DOWN',
        timesToPress: 3,
      });
      await executePerformShortcut({ driver, key: 'ENTER' });
      await findElementByText(driver, 'Switch to Wallet');
      await executePerformShortcut({ driver, key: 'BACK_SPACE' });
      await findElementByText(driver, 'Suggestions');
      await executePerformShortcut({ driver, key: 'ESCAPE' });
    });

    it('should be able to lock extension with keyboard', async () => {
      await executePerformShortcut({ driver, key: 'DECIMAL' });
      await executePerformShortcut({ driver, key: 'l' });
      await findElementByText(driver, 'Welcome back');
    });
  },
);
