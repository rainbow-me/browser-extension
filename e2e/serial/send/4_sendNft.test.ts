import 'chromedriver';
import 'geckodriver';
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
  doNotFindElementByTestId,
  findElementById,
  findElementByIdAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  querySelector,
  shortenAddress,
  takeScreenshotOnFailure,
  transactionStatus,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe.runIf(browser !== 'firefox')(
  'should be able to perform the nft send flow',
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    beforeEach(async (context: any) => {
      context.driver = driver;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterEach(async (context: any) => {
      await takeScreenshotOnFailure(context);
    });

    afterAll(() => driver.quit());

    it('should be able import a wallet via pk', async () => {
      await importWalletFlow(driver, rootURL, TEST_VARIABLES.SEED_WALLET.PK);
    });

    it('should be able import a second wallet via pk then switch back to wallet 1', async () => {
      await importWalletFlow(
        driver,
        rootURL,
        TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET,
        true,
      );
      await findElementByIdAndClick({
        id: 'header-account-name-shuffle',
        driver,
      });
      await findElementByTestIdAndClick({ id: 'wallet-account-1', driver });
      const accountName = await findElementById({
        id: 'header-account-name-shuffle',
        driver,
      });
      expect(await accountName.getText()).toBe(
        shortenAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS),
      );
    });

    it('should be able to go to settings', async () => {
      await goToPopup(driver, rootURL);
      await findElementByTestIdAndClick({
        id: 'home-page-header-right',
        driver,
      });
      await findElementByTestIdAndClick({ id: 'settings-link', driver });
    });

    it('should be able to connect to hardhat and go to send flow', async () => {
      const btn = await querySelector(
        driver,
        '[data-testid="connect-to-hardhat"]',
      );
      await waitAndClick(btn, driver);
      const button = await findElementByText(driver, 'Disconnect from Hardhat');
      expect(button).toBeTruthy();
      await findElementByTestIdAndClick({
        id: 'navbar-button-with-back',
        driver,
      });
    });

    it('should be able to filter nfts and make selection on send flow', async () => {
      await findElementByTestIdAndClick({ id: 'bottom-tab-nfts', driver });
      await delayTime('very-long');
      await delayTime('very-long');
      await findElementByTestIdAndClick({ id: 'header-link-send', driver });
      const input = await findElementByTestId({
        id: 'to-address-input',
        driver,
      });
      await input.sendKeys('rainbowwallet.eth');

      await findElementByTestIdAndClick({
        id: 'input-wrapper-dropdown-token-input',
        driver,
      });
      const assetInput = await findElementByTestId({
        id: 'token-input',
        driver,
      });
      await assetInput.click();
      await assetInput.sendKeys('treasures');
      const treasuresSection = await findElementByTestId({
        id: 'nfts-collection-section-The Treasures of Ancient Egypt Official',
        driver,
      });
      const learnWeb3Badges = await doNotFindElementByTestId({
        id: 'nfts-collection-section-LearnWeb3 Badges',
        driver,
      });
      expect(treasuresSection).toBeTruthy();
      expect(learnWeb3Badges).toBeFalsy();

      await treasuresSection.click();
      await findElementByTextAndClick(driver, '#5602');
    });

    it('should be able to go to review on send flow', async () => {
      await findElementByTestIdAndClick({ id: 'send-review-button', driver });
    });

    it('should be able to send transaction on review on send flow', async () => {
      await findElementByTestIdAndClick({
        id: 'review-confirm-button',
        driver,
      });
      const sendTransaction = await transactionStatus();
      expect(await sendTransaction).toBe('success');
    });
  },
);
