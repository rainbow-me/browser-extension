/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { PerformanceCollector } from '../../scripts/perf/collect';
import {
  getExtensionIdByName,
  getRootUrl,
  goToWelcome,
  initDriverWithOptions,
  takeScreenshotOnFailure,
} from '../helpers';

let rootURL = getRootUrl();
let driver: WebDriver;
let collector: PerformanceCollector;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Extension Initial Load Performance', () => {
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
      await collector.saveMetrics('perf-initial-load.json');
    }
    await driver?.quit();
  });

  it('should measure cold start performance', async () => {
    // Measure cold start (first load)
    await collector.startFlowMeasurement('cold-start');
    await goToWelcome(driver, rootURL);
    await collector.endFlowMeasurement('cold-start');
    const metrics = await collector.collectAllMetrics('cold-start');

    console.log('Cold start metrics:', {
      domContentLoaded: metrics.metrics.domContentLoaded,
      firstMeaningfulPaint: metrics.metrics.firstMeaningfulPaint,
      flowDuration: metrics.metrics.flowDuration,
    });

    if (metrics.metrics.domContentLoaded !== undefined) {
      expect(metrics.metrics.domContentLoaded).toBeLessThan(1000);

      if (metrics.metrics.domContentLoaded > 800) {
        console.warn(
          `⚠️ Slow cold start: ${metrics.metrics.domContentLoaded}ms`,
        );
      }
    }

    if (metrics.metrics.firstMeaningfulPaint !== undefined) {
      expect(metrics.metrics.firstMeaningfulPaint).toBeLessThan(3000);
      console.log(
        `First meaningful paint: ${metrics.metrics.firstMeaningfulPaint}ms`,
      );
    }
  });

  it('should measure warm reload performance', async () => {
    // Navigate away and back for warm reload
    await driver.navigate().refresh();

    await collector.startFlowMeasurement('warm-reload');

    // Wait for reload to complete
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    await collector.endFlowMeasurement('warm-reload');
    const metrics = await collector.collectAllMetrics('warm-reload');

    console.log('Warm reload metrics:', {
      domContentLoaded: metrics.metrics.domContentLoaded,
      firstMeaningfulPaint: metrics.metrics.firstMeaningfulPaint,
    });

    if (metrics.metrics.domContentLoaded !== undefined) {
      expect(metrics.metrics.domContentLoaded).toBeLessThan(600);
    }
  });

  it('should check initial memory footprint', async () => {
    const metrics = await collector.collectExtensionMetrics();

    if (metrics.memoryUsage) {
      const memoryMB = metrics.memoryUsage.usedJSHeapSize / (1024 * 1024);
      console.log(`Initial memory footprint: ${memoryMB.toFixed(2)}MB`);

      expect(metrics.memoryUsage.usedJSHeapSize).toBeLessThan(80_000_000);

      if (metrics.memoryUsage.usedJSHeapSize > 60_000_000) {
        console.warn(`⚠️ High initial memory usage: ${memoryMB.toFixed(2)}MB`);
      }
    }
  });

  it('should measure resource loading', async () => {
    const resources = await collector.collectResourceMetrics();

    if (resources && resources.length > 0) {
      const totalSize = resources.reduce(
        (sum: number, r: any) => sum + (r.size || 0),
        0,
      );
      const totalDuration = resources.reduce(
        (sum: number, r: any) => sum + r.duration,
        0,
      );

      console.log(`Loaded ${resources.length} resources`);
      console.log(`Total resource size: ${(totalSize / 1024).toFixed(2)}KB`);
      console.log(`Total load time: ${totalDuration.toFixed(2)}ms`);

      // Check for slow resources
      const slowResources = resources.filter((r: any) => r.duration > 500);
      if (slowResources.length > 0) {
        console.warn(
          '⚠️ Slow resources detected:',
          slowResources.map((r: any) => ({
            name: r.name.split('/').pop(),
            duration: r.duration,
          })),
        );
      }
    }
  });
});
