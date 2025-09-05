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

import { TEST_VARIABLES } from 'e2e/walletVariables';

import { PerformanceCollector } from '../../scripts/perf/collect';
import {
  getExtensionIdByName,
  getRootUrl,
  goToWelcome,
  importWalletFlow,
  initDriverWithOptions,
  takeScreenshotOnFailure,
} from '../helpers';

let rootURL = getRootUrl();
let driver: WebDriver;
let collector: PerformanceCollector;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Wallet Flow Performance Tests', () => {
  beforeAll(async () => {
    try {
      console.log(`Initializing driver for ${browser} on ${os}...`);
      driver = await initDriverWithOptions({
        browser,
        os,
      });
      console.log('Driver initialized successfully');

      const extensionId = await getExtensionIdByName(driver, 'Rainbow');
      if (!extensionId) throw new Error('Extension not found');
      rootURL += extensionId;
      console.log(`Extension found with ID: ${extensionId}`);

      collector = new PerformanceCollector(driver, browser);
    } catch (error) {
      console.error('Failed to initialize test:', error);
      throw error;
    }
  });

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
  });

  afterAll(async () => {
    // Save metrics if collector was initialized
    if (collector) {
      try {
        await collector.saveMetrics('perf-wallet-flow.json');
      } catch (e) {
        console.error('Failed to save metrics:', e);
      }
    }
    await driver?.quit();
  });

  it('should measure complete wallet import flow', async () => {
    await goToWelcome(driver, rootURL);

    // Start performance measurement
    await collector.startFlowMeasurement('wallet-import');

    await importWalletFlow(driver, rootURL, TEST_VARIABLES.SEED_WALLET.SECRET);

    // Wait a bit for metrics to be available
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    await collector.endFlowMeasurement('wallet-import');
    const metrics = await collector.collectAllMetrics('wallet-import');

    await collector.saveMetrics('perf-wallet-import.json');
    console.log('Collected metrics:', JSON.stringify(metrics.metrics, null, 2));

    if (metrics.metrics.popupLoadTime !== undefined) {
      expect(metrics.metrics.popupLoadTime).toBeLessThan(2000); // 2 seconds for full extension load
      console.log(`Popup load time: ${metrics.metrics.popupLoadTime}ms`);
    }
    if (metrics.metrics.domContentLoaded !== undefined) {
      expect(metrics.metrics.domContentLoaded).toBeLessThan(1000); // 1 second for DOM ready
      console.log(`DOM content loaded: ${metrics.metrics.domContentLoaded}ms`);
    }

    expect(metrics.metrics.flowDuration).toBeDefined();
    if (metrics.metrics.flowDuration) {
      expect(metrics.metrics.flowDuration).toBeLessThan(40_000); // 40 seconds for complete wallet import
      console.log(`Total flow duration: ${metrics.metrics.flowDuration}ms`);
    }
  });

  it('should check memory usage', async () => {
    const metrics = await collector.collectExtensionMetrics();

    if (metrics.memoryUsage) {
      const memoryMB = metrics.memoryUsage.usedJSHeapSize / (1024 * 1024);
      console.log(`Memory usage: ${memoryMB.toFixed(2)}MB`);

      expect(metrics.memoryUsage.usedJSHeapSize).toBeLessThan(100_000_000); // 100MB warning threshold

      if (metrics.memoryUsage.usedJSHeapSize > 75_000_000) {
        console.warn(`⚠️ High memory usage detected: ${memoryMB.toFixed(2)}MB`);
      }
    }
  });
});
