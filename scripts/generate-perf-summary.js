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

// Load baseline for comparison
let baseline = null;
let browserBaseline = null;
try {
  const baselinePath = path.join(
    process.cwd(),
    'e2e/performance/baseline.json',
  );
  if (fs.existsSync(baselinePath)) {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    browserBaseline = baseline[results.browser || 'chrome'];
  }
} catch (error) {
  console.error('Error loading baseline:', error);
}

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

  // Only show UI Startup Metrics if we have cold start or warm reload data
  if (coldStart || warmReload) {
    summary += '### UI Startup Metrics\n\n';
    summary += '| Metric | Cold Start | Warm Reload | Status |\n';
    summary += '|--------|------------|-------------|--------|\n';

    const formatValue = (obj, key) => {
      if (!obj || !obj.metrics || obj.metrics[key] === undefined) return 'N/A';
      return `${Math.round(obj.metrics[key])}ms`;
    };

    const getStatus = (metric, coldValue, warmValue) => {
      // Check against baseline if available
      if (baseline && browserBaseline) {
        const coldBaseline = browserBaseline.coldStart?.[metric];
        const warmBaseline = browserBaseline.warmReload?.[metric];

        let hasIssue = false;
        let hasWarning = false;

        if (coldValue !== 'N/A' && coldBaseline) {
          const ratio = parseInt(coldValue) / coldBaseline;
          if (ratio > baseline.thresholds.critical) hasIssue = true;
          else if (ratio > baseline.thresholds.warning) hasWarning = true;
        }

        if (warmValue !== 'N/A' && warmBaseline) {
          const ratio = parseInt(warmValue) / warmBaseline;
          if (ratio > baseline.thresholds.critical) hasIssue = true;
          else if (ratio > baseline.thresholds.warning) hasWarning = true;
        }

        if (hasIssue) return '❌';
        if (hasWarning) return '⚠️';
      }
      return '✅';
    };

    // Core Web Vitals
    const coldDom = formatValue(coldStart, 'domContentLoaded');
    const warmDom = formatValue(warmReload, 'domContentLoaded');
    summary += `| DOM Content Loaded | ${coldDom} | ${warmDom} | ${getStatus(
      'domContentLoaded',
      coldDom,
      warmDom,
    )} |\n`;

    const coldFMP = formatValue(coldStart, 'firstMeaningfulPaint');
    const warmFMP = formatValue(warmReload, 'firstMeaningfulPaint');
    summary += `| First Meaningful Paint | ${coldFMP} | ${warmFMP} | ${getStatus(
      'firstMeaningfulPaint',
      coldFMP,
      warmFMP,
    )} |\n`;

    // Extension-specific startup metrics
    const coldLoad = formatValue(coldStart, 'loadScripts');
    const warmLoad = formatValue(warmReload, 'loadScripts');
    summary += `| Load Scripts | ${coldLoad} | ${warmLoad} | ${getStatus(
      'loadScripts',
      coldLoad,
      warmLoad,
    )} |\n`;

    const coldStore = formatValue(coldStart, 'setupStore');
    const warmStore = formatValue(warmReload, 'setupStore');
    summary += `| Setup Store | ${coldStore} | ${warmStore} | ${getStatus(
      'setupStore',
      coldStore,
      warmStore,
    )} |\n`;

    const coldReact = formatValue(coldStart, 'firstReactRender');
    const warmReact = formatValue(warmReload, 'firstReactRender');
    summary += `| First React Render | ${coldReact} | ${warmReact} | ${getStatus(
      'firstReactRender',
      coldReact,
      warmReact,
    )} |\n`;

    const coldUI = formatValue(coldStart, 'uiStartup');
    const warmUI = formatValue(warmReload, 'uiStartup');
    summary += `| UI Startup (Total) | ${coldUI} | ${warmUI} | ${getStatus(
      'uiStartup',
      coldUI,
      warmUI,
    )} |\n`;
  }

  // User Flow Metrics
  if (walletImport) {
    summary += '\n### User Flow Metrics\n\n';
    summary += '| Flow | Duration | Memory Usage | Status |\n';
    summary += '|------|----------|-------------|--------|\n';

    const duration = walletImport.metrics.flowDuration
      ? `${(walletImport.metrics.flowDuration / 1000).toFixed(1)}s`
      : 'N/A';
    const memory = walletImport.metrics.memoryUsage
      ? `${(walletImport.metrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB`
      : 'N/A';

    // Check status against baseline
    let status = '✅';
    if (baseline && browserBaseline && browserBaseline.walletImport) {
      const baselineDuration = browserBaseline.walletImport.flowDuration;
      const baselineMemory = browserBaseline.walletImport.memoryUsage;
      let hasIssue = false;
      let hasWarning = false;

      if (walletImport.metrics.flowDuration && baselineDuration) {
        const ratio = walletImport.metrics.flowDuration / baselineDuration;
        if (ratio > baseline.thresholds.critical) hasIssue = true;
        else if (ratio > baseline.thresholds.warning) hasWarning = true;
      }

      if (walletImport.metrics.memoryUsage && baselineMemory) {
        const ratio = walletImport.metrics.memoryUsage / baselineMemory;
        if (ratio > baseline.thresholds.critical) hasIssue = true;
        else if (ratio > baseline.thresholds.warning) hasWarning = true;
      }

      if (hasIssue) status = '❌';
      else if (hasWarning) status = '⚠️';
    }

    summary += `| Wallet Import | ${duration} | ${memory} | ${status} |\n`;
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

if (baseline && browserBaseline && metrics.length > 0) {
  const warnings = [];
  const failures = [];

  // Check cold start metrics
  const coldStart = metrics.find((m) => m.flow === 'cold-start');
  const warmReload = metrics.find((m) => m.flow === 'warm-reload');
  const walletImport = metrics.find((m) => m.flow === 'wallet-import');

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

  // Check wallet import metrics if available
  if (walletImport && browserBaseline.walletImport) {
    for (const [metric, baselineValue] of Object.entries(
      browserBaseline.walletImport,
    )) {
      const actualValue = walletImport.metrics[metric];
      if (actualValue && typeof baselineValue === 'number') {
        const ratio = actualValue / baselineValue;
        const unit =
          metric === 'memoryUsage'
            ? 'MB'
            : metric === 'flowDuration'
            ? 's'
            : 'ms';
        const displayValue =
          metric === 'memoryUsage'
            ? (actualValue / (1024 * 1024)).toFixed(1)
            : metric === 'flowDuration'
            ? (actualValue / 1000).toFixed(1)
            : Math.round(actualValue);

        if (ratio > baseline.thresholds.critical) {
          failures.push(
            `❌ wallet-import.${metric}: ${displayValue}${unit} (${(
              (ratio - 1) *
              100
            ).toFixed(0)}% over baseline)`,
          );
        } else if (ratio > baseline.thresholds.warning) {
          warnings.push(
            `⚠️ wallet-import.${metric}: ${displayValue}${unit} (${(
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

  if (!coldStart && !warmReload && !walletImport) {
    summary += 'No performance tests were run.\n\n';
  } else if (failures.length === 0 && warnings.length === 0) {
    summary += '✅ All tested metrics within acceptable thresholds\n\n';
  } else if (!failures.length && !warnings.length) {
    // If we only ran wallet-import but no baseline exists for it
    if (walletImport && !browserBaseline.walletImport) {
      summary += 'ℹ️ Wallet import baseline not available for comparison\n\n';
    }
  }

  // Add note about untested flows
  const untestedFlows = [];
  if (!coldStart && browserBaseline?.coldStart)
    untestedFlows.push('cold start');
  if (!warmReload && browserBaseline?.warmReload)
    untestedFlows.push('warm reload');
  if (!walletImport && browserBaseline?.walletImport)
    untestedFlows.push('wallet import');

  if (untestedFlows.length > 0) {
    summary += `ℹ️ Not tested in this run: ${untestedFlows.join(', ')}\n\n`;
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
} else if (!baseline) {
  summary +=
    'No baseline file found. Run `yarn perf:generate-baseline` to establish baseline metrics.\n';
} else {
  summary += 'No baseline data available for comparison.\n';
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
