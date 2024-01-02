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

import { ChainId } from '~/core/types/chains';

import {
  clickAcceptRequestButton,
  connectToTestDapp,
  delayTime,
  doNotFindElementByTestId,
  executePerformShortcut,
  findElementByTestId,
  findElementByTestIdAndClick,
  getExtensionIdByName,
  getRootUrl,
  goBackTwice,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettingsNetworks,
  querySelector,
  takeScreenshotOnFailure,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe.runIf(browser !== 'firefox')('Networks & Testnet Mode flows', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });
  afterAll(async () => await driver.quit());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
  });

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should be able to connect to bx test dapp', async () => {
    const { dappHandler } = await connectToTestDapp(driver);

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
    await goToPopup(driver, rootURL, '#/home');
  });

  it('should be able to toggle developer tools', async () => {
    await navigateToSettingsNetworks(driver, rootURL);
    await delayTime('short');

    await findElementByTestIdAndClick({
      driver,
      id: 'developer-tools-toggle',
    });

    await goBackTwice(driver);
  });

  it('should enable and disable testnet mode clicking testnet mode in menu', async () => {
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'testnet-mode', driver });
    await delayTime('medium');
    const testnetBar = await findElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar).toBeTruthy();
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'testnet-mode', driver });
    await delayTime('medium');
    const testnetBar2 = await doNotFindElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar2).toBeFalsy();
  });

  it('should disable testnet mode with shortcut', async () => {
    await executePerformShortcut({ driver, key: 't' });
    await delayTime('medium');
    const testnetBar = await findElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar).toBeTruthy();
    await executePerformShortcut({ driver, key: 't' });
    await delayTime('medium');
    const testnetBar2 = await doNotFindElementByTestId({
      driver,
      id: 'testnet-bar',
    });
    expect(testnetBar2).toBeFalsy();
  });

  it('should go to networks setting and disable ethereum networks', async () => {
    await navigateToSettingsNetworks(driver, rootURL);
    await findElementByTestIdAndClick({
      driver,
      id: `network-row-${ChainId.mainnet}`,
    });
    await findElementByTestIdAndClick({
      driver,
      id: `disable-network-toggle`,
    });
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
  });

  it('should go back to home and check ethereum networks are not available in dapp menu', async () => {
    await goBackTwice(driver);
    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'switch-networks-app-interation-item',
      driver,
    });
    const foundEthereum = await doNotFindElementByTestId({
      id: `switch-network-item-${ChainId.mainnet}`,
      driver,
    });
    expect(foundEthereum).toBeFalsy();
    const foundOptimism = await doNotFindElementByTestId({
      id: `switch-network-item-${ChainId.optimism}`,
      driver,
    });
    expect(foundOptimism).toBeTruthy();
  });

  it('should enable testnet mode and check testnet available networks', async () => {
    await executePerformShortcut({ driver, key: 't' });
    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'switch-networks-app-interation-item',
      driver,
    });
    const foundEthereum = await doNotFindElementByTestId({
      id: `switch-network-item-${ChainId.sepolia}`,
      driver,
    });
    expect(foundEthereum).toBeFalsy();
    const foundOptimism = await doNotFindElementByTestId({
      id: `switch-network-item-${ChainId.optimismGoerli}`,
      driver,
    });
    expect(foundOptimism).toBeTruthy();
  });
});
