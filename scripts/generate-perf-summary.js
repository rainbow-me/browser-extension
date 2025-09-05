#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

// Read performance results
const resultsPath = path.join(process.cwd(), 'perf-results.json');
if (!fs.existsSync(resultsPath)) {
  console.error('No performance results found');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const metrics = results.metrics || [];

// Generate markdown for GitHub Actions summary
let summary = '## Performance Metrics Report\n\n';
summary += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
summary += `**Commit:** ${
  process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'local'
}\n`;
summary += `**Browser:** ${results.browser || 'chrome'}\n\n`;

if (metrics.length === 0) {
  summary += 'No metrics collected.\n';
} else {
  const coldStart = metrics.find((m) => m.flow === 'cold-start');
  const warmReload = metrics.find((m) => m.flow === 'warm-reload');
  const walletImport = metrics.find((m) => m.flow === 'wallet-import');
  const initialMemory = metrics.find((m) => m.flow === 'initial-memory');

  summary += '### UI Startup Metrics\n\n';
  summary += '| Metric | Cold Start | Warm Reload |\n';
  summary += '|--------|------------|-------------|\n';

  if (coldStart || warmReload) {
    const formatValue = (obj, key) => {
      if (!obj || !obj.metrics || obj.metrics[key] === undefined) return 'N/A';
      return `${Math.round(obj.metrics[key])}ms`;
    };

    // Core Web Vitals
    summary += `| DOM Content Loaded | ${formatValue(
      coldStart,
      'domContentLoaded',
    )} | ${formatValue(warmReload, 'domContentLoaded')} |\n`;
    summary += `| First Meaningful Paint | ${formatValue(
      coldStart,
      'firstMeaningfulPaint',
    )} | ${formatValue(warmReload, 'firstMeaningfulPaint')} |\n`;

    // Extension-specific startup metrics
    summary += `| Background Connect | ${formatValue(
      coldStart,
      'backgroundConnect',
    )} | ${formatValue(warmReload, 'backgroundConnect')} |\n`;
    summary += `| Load Scripts | ${formatValue(
      coldStart,
      'loadScripts',
    )} | ${formatValue(warmReload, 'loadScripts')} |\n`;
    summary += `| Setup Store | ${formatValue(
      coldStart,
      'setupStore',
    )} | ${formatValue(warmReload, 'setupStore')} |\n`;
    summary += `| Get State | ${formatValue(
      coldStart,
      'getState',
    )} | ${formatValue(warmReload, 'getState')} |\n`;
    summary += `| Initial Actions | ${formatValue(
      coldStart,
      'initialActions',
    )} | ${formatValue(warmReload, 'initialActions')} |\n`;
    summary += `| First React Render | ${formatValue(
      coldStart,
      'firstReactRender',
    )} | ${formatValue(warmReload, 'firstReactRender')} |\n`;
    summary += `| UI Startup (Total) | ${formatValue(
      coldStart,
      'uiStartup',
    )} | ${formatValue(warmReload, 'uiStartup')} |\n`;
  }

  // User Flow Metrics
  if (walletImport) {
    summary += '\n### User Flow Metrics\n\n';
    summary += '| Flow | Duration | Memory Usage |\n';
    summary += '|------|----------|-------------|\n';

    const duration = walletImport.metrics.flowDuration
      ? `${(walletImport.metrics.flowDuration / 1000).toFixed(1)}s`
      : 'N/A';
    const memory = walletImport.metrics.memoryUsage
      ? `${(walletImport.metrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB`
      : 'N/A';

    summary += `| Wallet Import | ${duration} | ${memory} |\n`;
  }

  // Memory Metrics
  if (initialMemory || walletImport) {
    summary += '\n### Memory Usage\n\n';
    summary += '| Context | Usage |\n';
    summary += '|---------|-------|\n';

    if (initialMemory && initialMemory.metrics.memoryUsage) {
      const mem = (
        initialMemory.metrics.memoryUsage.usedJSHeapSize /
        (1024 * 1024)
      ).toFixed(1);
      summary += `| Initial Load | ${mem}MB |\n`;
    }
    if (walletImport && walletImport.metrics.memoryUsage) {
      const mem = (walletImport.metrics.memoryUsage / (1024 * 1024)).toFixed(1);
      summary += `| After Wallet Import | ${mem}MB |\n`;
    }
  }

  // Detailed Results
  summary += '\n### Detailed Results\n\n';
  summary += '<details>\n<summary>All Metrics</summary>\n\n';
  summary += '| Test | Metric | Value |\n';
  summary += '|------|--------|-------|\n';

  for (const testResult of metrics) {
    const flow = testResult.flow || 'unknown';
    const testMetrics = testResult.metrics || {};

    for (const [key, value] of Object.entries(testMetrics)) {
      if (value !== undefined && value !== null && key !== 'customMetrics') {
        let displayValue;
        if (key === 'memoryUsage') {
          if (typeof value === 'object' && value.usedJSHeapSize) {
            displayValue = `${(value.usedJSHeapSize / (1024 * 1024)).toFixed(
              1,
            )}MB`;
          } else {
            displayValue = `${(value / (1024 * 1024)).toFixed(1)}MB`;
          }
        } else if (key === 'bundleSize') {
          displayValue = `${(value / (1024 * 1024)).toFixed(2)}MB`;
        } else if (typeof value === 'number') {
          displayValue = `${Math.round(value)}ms`;
        } else if (typeof value === 'object') {
          // Skip complex objects in the main table
          continue;
        } else {
          displayValue = String(value);
        }
        summary += `| ${flow} | ${key} | ${displayValue} |\n`;
      }
    }
  }
  summary += '\n</details>\n';
}

// Performance Thresholds (future implementation)
summary += '\n### Performance Status\n\n';
summary += 'Performance thresholds will be implemented in a future update.\n';

// Write to GitHub Actions summary
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  fs.appendFileSync(summaryFile, summary);
  console.log('Performance summary written to GitHub Actions');
} else {
  // For local testing
  console.log(summary);
}
