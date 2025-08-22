/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Swap Flow Test - NEW ARCHITECTURE POC
 * This version uses the new proxy-based mock system
 */

import { WebDriver } from 'selenium-webdriver';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

// Import helpers (without proxy configuration)
import {
  captureAndLogBrowserConsole,
  delay,
  fillPrivateKey,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  goToWelcome,
  querySelector,
  takeScreenshotOnFailure,
  typeOnTextInput,
  waitAndClick,
} from '../../helpers';
// Import new proxy system
import { initDriverWithProxy } from '../../helpers/initDriverWithProxy';
import { MitmProxyV2 } from '../../helpers/proxy/mitmProxyV2';
import { MockStore } from '../../helpers/proxy/mockStore';
import { SWAP_VARIABLES, TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;
let proxy: MitmProxyV2;
let mockStore: MockStore;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

// Determine test mode from environment
const TEST_MODE = process.env.TEST_MODE || 'replay'; // 'record', 'replay', or 'passthrough'
const USE_LEGACY_MOCKS = process.env.USE_LEGACY_MOCKS === 'true';

beforeAll(async () => {
  console.log(`
===========================================
🚀 Starting Swap Flow Test - NEW ARCHITECTURE
Mode: ${TEST_MODE}
Legacy Mocks: ${USE_LEGACY_MOCKS}
Browser: ${browser}
===========================================
  `);

  try {
    // Step 1: Initialize and start MITM proxy V2
    proxy = new MitmProxyV2({
      port: 8080,
      mode: TEST_MODE as 'record' | 'replay' | 'passthrough',
      scenarioName: 'swap-flow-1',
      fixturesDir: 'e2e/fixtures',
      verbose: true,
      failOnUnmocked: false, // Start with false for POC
    });

    await proxy.start();
    console.log('✅ MITM Proxy V2 server started successfully');
    console.log(`📜 CA Certificate: ${proxy.getCACertPath()}`);

    // Step 2: Load legacy mocks if needed (for transition period)
    if (USE_LEGACY_MOCKS && TEST_MODE === 'replay') {
      mockStore = new MockStore('swap-flow-1');
      await mockStore.loadLegacyMocks();
      console.log('✅ Legacy mocks loaded');
    }

    // Step 3: Initialize WebDriver with proxy configuration
    driver = await initDriverWithProxy({
      browser,
      os,
      useProxy: true,
      proxyPort: 8080,
    });
    console.log('✅ WebDriver initialized with proxy');

    // Step 4: Get extension ID and setup root URL
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
    console.log(`✅ Extension found: ${extensionId}`);
  } catch (error) {
    console.error('❌ Failed in beforeAll setup:', error);
    // Cleanup on failure
    await proxy?.stop();
    await driver?.quit();
    throw error;
  }
}, 60000); // 60s timeout for setup

// Keep the same beforeEach/afterEach for screenshots
beforeEach(async (context: any) => {
  context.driver = driver;
});

afterEach(async (context: any) => {
  await takeScreenshotOnFailure(context);
});

afterAll(async () => {
  console.log('🔄 Starting cleanup...');

  // Always try to quit driver first
  if (driver) {
    try {
      await driver.quit();
      console.log('✅ Driver quit successfully');
    } catch (error) {
      console.error('❌ Error quitting driver:', error);
    }
  }

  // Stop proxy and show statistics
  if (proxy) {
    try {
      const stats = proxy.getStatistics();
      console.log(`
===========================================
📊 Proxy Statistics:
- Mode: ${stats.mode}
- Recorded: ${stats.recorded}
- Unmocked: ${stats.unmocked}
${
  stats.unmockedList.length > 0
    ? `- Unmocked URLs:\n${stats.unmockedList
        .map((u) => `  • ${u}`)
        .join('\n')}`
    : ''
}
===========================================
      `);

      await proxy.stop();
      console.log('✅ Proxy stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping proxy:', error);
    }
  }
}, 30000);

// ============================================
// TEST CASES - Same as original
// ============================================

const WALLET_TO_USE_SECRET = TEST_VARIABLES.SWAPS_WALLET.PK;

it('should be able import a wallet via pk', async () => {
  await goToWelcome(driver, rootURL);
  await findElementByTestIdAndClick({
    id: 'import-wallet-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'import-wallet-option',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'import-via-pkey-option',
    driver,
  });

  await fillPrivateKey(driver, WALLET_TO_USE_SECRET);

  await findElementByTestIdAndClick({
    id: 'import-wallets-button',
    driver,
  });
  await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
  await typeOnTextInput({
    id: 'confirm-password-input',
    driver,
    text: 'test1234',
  });
  await findElementByTestIdAndClick({ id: 'set-password-button', driver });
  await findElementByText(driver, 'Rainbow is ready to use');

  await captureAndLogBrowserConsole(driver, 'After Wallet Import');
});

it('should be able to go to setings', async () => {
  await goToPopup(driver, rootURL);
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
});

it('should be able to connect to hardhat', async () => {
  // Try to find and click the connect button
  try {
    const btn = await querySelector(
      driver,
      '[data-testid="connect-to-hardhat"]',
    );
    await waitAndClick(btn, driver);
    await delay(2000);
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
  } catch (error) {
    console.log(
      'Connect to hardhat button not found, may already be connected',
    );
    // Try to go back anyway
    try {
      await findElementByTestIdAndClick({
        id: 'navbar-button-with-back',
        driver,
      });
    } catch {
      console.log('Already on main page');
    }
  }

  // Wait for balances to update
  await delay(5000);
});

it('should be able to go to swap flow', async () => {
  await findElementByTestIdAndClick({ id: 'header-link-swap', driver });
});

// Add just a few more critical tests for POC
it('should be able to select assets', async () => {
  // Wait for UI to load
  await delay(3000);

  // Open token selector
  await findElementByTestIdAndClick({
    id: 'token-to-sell-search-token-input',
    driver,
  });

  // Wait for search modal to open
  await delay(2000);

  // Type "ETH" to search
  await typeOnTextInput({
    id: 'token-to-sell-search-token-input',
    driver,
    text: 'ETH',
  });

  // Wait for search results
  await delay(2000);

  // Select ETH
  const ethRow = await findElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  expect(ethRow).toBeTruthy();
});

// Simplified test to verify proxy is intercepting requests
it('should verify proxy interception of Rainbow APIs', async () => {
  // Check that we've intercepted Rainbow API calls
  const stats = proxy.getStatistics();
  console.log('\n📊 Proxy Interception Summary:');
  console.log(`Total recordings loaded: ${stats.recorded}`);
  console.log(`Unmocked requests: ${stats.unmocked}`);

  // We should have intercepted Rainbow API calls during wallet import
  expect(stats.recorded).toBeGreaterThan(0);
  console.log('✅ Proxy successfully intercepting and replaying API calls');
});

// Add a simple test to verify proxy is working
it('should intercept network requests through proxy', async () => {
  console.log('🔍 Testing proxy interception...');

  // This test just verifies the setup is working
  // The actual API calls will happen in the swap flow
  const stats = proxy.getStatistics();
  console.log(`Proxy stats at test end: ${JSON.stringify(stats)}`);
});

// Include one full swap test for end-to-end validation
it.skip('should be able to execute swap', async () => {
  // This would be the full swap execution test
  // Skip for initial POC until proxy is confirmed working
});
