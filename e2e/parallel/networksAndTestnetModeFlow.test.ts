import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ChainId } from '~/core/types/chains';

import {
  clickAcceptRequestButton,
  delayTime,
  doNotFindElementByTestId,
  executePerformShortcut,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getAllWindowHandles,
  getExtensionIdByName,
  getRootUrl,
  getWindowHandle,
  goBackTwice,
  goToPopup,
  goToTestApp,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettingsNetworks,
  querySelector,
  waitAndClick,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Networks & Testnet Mode flows', () => {
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

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should be able to toggle developer tools', async () => {
    await navigateToSettingsNetworks(driver, rootURL);
    await delayTime('short');

    await findElementByTestIdAndClick({
      driver,
      id: 'developer-tools-toggle',
    });
  });

  it('should be able to connect to bx test dapp', async () => {
    console.log('-- 1');
    await delayTime('long');
    console.log('-- 2');
    await goToTestApp(driver);
    console.log('-- 3');
    const dappHandler = await getWindowHandle({ driver });

    console.log('-- 4');
    const button = await findElementByText(driver, 'Connect Wallet');
    console.log('-- 5');
    expect(button).toBeTruthy();
    console.log('-- 6');
    await waitAndClick(button, driver);

    console.log('-- 7');
    const modalTitle = await findElementByText(driver, 'Connect a Wallet');
    console.log('-- 8');
    expect(modalTitle).toBeTruthy();

    console.log('-- 9');
    const mmButton = await querySelector(
      driver,
      '[data-testid="rk-wallet-option-rainbow"]',
    );
    console.log('-- 10');
    await waitAndClick(mmButton, driver);

    await delayTime('very-long');

    console.log('-- 11');
    const { popupHandler } = await getAllWindowHandles({
      driver,
      dappHandler,
    });

    console.log('-- 12 dappHandler, popupHandler', dappHandler, popupHandler);
    await driver.switchTo().window(popupHandler);

    console.log('-- 13');
    await clickAcceptRequestButton(driver);

    console.log('-- 14');
    await driver.switchTo().window(dappHandler);
    console.log('-- 15');
    const topButton = await querySelector(
      driver,
      '[data-testid="rk-account-button"]',
    );

    console.log('-- 16');
    expect(topButton).toBeTruthy();
    console.log('-- 17');
    await waitAndClick(topButton, driver);

    console.log('-- 18');
    const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
    console.log('-- 19');
    expect(ensLabel).toBeTruthy();
    console.log('-- 20');
    await goToPopup(driver, rootURL, '#/home');
    console.log('-- 21');
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
      id: `switch-network-item-${ChainId['optimism-goerli']}`,
      driver,
    });
    expect(foundOptimism).toBeTruthy();
  });
});
