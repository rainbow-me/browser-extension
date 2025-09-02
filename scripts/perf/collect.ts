#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { WebDriver } from 'selenium-webdriver';

export interface PerformanceMetrics {
  timestamp: string;
  flow: string;
  browser: string;
  metrics: {
    // Extension-specific metrics
    extensionLoadTime?: number;
    popupLoadTime?: number;
    firstMeaningfulPaint?: number;
    timeToInteractive?: number;

    // Navigation timing metrics
    domContentLoaded?: number;
    loadComplete?: number;

    // Resource metrics
    bundleSize?: number;
    memoryUsage?: number;

    // Custom flow metrics
    flowDuration?: number;
    customMetrics?: Record<string, number>;
  };

  // Raw performance data for debugging
  raw?: {
    navigationTiming?: any;
    resourceTiming?: any;
    userTiming?: any;
  };
}

export class PerformanceCollector {
  private metrics: PerformanceMetrics[] = [];

  constructor(
    private driver: WebDriver,
    private browser = 'chrome',
  ) {}

  async collectNavigationMetrics(): Promise<any> {
    try {
      const navigationTiming = await this.driver.executeScript(`
        const timing = performance.timing || {};
        const navigation = performance.getEntriesByType('navigation')[0] || {};
        
        // Ensure we have valid timing data
        if (!timing.navigationStart) {
          return {
            domContentLoaded: 0,
            loadComplete: 0,
            domInteractive: 0
          };
        }
        
        return {
          // Core Web Vitals approximations
          domContentLoaded: timing.domContentLoadedEventEnd ? timing.domContentLoadedEventEnd - timing.navigationStart : 0,
          loadComplete: timing.loadEventEnd ? timing.loadEventEnd - timing.navigationStart : 0,
          domInteractive: timing.domInteractive ? timing.domInteractive - timing.navigationStart : 0,
          
          // Additional metrics
          dns: (timing.domainLookupEnd && timing.domainLookupStart) ? timing.domainLookupEnd - timing.domainLookupStart : 0,
          tcp: (timing.connectEnd && timing.connectStart) ? timing.connectEnd - timing.connectStart : 0,
          ttfb: timing.responseStart ? timing.responseStart - timing.navigationStart : 0,
          
          // Navigation API data
          ...navigation
        };
      `);

      return navigationTiming;
    } catch (error) {
      console.error('Failed to collect navigation metrics:', error);
      return null;
    }
  }

  async collectResourceMetrics(): Promise<any> {
    try {
      const resources = await this.driver.executeScript(`
        const resources = performance.getEntriesByType('resource');
        return resources.map(r => ({
          name: r.name,
          duration: r.duration,
          size: r.transferSize || 0,
          type: r.initiatorType
        }));
      `);

      return resources;
    } catch (error) {
      console.error('Failed to collect resource metrics:', error);
      return [];
    }
  }

  async collectExtensionMetrics(): Promise<any> {
    try {
      // Extension-specific metrics via Chrome APIs (when available)
      const extensionMetrics = await this.driver.executeScript(`
        return new Promise((resolve) => {
          const metrics = {};
          
          // Measure popup initialization time
          if (window.performance && window.performance.timing && window.performance.timing.loadEventEnd) {
            metrics.popupLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          } else {
            // Fallback to navigation entry
            const navEntry = performance.getEntriesByType('navigation')[0];
            if (navEntry && navEntry.loadEventEnd) {
              metrics.popupLoadTime = navEntry.loadEventEnd;
            }
          }
          
          // Get first meaningful paint if available
          const paintEntries = performance.getEntriesByType('paint');
          const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
          const fmp = paintEntries.find(e => e.name === 'first-meaningful-paint');
          if (fcp) {
            metrics.firstMeaningfulPaint = fcp.startTime;
          } else if (fmp) {
            metrics.firstMeaningfulPaint = fmp.startTime;
          }
          
          // Memory usage (Chrome only)
          if (performance.memory) {
            metrics.memoryUsage = {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
          }
          
          resolve(metrics);
        });
      `);

      return extensionMetrics;
    } catch (error) {
      console.error('Failed to collect extension metrics:', error);
      return {};
    }
  }

  async collectUserTimingMarks(): Promise<any> {
    try {
      const marks = await this.driver.executeScript(`
        return {
          marks: performance.getEntriesByType('mark').map(m => ({
            name: m.name,
            startTime: m.startTime
          })),
          measures: performance.getEntriesByType('measure').map(m => ({
            name: m.name,
            duration: m.duration,
            startTime: m.startTime
          }))
        };
      `);

      return marks;
    } catch (error) {
      console.error('Failed to collect user timing marks:', error);
      return { marks: [], measures: [] };
    }
  }

  async startFlowMeasurement(flowName: string): Promise<void> {
    this.currentFlow = {
      name: flowName,
      startTime: Date.now(),
    };

    // Mark the start in the browser
    await this.driver
      .executeScript(
        `
      performance.mark('flow-start-${flowName}');
    `,
      )
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  async endFlowMeasurement(flowName: string): Promise<number> {
    const endTime = Date.now();

    // Mark the end and measure in the browser
    await this.driver
      .executeScript(
        `
      performance.mark('flow-end-${flowName}');
      performance.measure(
        'flow-${flowName}',
        'flow-start-${flowName}',
        'flow-end-${flowName}'
      );
    `,
      )
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});

    if (this.currentFlow && this.currentFlow.name === flowName) {
      const duration = endTime - this.currentFlow.startTime;
      this.currentFlow = null;
      return duration;
    }

    return 0;
  }

  async collectAllMetrics(flowName: string): Promise<PerformanceMetrics> {
    const [navigation, resources, extension, userTiming] = await Promise.all([
      this.collectNavigationMetrics(),
      this.collectResourceMetrics(),
      this.collectExtensionMetrics(),
      this.collectUserTimingMarks(),
    ]);

    // Calculate aggregated metrics
    const totalResourceSize = resources.reduce(
      (sum: number, r: any) => sum + (r.size || 0),
      0,
    );

    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      flow: flowName,
      browser: this.browser,
      metrics: {
        extensionLoadTime: extension.popupLoadTime,
        firstMeaningfulPaint: extension.firstMeaningfulPaint,
        domContentLoaded: navigation?.domContentLoaded,
        loadComplete: navigation?.loadComplete,
        bundleSize: totalResourceSize,
        memoryUsage: extension.memoryUsage?.usedJSHeapSize,
        customMetrics: {},
      },
      raw: {
        navigationTiming: navigation,
        resourceTiming: resources,
        userTiming: userTiming,
      },
    };

    // Add any custom flow measurements
    const flowMeasure = userTiming.measures.find(
      (m: any) => m.name === `flow-${flowName}`,
    );
    if (flowMeasure) {
      metrics.metrics.flowDuration = flowMeasure.duration;
    }

    this.metrics.push(metrics);
    return metrics;
  }

  async saveMetrics(outputPath?: string): Promise<void> {
    const defaultPath = path.join(process.cwd(), 'perf-results.json');
    const finalPath = outputPath || defaultPath;

    const output = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      browser: this.browser,
      metrics: this.metrics,
    };

    fs.writeFileSync(finalPath, JSON.stringify(output, null, 2));
    console.log(`Performance metrics saved to: ${finalPath}`);

    // Also save to the default perf-results.json for CI
    if (outputPath && outputPath !== defaultPath) {
      fs.writeFileSync(defaultPath, JSON.stringify(output, null, 2));
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  private currentFlow: { name: string; startTime: number } | null = null;
}

// Utility function for use in tests
export async function measureFlow(
  driver: WebDriver,
  flowName: string,
  testFn: () => Promise<void>,
  browser = 'chrome',
): Promise<PerformanceMetrics> {
  const collector = new PerformanceCollector(driver, browser);

  await collector.startFlowMeasurement(flowName);
  await testFn();
  await collector.endFlowMeasurement(flowName);

  const metrics = await collector.collectAllMetrics(flowName);
  await collector.saveMetrics();

  return metrics;
}
