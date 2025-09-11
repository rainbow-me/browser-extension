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
      driver = await initDriverWithOptions({
        browser,
        os,
      });
      const extensionId = await getExtensionIdByName(driver, 'Rainbow');
      if (!extensionId) throw new Error('Extension not found');
      rootURL += extensionId;
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

    await collector.startFlowMeasurement('wallet-import');

    await importWalletFlow(driver, rootURL, TEST_VARIABLES.SEED_WALLET.SECRET);

    await collector.endFlowMeasurement('wallet-import');
    const metrics = await collector.collectAllMetrics('wallet-import');

    await collector.saveMetrics('perf-wallet-import.json');
    console.log('Collected metrics:', JSON.stringify(metrics.metrics, null, 2));

    if (metrics.metrics.popupLoadTime !== undefined) {
      expect(metrics.metrics.popupLoadTime).toBeLessThan(2000);
      console.log(`Popup load time: ${metrics.metrics.popupLoadTime}ms`);
    }
    if (metrics.metrics.domContentLoaded !== undefined) {
      expect(metrics.metrics.domContentLoaded).toBeLessThan(1000);
      console.log(`DOM content loaded: ${metrics.metrics.domContentLoaded}ms`);
    }

    expect(metrics.metrics.flowDuration).toBeDefined();
    if (metrics.metrics.flowDuration) {
      expect(metrics.metrics.flowDuration).toBeLessThan(45_000);
      console.log(`Total flow duration: ${metrics.metrics.flowDuration}ms`);
    }
  });

  it('should check memory usage', async () => {
    const metrics = await collector.collectExtensionMetrics();

    if (metrics.memoryUsage) {
      const memoryMB = metrics.memoryUsage.usedJSHeapSize / (1024 * 1024);
      console.log(`Memory usage: ${memoryMB.toFixed(2)}MB`);

      expect(metrics.memoryUsage.usedJSHeapSize).toBeLessThan(100_000_000);

      if (metrics.memoryUsage.usedJSHeapSize > 75_000_000) {
        console.warn(`⚠️ High memory usage detected: ${memoryMB.toFixed(2)}MB`);
      }
    }
  });
});
