#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

// Read current performance results
const resultsPath = path.join(process.cwd(), 'perf-results.json');
const baselinePath = path.join(process.cwd(), 'e2e/performance/baseline.json');

if (!fs.existsSync(resultsPath)) {
  console.error(
    '❌ No performance results found. Run performance tests first.',
  );
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const metrics = results.metrics || [];

// Load existing baseline or create new structure
let baseline;
if (fs.existsSync(baselinePath)) {
  baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
} else {
  baseline = {
    version: '1.0.0',
    description:
      'Performance baseline snapshot - Update this when performance improvements are intentional',
    lastUpdated: new Date().toISOString().split('T')[0],
    chrome: {},
    thresholds: {
      warning: 1.2, // 20% over baseline
      critical: 1.5, // 50% over baseline
    },
  };
}

// Update baseline with current metrics
const browser = results.browser || 'chrome';
baseline[browser] = baseline[browser] || {};

// Process each flow type
metrics.forEach((metric) => {
  const flow = metric.flow;
  if (!flow) return;

  // Map flow names to baseline keys
  const flowMap = {
    'cold-start': 'coldStart',
    'warm-reload': 'warmReload',
    'wallet-import': 'walletImport',
  };

  const baselineKey = flowMap[flow];
  if (!baselineKey) return;

  baseline[browser][baselineKey] = {};

  // Store relevant metrics
  const metricsToStore = [
    'domContentLoaded',
    'firstMeaningfulPaint',
    'loadScripts',
    'setupStore',
    'firstReactRender',
    'uiStartup',
    'memoryUsage',
    'flowDuration',
  ];

  metricsToStore.forEach((key) => {
    if (metric.metrics[key] !== undefined) {
      baseline[browser][baselineKey][key] = Math.round(metric.metrics[key]);
    }
  });
});

// Update timestamp
baseline.lastUpdated = new Date().toISOString().split('T')[0];

// Write updated baseline
fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));

console.log('✅ Performance baseline updated successfully!');
console.log(`📁 Baseline saved to: ${baselinePath}`);
console.log('');
console.log('Updated metrics:');
Object.entries(baseline[browser]).forEach(([flow, metrics]) => {
  console.log(`  ${flow}:`);
  Object.entries(metrics).forEach(([metric, value]) => {
    const displayValue =
      metric === 'memoryUsage'
        ? `${(value / (1024 * 1024)).toFixed(1)}MB`
        : `${value}ms`;
    console.log(`    - ${metric}: ${displayValue}`);
  });
});
console.log('');
console.log(
  '⚠️  Remember to commit the baseline.json file if these changes are intentional.',
);
