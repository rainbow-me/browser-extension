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
summary += `**Browser:** ${results.browser || 'chrome'} ${
  results.browserVersion || ''
}\n\n`;

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
    summary += `| Load Scripts | ${formatValue(
      coldStart,
      'loadScripts',
    )} | ${formatValue(warmReload, 'loadScripts')} |\n`;
    summary += `| Setup Store | ${formatValue(
      coldStart,
      'setupStore',
    )} | ${formatValue(warmReload, 'setupStore')} |\n`;
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

// Performance Comparison with Baseline
summary += '\n### Performance Status\n\n';

try {
  const baselinePath = path.join(
    process.cwd(),
    'e2e/performance/baseline.json',
  );
  if (fs.existsSync(baselinePath)) {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const browserBaseline = baseline[results.browser || 'chrome'];

    if (browserBaseline && metrics.length > 0) {
      const warnings = [];
      const failures = [];

      // Check cold start metrics
      const coldStart = metrics.find((m) => m.flow === 'cold-start');
      if (coldStart && browserBaseline.coldStart) {
        for (const [metric, baselineValue] of Object.entries(
          browserBaseline.coldStart,
        )) {
          const actualValue = coldStart.metrics[metric];
          if (actualValue && typeof baselineValue === 'number') {
            const ratio = actualValue / baselineValue;
            const unit = metric === 'memoryUsage' ? 'MB' : 'ms';
            const displayValue =
              metric === 'memoryUsage'
                ? (actualValue / (1024 * 1024)).toFixed(1)
                : Math.round(actualValue);

            if (ratio > baseline.thresholds.critical) {
              failures.push(
                `❌ ${metric}: ${displayValue}${unit} (${(
                  (ratio - 1) *
                  100
                ).toFixed(0)}% over baseline)`,
              );
            } else if (ratio > baseline.thresholds.warning) {
              warnings.push(
                `⚠️ ${metric}: ${displayValue}${unit} (${(
                  (ratio - 1) *
                  100
                ).toFixed(0)}% over baseline)`,
              );
            }
          }
        }
      }

      if (failures.length > 0) {
        summary += '#### ❌ Critical Performance Regressions\n\n';
        failures.forEach((f) => (summary += `- ${f}\n`));
        summary += '\n';
      }

      if (warnings.length > 0) {
        summary += '#### ⚠️ Performance Warnings\n\n';
        warnings.forEach((w) => (summary += `- ${w}\n`));
        summary += '\n';
      }

      if (failures.length === 0 && warnings.length === 0) {
        summary += '✅ All metrics within acceptable thresholds\n\n';
      }

      summary += `<details>\n<summary>Baseline Comparison Details</summary>\n\n`;
      summary += `Baseline last updated: ${baseline.lastUpdated}\n`;
      summary += `Warning threshold: ${(
        (baseline.thresholds.warning - 1) *
        100
      ).toFixed(0)}% over baseline\n`;
      summary += `Critical threshold: ${(
        (baseline.thresholds.critical - 1) *
        100
      ).toFixed(0)}% over baseline\n\n`;
      summary += `To update baseline: \`yarn perf:update-baseline\`\n`;
      summary += `</details>\n`;
    } else {
      summary += 'No baseline data available for comparison.\n';
    }
  } else {
    summary +=
      'No baseline file found. Run `yarn perf:create-baseline` to establish baseline metrics.\n';
  }
} catch (error) {
  summary += `Error loading baseline: ${error.message}\n`;
}

// Write to GitHub Actions summary
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  fs.appendFileSync(summaryFile, summary);
  console.log('Performance summary written to GitHub Actions');
} else {
  // For local testing
  console.log(summary);
}
