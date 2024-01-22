import 'chromedriver';
import 'geckodriver';

import { WebDriver } from 'selenium-webdriver';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

import {
  checkExtensionURL,
  delayTime,
  executePerformShortcut,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  findElementByTextAndClick,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
  navigateToSettingsNetworks,
  takeScreenshotOnFailure,
  typeOnTextInput,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

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

afterAll(() => driver.quit());

it('should be able import a wallet via pk', async () => {
  await importWalletFlow(driver, rootURL, TEST_VARIABLES.SEED_WALLET.PK);
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
});

it('should be able to naviagate to network settings', async () => {
  await navigateToSettingsNetworks(driver, rootURL);
  await checkExtensionURL(driver, 'networks');
});

it('should be able to add an auto-complete network', async () => {
  await findElementByTestIdAndClick({ driver, id: 'custom-chain-link' });
  await checkExtensionURL(driver, 'custom-chain');
  await findElementByTestIdAndClick({ driver, id: 'network-name-field' });
  await findElementByTextAndClick(driver, 'Avalanche');
  const symbol = await findElementByTestId({
    id: 'custom-network-symbol',
    driver,
  });
  const symbolValue = await symbol.getAttribute('value');
  expect(symbolValue).toContain('AVAX');

  // needs a couple seconds to validate the custom RPC
  await delayTime('very-long');

  await findElementByTestIdAndClick({
    driver,
    id: 'add-custom-network-button',
  });
  const avaxChain = await findElementByTestId({
    id: 'network-row-43114',
    driver,
  });
  expect(avaxChain).toBeTruthy();
});

it('should be able to add a custom network', async () => {
  await findElementByTestIdAndClick({ driver, id: 'custom-chain-link' });
  await checkExtensionURL(driver, 'custom-chain');
  await findElementByTestIdAndClick({ driver, id: 'network-name-field' });

  // fill out custom network form
  await typeOnTextInput({ text: 'Cronos Mainnet', driver });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({ text: 'https://cronos-evm.publicnode.com', driver });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({ text: 'CRO', driver });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({ text: 'https://explorer.cronos.org/', driver });

  // needs a couple seconds to validate the custom RPC
  await delayTime('very-long');

  await findElementByTestIdAndClick({
    driver,
    id: 'add-custom-network-button',
  });

  const fujiChain = await findElementByTestId({
    id: 'network-row-25',
    driver,
  });
  expect(fujiChain).toBeTruthy();
});

it('should be able to add a custom testnet network', async () => {
  await findElementByTestIdAndClick({ driver, id: 'custom-chain-link' });
  await checkExtensionURL(driver, 'custom-chain');
  await findElementByTestIdAndClick({ driver, id: 'network-name-field' });

  // fill out custom network form
  await typeOnTextInput({ text: 'Fuji Testnet (Avax)', driver });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({
    text: 'https://api.avax-test.network/ext/bc/C/rpc',
    driver,
  });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({ text: 'AVAX', driver });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({ text: 'https://subnets-test.avax.network/', driver });
  await findElementByTestIdAndClick({ driver, id: 'testnet-toggle' });

  // needs a couple seconds to validate the custom RPC
  await delayTime('very-long');

  await findElementByTestIdAndClick({
    driver,
    id: 'add-custom-network-button',
  });

  const cronosChain = await findElementByTestId({
    id: 'network-row-43113',
    driver,
  });
  expect(cronosChain).toBeTruthy();
});

it('should be able to add a custom ETH RPC and switch to it', async () => {
  await findElementByTestIdAndClick({ driver, id: 'network-row-1' });
  await checkExtensionURL(driver, 'rpcs');

  await findElementByTestIdAndClick({ driver, id: 'custom-rpc-button' });

  // fill out custom network form
  await findElementByTestIdAndClick({ driver, id: 'network-name-field' });
  await typeOnTextInput({ text: 'Mainnet (Ankr)', driver });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({
    text: 'https://rpc.ankr.com/eth',
    driver,
  });

  // needs a couple seconds to validate the custom RPC
  await delayTime('very-long');

  await findElementByTestIdAndClick({
    driver,
    id: 'add-custom-network-button',
  });

  await findElementByTestIdAndClick({ id: 'rpc-row-item-1', driver });

  const activeRPC = await findElementByTestId({ id: 'rpc-row-item-1', driver });

  expect(await activeRPC.getText()).toContain('Active');
});

it('should be able to add a custom token', async () => {
  await delayTime('medium');
  await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
  await findElementByTestIdAndClick({ driver, id: 'network-row-25' });
  await findElementByTestIdAndClick({ driver, id: 'custom-token-link' });
  await checkExtensionURL(driver, 'custom-chain/details');

  // fill out custom token
  await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
  await typeOnTextInput({
    text: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
    driver,
  });

  // needs a couple seconds to validate
  await delayTime('medium');

  const tokenName = await findElementByTestId({
    id: 'token-name-field',
    driver,
  });

  expect(await tokenName.getAttribute('value')).toBe('Wrapped CRO');

  await executePerformShortcut({ driver, key: 'TAB', timesToPress: 4 });
  await executePerformShortcut({ driver, key: 'ENTER' });
  const customTokenSection = await findElementByTestId({
    id: 'custom-token-section',
    driver,
  });
  expect(customTokenSection).toBeTruthy();
});
