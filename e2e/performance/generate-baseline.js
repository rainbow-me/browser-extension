#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const shouldRunTests = !args.includes('--update-only');

console.log('🚀 Performance Baseline Tool');
console.log('===========================');
console.log('');

if (shouldRunTests) {
  console.log('This will:');
  console.log('1. Run the performance tests locally');
  console.log('2. Generate a baseline from the actual results');
  console.log('');
  console.log(
    'Note: Assumes you have already built the extension with IS_TESTING=true',
  );
  console.log('');
  console.log('🧪 Running performance tests...');

  try {
    execSync('yarn vitest:performance', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Performance tests failed');
    process.exit(1);
  }
} else {
  console.log('Updating baseline from existing results...');
}

// Check if results were generated
const resultsPath = path.join(process.cwd(), 'perf-results.json');
const baselinePath = path.join(process.cwd(), 'e2e/performance/baseline.json');

if (!fs.existsSync(resultsPath)) {
  console.error(
    '❌ No performance results found. Run performance tests first.',
  );
  process.exit(1);
}

console.log('');
console.log('📊 Updating baseline with actual metrics...');

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

console.log('');
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
console.log('✅ Baseline generated successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Review the baseline values in e2e/performance/baseline.json');
console.log('2. Commit the file if the values look correct');
console.log('3. Future CI runs will compare against these baseline values');
console.log('');
console.log('Usage:');
console.log(
  '  node e2e/performance/generate-baseline.js        # Run tests and update baseline',
);
console.log(
  '  node e2e/performance/generate-baseline.js --update-only  # Update baseline from existing results',
);
console.log('');
console.log('To build with performance tracking: IS_TESTING=true yarn build');
