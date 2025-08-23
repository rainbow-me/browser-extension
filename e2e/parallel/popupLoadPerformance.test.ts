/* eslint-disable no-await-in-loop */
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

// Performance thresholds (in milliseconds)
// Note: These are initial thresholds. Adjust based on your performance goals.
const PERFORMANCE_THRESHOLDS = {
  popupLoad: {
    target: 1000, // Ideal target
    warning: 1500, // Warning threshold
    error: 2000, // Error threshold
  },
  firstPaint: {
    target: 200,
    warning: 300,
    error: 500,
  },
  storeHydration: {
    target: 100,
    warning: 200,
    error: 300,
  },
  reactRender: {
    target: 150,
    warning: 250,
    error: 400,
  },
};

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

// Extend window interface for performance metrics
declare global {
  interface Window {
    __PERF_METRICS__?: Record<string, number>;
  }
}

// Added: precise script return types
interface ScriptPerformanceMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  memory: PerformanceMemory | null;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ScriptPerformanceEntry {
  name: string;
  type: string;
  startTime: number;
  duration: number;
}

interface MemoryUsage {
  usedMB: string;
  totalMB: string;
  limitMB: string;
  percentage: string;
}

describe('Popup Load Performance', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
    // Import a test wallet to ensure we're in a ready state
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  }, 60000); // 60 second timeout for wallet import

  afterAll(async () => await driver?.quit());

  it('should load popup within performance budget', async () => {
    const results: number[] = [];
    const iterations = 1; // Start with just 1 iteration to test

    for (let i = 0; i < iterations; i++) {
      // Start performance measurement
      const startTime = Date.now();

      // Open popup
      await goToPopup(driver, rootURL);

      // Wait for popup to be fully loaded - check for main element
      // Increased timeout to 5 seconds to account for initial load
      await driver.wait(async () => {
        try {
          const mainElement = await driver.executeScript<boolean>(
            `
            return document.querySelector('#main') !== null || 
                   document.querySelector('[data-testid="home-page-header"]') !== null ||
                   document.querySelector('.navbar') !== null ||
                   document.querySelector('#app') !== null;
          `,
          );
          return mainElement;
        } catch {
          return false;
        }
      }, 5000);

      // Calculate total load time
      const loadTime = Date.now() - startTime;
      results.push(loadTime);

      // Get browser performance metrics
      const performanceMetrics =
        await driver.executeScript<ScriptPerformanceMetrics>(
          `
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          // Navigation timing
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
          loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
          
          // Paint timing
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          
          // Memory usage (Chrome only)
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          } : null,
        };
      `,
        );

      console.log(`Iteration ${i + 1} Performance Metrics:`, {
        totalLoadTime: `${loadTime}ms`,
        domContentLoaded: `${performanceMetrics.domContentLoaded}ms`,
        firstPaint: `${performanceMetrics.firstPaint}ms`,
        firstContentfulPaint: `${performanceMetrics.firstContentfulPaint}ms`,
        memoryUsed: performanceMetrics.memory
          ? `${(performanceMetrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(
              2,
            )}MB`
          : 'N/A',
      });

      // Small delay between iterations
      if (i < iterations - 1) {
        await driver.sleep(1000);
      }
    }

    // Calculate statistics
    const stats = calculateStats(results);

    console.log('Performance Statistics:', {
      mean: stats.mean.toFixed(2),
      median: stats.median.toFixed(2),
      p95: stats.p95.toFixed(2),
      min: stats.min.toFixed(2),
      max: stats.max.toFixed(2),
      stdDev: stats.stdDev.toFixed(2),
    });

    // Assert performance thresholds
    expect(stats.median).toBeLessThan(PERFORMANCE_THRESHOLDS.popupLoad.target);
    expect(stats.p95).toBeLessThan(PERFORMANCE_THRESHOLDS.popupLoad.warning);
    expect(stats.max).toBeLessThan(PERFORMANCE_THRESHOLDS.popupLoad.error);
  });

  it('should track detailed performance metrics', async () => {
    // Inject performance tracking
    await goToPopup(driver, rootURL);

    // Add performance tracking script
    await driver.executeScript(
      `
      window.__PERF_METRICS__ = {};
      
      // Override performance.mark to capture custom marks
      const originalMark = window.performance.mark.bind(window.performance);
      window.performance.mark = function(name) {
        window.__PERF_METRICS__[name] = performance.now();
        return originalMark(name);
      };
      
      // Override performance.measure to capture custom measures
      const originalMeasure = window.performance.measure.bind(window.performance);
      window.performance.measure = function(name, startMark, endMark) {
        const result = originalMeasure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name, 'measure');
        if (entries.length > 0) {
          window.__PERF_METRICS__['measure_' + name] = entries[entries.length - 1].duration;
        }
        return result;
      };
      
      // Track React renders
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' || entry.entryType === 'mark') {
            console.log('[PERF] ' + entry.name + ': ' + entry.startTime + 'ms');
          }
        }
      });
      observer.observe({ entryTypes: ['measure', 'mark'] });
    `,
    );

    // Reload to apply the tracking
    await driver.navigate().refresh();
    await driver.sleep(2000); // Wait for page to load

    // Collect all performance entries
    const performanceEntries = await driver.executeScript<
      ScriptPerformanceEntry[]
    >(
      `
      const entries = performance.getEntries();
      return entries.map(entry => ({
        name: entry.name,
        type: entry.entryType,
        startTime: entry.startTime,
        duration: entry.duration,
      }));
    `,
    );

    // Group and analyze performance entries
    const groupedMetrics = performanceEntries.reduce(
      (acc: Record<string, ScriptPerformanceEntry[]>, entry) => {
        const category =
          entry.type === 'resource'
            ? 'resources'
            : entry.type === 'measure'
            ? 'measures'
            : entry.type === 'mark'
            ? 'marks'
            : 'other';

        if (!acc[category]) acc[category] = [];
        acc[category].push(entry);
        return acc;
      },
      {},
    );

    console.log('Detailed Performance Breakdown:', groupedMetrics);

    // Check for specific performance issues
    const resources: ScriptPerformanceEntry[] = groupedMetrics.resources || [];
    const slowResources = resources.filter((r) => r.duration > 100);

    if (slowResources.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('Slow resources detected:', slowResources);
    }

    // Memory check (Chrome only)
    const memoryUsage = await driver.executeScript<MemoryUsage | null>(
      `
      if (performance.memory) {
        const memory = performance.memory;
        return {
          usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          totalMB: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
          limitMB: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
          percentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2),
        };
      }
      return null;
    `,
    );

    if (memoryUsage) {
      console.log('Memory Usage:', memoryUsage);

      // Warn if memory usage is high
      const usagePercent = parseFloat(memoryUsage.percentage);
      expect(usagePercent).toBeLessThan(80);
    }

    // Get custom metrics
    const customMetrics = await driver.executeScript<Record<string, number>>(
      `
      return window.__PERF_METRICS__ || {};
    `,
    );

    console.log('Custom Performance Metrics:', customMetrics);
  });
});

// Helper function to calculate statistics
function calculateStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;

  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return {
    mean,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1],
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stdDev,
  };
}
