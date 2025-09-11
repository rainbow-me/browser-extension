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

// Map flow names to baseline keys
const getBaselineKey = (flowName) => {
  const flowMap = {
    'cold-start': 'coldStart',
    'warm-reload': 'warmReload',
    'wallet-import': 'walletImport',
  };
  return flowMap[flowName];
};

// Generate markdown for GitHub Actions summary
let summary = '## Performance Metrics Report\n\n';
summary += `**Browser:** ${results.browser || 'chrome'} ${
  results.browserVersion || ''
}\n\n`;

if (metrics.length === 0) {
  summary += 'No metrics collected.\n';
} else {
  // Consolidated Performance Metrics Table
  summary += '### Performance Metrics\n\n';
  summary += '| Test | Metric | Value | Baseline | Status |\n';
  summary += '|------|--------|-------|----------|--------|\n';

  const formatValue = (value, metric) => {
    if (value === undefined || value === null) return 'N/A';
    if (metric === 'memoryUsage') {
      return `${(value / (1024 * 1024)).toFixed(1)}MB`;
    } else if (metric === 'flowDuration') {
      return `${(value / 1000).toFixed(1)}s`;
    } else {
      return `${Math.round(value)}ms`;
    }
  };

  const getStatus = (actualValue, baselineValue) => {
    if (!baseline || !baselineValue || actualValue === undefined) return '—';

    // Handle zero baseline
    if (baselineValue === 0) {
      return actualValue > 10 ? '⚠️' : '✅';
    }

    const ratio = actualValue / baselineValue;
    if (ratio > baseline.thresholds.critical) return '❌';
    if (ratio > baseline.thresholds.warning) return '⚠️';
    return '✅';
  };

  // Define which metrics to show
  const metricsToShow = [
    'domContentLoaded',
    'firstMeaningfulPaint',
    'loadScripts',
    'firstReactRender',
    'uiStartup',
    'flowDuration',
    'memoryUsage',
  ];

  // Process each test result
  for (const test of metrics) {
    const testName = test.flow;
    const baselineKey = getBaselineKey(testName);
    const testBaseline = browserBaseline?.[baselineKey];

    for (const metric of metricsToShow) {
      const value = test.metrics[metric];
      if (value !== undefined && value !== null) {
        const baselineValue = testBaseline?.[metric];
        const status = getStatus(value, baselineValue, metric);
        const formattedValue = formatValue(value, metric);
        const formattedBaseline = baselineValue
          ? formatValue(baselineValue, metric)
          : '—';

        summary += `| ${testName} | ${metric} | ${formattedValue} | ${formattedBaseline} | ${status} |\n`;
      }
    }
  }

  summary += '\n';
}

// Performance Status Section
summary += '### Performance Status\n\n';

if (baseline && browserBaseline && metrics.length > 0) {
  const warnings = [];
  const failures = [];

  // Check all test metrics against baseline
  for (const test of metrics) {
    const testName = test.flow;
    const baselineKey = getBaselineKey(testName);
    const testBaseline = browserBaseline?.[baselineKey];

    if (testBaseline) {
      for (const [metric, baselineValue] of Object.entries(testBaseline)) {
        const actualValue = test.metrics[metric];
        if (actualValue && typeof baselineValue === 'number') {
          // Skip comparison if baseline is 0
          if (baselineValue === 0) {
            if (actualValue > 10) {
              warnings.push(
                `⚠️ ${testName}.${metric}: ${actualValue}ms (baseline was 0ms)`,
              );
            }
            continue;
          }

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
              `❌ ${testName}.${metric}: ${displayValue}${unit} (${(
                (ratio - 1) *
                100
              ).toFixed(0)}% over baseline)`,
            );
          } else if (ratio > baseline.thresholds.warning) {
            warnings.push(
              `⚠️ ${testName}.${metric}: ${displayValue}${unit} (${(
                (ratio - 1) *
                100
              ).toFixed(0)}% over baseline)`,
            );
          }
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
    summary += '✅ All tested metrics within acceptable thresholds\n\n';
  }

  // Add note about untested flows
  const testedFlows = new Set(metrics.map((m) => getBaselineKey(m.flow)));
  const baselineFlows = browserBaseline ? Object.keys(browserBaseline) : [];
  const untestedFlows = baselineFlows.filter((flow) => !testedFlows.has(flow));

  if (untestedFlows.length > 0) {
    const flowNames = untestedFlows.map((f) =>
      f
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim(),
    );
    summary += `ℹ️ Not tested in this run: ${flowNames.join(', ')}\n\n`;
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
