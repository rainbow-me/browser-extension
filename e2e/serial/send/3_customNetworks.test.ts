import { WebDriver } from 'selenium-webdriver';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

import {
  checkExtensionURL,
  delayTime,
  executePerformShortcut,
  findElementByTestId,
  findElementByTestIdAndClick,
  getExtensionIdByName,
  getRootUrl,
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

afterAll(() => driver?.quit());

it('should be able import a wallet via pk', async () => {
  await importWalletFlow(driver, rootURL, TEST_VARIABLES.SEED_WALLET.PK);
});

it('should be able to naviagate to network settings', async () => {
  await navigateToSettingsNetworks(driver, rootURL);
  await checkExtensionURL(driver, 'networks');
});

it('should be able to search and filter networks', async () => {
  await findElementByTestIdAndClick({ driver, id: 'custom-chain-link' });
  await checkExtensionURL(driver, 'custom-networks');

  // Test search functionality
  await typeOnTextInput({
    text: 'Arbitrum',
    driver,
    id: 'search-networks-input',
  });
  await delayTime('medium');

  // Should show Arbitrum networks
  const arbitrumNova = await findElementByTestId({
    id: 'custom-network-42170',
    driver,
  });
  expect(arbitrumNova).toBeTruthy();

  // Test no results scenario
  const searchInput = await findElementByTestId({
    id: 'search-networks-input',
    driver,
  });
  await searchInput.clear();
  await typeOnTextInput({
    text: 'nonexistentnetwork',
    driver,
    id: 'search-networks-input',
  });
  await delayTime('medium');

  // Should show no results message and manual form link
  const noResults = await findElementByTestId({
    id: 'no-networks-found',
    driver,
  });
  expect(noResults).toBeTruthy();

  const manualLink = await findElementByTestId({
    id: 'add-custom-network-manual',
    driver,
  });
  expect(manualLink).toBeTruthy();

  // Clear search and go back to full list
  await searchInput.clear();
  await delayTime('medium');
});

it('should be able to navigate from list to manual form', async () => {
  // Click on the manual form link
  await checkExtensionURL(driver, 'custom-networks');
  await findElementByTestIdAndClick({
    driver,
    id: 'add-custom-network-manual',
  });

  // Should navigate to the manual form
  await checkExtensionURL(driver, 'custom-chain');

  // Navigate back to continue with other tests
  await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
  await checkExtensionURL(driver, 'custom-networks');
});

it('should be able to add a custom network', async () => {
  await findElementByTestIdAndClick({
    driver,
    id: 'add-custom-network-manual',
  });
  await checkExtensionURL(driver, 'custom-chain');
  await findElementByTestIdAndClick({ driver, id: 'network-name-field' });

  // fill out custom network form
  await typeOnTextInput({ text: 'Cronos Mainnet', driver });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({ text: 'https://evm.cronos.org', driver });
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

  await delayTime('very-long');

  const cronos = await findElementByTestId({
    id: 'network-row-25',
    driver,
  });
  expect(cronos).toBeTruthy();

  await delayTime('long'); // wait for confirm toast to disappear
});

it('should be able to add a custom testnet network', async () => {
  await findElementByTestIdAndClick({ driver, id: 'custom-chain-link' });
  await checkExtensionURL(driver, 'custom-networks');
  await findElementByTestIdAndClick({
    driver,
    id: 'add-custom-network-manual',
  });
  await checkExtensionURL(driver, 'custom-chain');
  await findElementByTestIdAndClick({ driver, id: 'network-name-field' });

  // fill out custom network form
  await typeOnTextInput({ text: 'Cronos Testnet', driver });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({
    text: 'https://evm-t3.cronos.org',
    driver,
  });
  await executePerformShortcut({ driver, key: 'TAB' });
  await typeOnTextInput({ text: 'TCRO', driver });
  await findElementByTestIdAndClick({ driver, id: 'testnet-toggle' });

  // needs a couple seconds to validate the custom RPC
  await delayTime('very-long');

  await findElementByTestIdAndClick({
    driver,
    id: 'add-custom-network-button',
  });

  await delayTime('very-long');

  const cronosTestnet = await findElementByTestId({
    id: 'network-row-338',
    driver,
  });
  expect(cronosTestnet).toBeTruthy();

  await delayTime('long'); // wait for confirm toast to disappear
});

it('should be able to add a known custom network from list', async () => {
  await findElementByTestIdAndClick({ driver, id: 'custom-chain-link' });
  await checkExtensionURL(driver, 'custom-networks');

  // Search for Arbitrum Nova
  await typeOnTextInput({
    text: 'Arbitrum Nova',
    driver,
    id: 'search-networks-input',
  });
  await delayTime('medium');

  // Click on Arbitrum Nova network directly from the list
  await findElementByTestIdAndClick({ driver, id: 'custom-network-42170' });

  // Should navigate back to networks page after adding
  await checkExtensionURL(driver, 'networks');

  // Verify the network was added
  const novaChain = await findElementByTestId({
    id: 'network-row-42170',
    driver,
  });
  expect(novaChain).toBeTruthy();

  await delayTime('very-long'); // wait for confirm toast to disappear
});

it('should be able to add a custom ETH RPC and switch to it', async () => {
  await findElementByTestIdAndClick({ driver, id: 'network-row-1' });
  await checkExtensionURL(driver, 'rpcs');

  await findElementByTestIdAndClick({ driver, id: 'custom-rpc-button' });
  await checkExtensionURL(driver, 'custom-chain');

  // sometimes certain RPCs can fail to validate, adding a fallback
  try {
    // RPC URL
    await findElementByTestIdAndClick({ driver, id: 'custom-network-rpc-url' });
    await typeOnTextInput({
      text: 'https://eth.llamarpc.com',
      driver,
    });

    // needs a couple seconds to validate the custom RPC
    await delayTime('very-long');
    await findElementByTestIdAndClick({
      driver,
      id: 'add-custom-network-button',
    });

    // this will fail if the RPC URL is not valid
    await findElementByTestIdAndClick({ id: 'rpc-row-item-1', driver });
  } catch {
    // RPC URL
    await findElementByTestIdAndClick({ driver, id: 'custom-network-rpc-url' });

    // clear the input
    await executePerformShortcut({
      driver,
      key: 'ARROW_RIGHT',
      timesToPress: 10,
    });
    await executePerformShortcut({
      driver,
      key: 'BACK_SPACE',
      timesToPress: 30,
    });
    await typeOnTextInput({
      text: 'https://eth.drpc.org',
      driver,
    });

    // needs a couple seconds to validate the custom RPC
    await delayTime('very-long');

    await findElementByTestIdAndClick({
      driver,
      id: 'add-custom-network-button',
    });
    await findElementByTestIdAndClick({ id: 'rpc-row-item-1', driver });
  }

  await delayTime('long');

  const activeRPC = await findElementByTestId({ id: 'rpc-row-item-1', driver });

  expect(await activeRPC.getText()).toContain('Active');
});

it('should be able to add a custom token', async () => {
  await delayTime('very-long');
  await executePerformShortcut({ driver, key: 'ARROW_LEFT' });
  await delayTime('very-long');
  await findElementByTestIdAndClick({ driver, id: 'network-row-25' });
  await findElementByTestIdAndClick({ driver, id: 'custom-token-link' });
  await checkExtensionURL(driver, 'custom-chain/details');

  // needs a couple of seconds to navigate
  await delayTime('very-long');

  // fill out custom token
  await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
  await typeOnTextInput({
    text: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
    driver,
  });

  // needs a couple seconds to validate
  await delayTime('very-long');
  await delayTime('very-long');

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
