#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { PerformanceMetrics } from './collect';

interface ComparisonThresholds {
  extensionLoadTime?: { absolute: number; percentage: number };
  popupLoadTime?: { absolute: number; percentage: number };
  firstMeaningfulPaint?: { absolute: number; percentage: number };
  domContentLoaded?: { absolute: number; percentage: number };
  memoryUsage?: { absolute: number; percentage: number };
  bundleSize?: { absolute: number; percentage: number };
  [key: string]: { absolute: number; percentage: number } | undefined;
}

interface ComparisonResult {
  metric: string;
  baseline: number | undefined;
  current: number | undefined;
  difference: number;
  percentageChange: number;
  status: 'pass' | 'fail' | 'warning' | 'improved';
  threshold: { absolute: number; percentage: number } | undefined;
}

export class PerformanceComparator {
  private defaultThresholds: ComparisonThresholds = {
    extensionLoadTime: { absolute: 100, percentage: 10 },
    popupLoadTime: { absolute: 100, percentage: 10 },
    firstMeaningfulPaint: { absolute: 50, percentage: 10 },
    domContentLoaded: { absolute: 100, percentage: 15 },
    memoryUsage: { absolute: 5_000_000, percentage: 20 }, // 5MB
    bundleSize: { absolute: 500_000, percentage: 10 }, // 500KB
  };

  constructor(
    private baseline: any,
    private current: any,
    private customThresholds?: Partial<ComparisonThresholds>,
  ) {
    if (customThresholds) {
      this.defaultThresholds = {
        ...this.defaultThresholds,
        ...customThresholds,
      };
    }
  }

  private getMetricValue(metrics: any, path: string): number | undefined {
    const parts = path.split('.');
    let value = metrics;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return typeof value === 'number' ? value : undefined;
  }

  private compareMetric(
    metricName: string,
    baselineValue: number | undefined,
    currentValue: number | undefined,
    threshold?: { absolute: number; percentage: number },
  ): ComparisonResult {
    if (baselineValue === undefined || currentValue === undefined) {
      return {
        metric: metricName,
        baseline: baselineValue,
        current: currentValue,
        difference: 0,
        percentageChange: 0,
        status: 'pass',
        threshold,
      };
    }

    const difference = currentValue - baselineValue;
    const percentageChange = (difference / baselineValue) * 100;

    let status: 'pass' | 'fail' | 'warning' | 'improved' = 'pass';

    if (difference < 0) {
      // Performance improved
      status = 'improved';
    } else if (threshold) {
      // Check if regression exceeds thresholds
      if (
        difference > threshold.absolute ||
        percentageChange > threshold.percentage
      ) {
        status = 'fail';
      } else if (
        difference > threshold.absolute * 0.8 ||
        percentageChange > threshold.percentage * 0.8
      ) {
        status = 'warning';
      }
    }

    return {
      metric: metricName,
      baseline: baselineValue,
      current: currentValue,
      difference,
      percentageChange,
      status,
      threshold,
    };
  }

  public compare(flowName?: string): ComparisonResult[] {
    const results: ComparisonResult[] = [];

    // Get metrics for specific flow or aggregate all flows
    const baselineMetrics = flowName
      ? this.baseline.metrics?.find(
          (m: PerformanceMetrics) => m.flow === flowName,
        )
      : this.aggregateMetrics(this.baseline.metrics);

    const currentMetrics = flowName
      ? this.current.metrics?.find(
          (m: PerformanceMetrics) => m.flow === flowName,
        )
      : this.aggregateMetrics(this.current.metrics);

    if (!baselineMetrics || !currentMetrics) {
      console.warn(`No metrics found for flow: ${flowName || 'all'}`);
      return results;
    }

    // Compare each metric
    for (const [metricName, threshold] of Object.entries(
      this.defaultThresholds,
    )) {
      const baselineValue = this.getMetricValue(
        baselineMetrics.metrics,
        metricName,
      );
      const currentValue = this.getMetricValue(
        currentMetrics.metrics,
        metricName,
      );

      results.push(
        this.compareMetric(metricName, baselineValue, currentValue, threshold),
      );
    }

    return results;
  }

  private aggregateMetrics(
    metrics: PerformanceMetrics[],
  ): PerformanceMetrics | null {
    if (!metrics || metrics.length === 0) return null;

    // Calculate averages for all numeric metrics
    const aggregated: any = {
      metrics: {},
    };

    const metricSums: Record<string, { sum: number; count: number }> = {};

    for (const metric of metrics) {
      for (const [key, value] of Object.entries(metric.metrics)) {
        if (typeof value === 'number') {
          if (!metricSums[key]) {
            metricSums[key] = { sum: 0, count: 0 };
          }
          metricSums[key].sum += value;
          metricSums[key].count += 1;
        }
      }
    }

    for (const [key, data] of Object.entries(metricSums)) {
      aggregated.metrics[key] = data.sum / data.count;
    }

    return aggregated;
  }

  public generateReport(results: ComparisonResult[]): string {
    let report = '# Performance Comparison Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    const failures = results.filter((r) => r.status === 'fail');
    const warnings = results.filter((r) => r.status === 'warning');
    const improvements = results.filter((r) => r.status === 'improved');

    // Summary
    report += '## Summary\n';
    report += `- ✅ Passed: ${
      results.filter((r) => r.status === 'pass').length
    }\n`;
    report += `- ❌ Failed: ${failures.length}\n`;
    report += `- ⚠️  Warnings: ${warnings.length}\n`;
    report += `- 🚀 Improved: ${improvements.length}\n\n`;

    // Detailed results
    report += '## Detailed Results\n\n';
    report += '| Metric | Baseline | Current | Change | Status |\n';
    report += '|--------|----------|---------|--------|--------|\n';

    for (const result of results) {
      const baseline =
        result.baseline !== undefined ? `${result.baseline.toFixed(2)}` : 'N/A';
      const current =
        result.current !== undefined ? `${result.current.toFixed(2)}` : 'N/A';
      const change =
        result.percentageChange !== 0
          ? `${result.difference > 0 ? '+' : ''}${result.difference.toFixed(
              2,
            )} (${result.percentageChange.toFixed(1)}%)`
          : '-';

      const statusEmoji = {
        pass: '✅',
        fail: '❌',
        warning: '⚠️',
        improved: '🚀',
      }[result.status];

      report += `| ${result.metric} | ${baseline} | ${current} | ${change} | ${statusEmoji} |\n`;
    }

    // Failures detail
    if (failures.length > 0) {
      report += '\n## ❌ Failed Metrics\n\n';
      for (const failure of failures) {
        report += `### ${failure.metric}\n`;
        report += `- Baseline: ${failure.baseline}\n`;
        report += `- Current: ${failure.current}\n`;
        report += `- Regression: +${failure.difference.toFixed(
          2,
        )} (${failure.percentageChange.toFixed(1)}%)\n`;
        if (failure.threshold) {
          report += `- Threshold: ${failure.threshold.absolute} absolute or ${failure.threshold.percentage}% relative\n`;
        }
        report += '\n';
      }
    }

    return report;
  }

  public saveReport(results: ComparisonResult[], outputPath?: string): void {
    const report = this.generateReport(results);
    const reportPath = outputPath || path.join(process.cwd(), 'perf-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`Report saved to: ${reportPath}`);
  }

  public exitWithStatus(results: ComparisonResult[]): void {
    const hasFailures = results.some((r) => r.status === 'fail');
    if (hasFailures) {
      console.error('❌ Performance regressions detected!');
      process.exit(1);
    } else {
      console.log('✅ All performance checks passed!');
      process.exit(0);
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const baselinePath = args[0] || 'perf-baseline.json';
  const currentPath = args[1] || 'perf-results.json';
  const flowName = args[2];

  if (!fs.existsSync(baselinePath)) {
    console.error(`Baseline file not found: ${baselinePath}`);
    console.log('Creating initial baseline from current results...');

    if (fs.existsSync(currentPath)) {
      fs.copyFileSync(currentPath, baselinePath);
      console.log(`Baseline created: ${baselinePath}`);
    } else {
      console.error('No current results found. Run performance tests first.');
      process.exit(1);
    }
  }

  if (!fs.existsSync(currentPath)) {
    console.error(`Current results file not found: ${currentPath}`);
    process.exit(1);
  }

  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
  const current = JSON.parse(fs.readFileSync(currentPath, 'utf-8'));

  const comparator = new PerformanceComparator(baseline, current);
  const results = comparator.compare(flowName);

  // Print summary to console
  console.log(comparator.generateReport(results));

  // Save detailed report
  comparator.saveReport(results);

  // Exit with appropriate status code
  comparator.exitWithStatus(results);
}
