/**
 * Performance monitoring utility for tracking extension performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

export interface PerformanceStats {
  mean: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  count: number;
}

// Added: precise types for memory-enabled Performance and exported metrics
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory: PerformanceMemory;
}

function hasMemory(perf: Performance): perf is PerformanceWithMemory {
  return typeof (perf as Partial<PerformanceWithMemory>).memory !== 'undefined';
}

interface ExportedResourceMetric {
  name: string;
  duration: number;
  type: string;
  size: number;
}

interface ExportedNavigationMetrics {
  domContentLoaded?: number;
  loadComplete?: number;
  domInteractive?: number;
  responseTime?: number;
}

interface ExportedMemoryMetrics extends PerformanceMemory {
  usagePercentage: number;
}

interface ExportedMetrics {
  timestamp: number;
  metrics: Record<string, PerformanceStats>;
  navigation: ExportedNavigationMetrics;
  paint: Record<string, number>;
  resources: ExportedResourceMetric[];
  memory?: ExportedMemoryMetrics;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private marks: Map<string, number> = new Map();
  private enabled: boolean;

  private constructor() {
    // Only enable in development or when explicitly enabled
    this.enabled =
      process.env.NODE_ENV === 'development' ||
      process.env.ENABLE_PERFORMANCE_MONITORING === 'true';

    if (this.enabled) {
      this.setupPerformanceObserver();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start measuring a specific operation
   */
  startMeasure(name: string): () => void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (!this.enabled) return () => {};

    const startMark = `${name}-start`;
    performance.mark(startMark);
    this.marks.set(startMark, performance.now());

    return () => {
      const endMark = `${name}-end`;
      performance.mark(endMark);

      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name, 'measure');
        if (measures.length > 0) {
          const duration = measures[measures.length - 1].duration;
          this.recordMetric(name, duration);
        }
      } catch (error) {
        console.error(`Failed to measure ${name}:`, error);
      }

      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
    };
  }

  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number) {
    if (!this.enabled) return;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${name}: ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Mark a specific point in time
   */
  mark(name: string) {
    if (!this.enabled) return;

    performance.mark(name);
    this.marks.set(name, performance.now());
  }

  /**
   * Measure between two marks
   */
  measureBetween(name: string, startMark: string, endMark: string) {
    if (!this.enabled) return;

    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[measures.length - 1].duration;
        this.recordMetric(name, duration);
      }
    } catch (error) {
      console.error(
        `Failed to measure between ${startMark} and ${endMark}:`,
        error,
      );
    }
  }

  /**
   * Get statistics for a specific metric
   */
  getStats(name: string): PerformanceStats | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      mean: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95:
        sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1],
      p99:
        sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      count: values.length,
    };
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): Map<string, PerformanceStats> {
    const allStats = new Map<string, PerformanceStats>();

    for (const [name] of this.metrics) {
      const stats = this.getStats(name);
      if (stats) {
        allStats.set(name, stats);
      }
    }

    return allStats;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.marks.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): ExportedMetrics {
    const exported: ExportedMetrics = {
      timestamp: Date.now(),
      metrics: {},
      navigation: {},
      paint: {},
      resources: [],
    };

    // Export custom metrics
    for (const [name, stats] of this.getAllMetrics()) {
      exported.metrics[name] = stats;
    }

    // Export navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navigation) {
      exported.navigation = {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        responseTime: navigation.responseEnd - navigation.requestStart,
      };
    }

    // Export paint timing
    const paints = performance.getEntriesByType('paint');
    exported.paint = paints.reduce((acc: Record<string, number>, paint) => {
      acc[paint.name] = paint.startTime;
      return acc;
    }, {});

    // Export slow resources
    const resources = performance.getEntriesByType(
      'resource',
    ) as PerformanceResourceTiming[];
    exported.resources = resources
      .filter((r) => r.duration > 100) // Only include slow resources
      .map((r) => ({
        name: r.name,
        duration: r.duration,
        type: r.initiatorType,
        size: r.transferSize,
      }))
      .slice(0, 10); // Limit to top 10 slow resources

    // Memory usage (Chrome only)
    if (hasMemory(performance)) {
      const { memory } = performance;
      exported.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }

    return exported;
  }

  /**
   * Setup performance observer for automatic tracking
   */
  private setupPerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Auto-track long tasks
          if (entry.entryType === 'longtask' && entry.duration > 50) {
            this.recordMetric('longtask', entry.duration);
            console.warn(
              `[PERF] Long task detected: ${entry.duration.toFixed(2)}ms`,
            );
          }

          // Auto-track layout shifts
          if (entry.entryType === 'layout-shift') {
            type LayoutShiftEntry = PerformanceEntry & { value: number };
            if ('value' in (entry as LayoutShiftEntry)) {
              const shift = (entry as LayoutShiftEntry).value;
              if (shift > 0.1) {
                this.recordMetric('layout-shift', shift);
              }
            }
          }
        }
      });

      // Observe long tasks and layout shifts
      const supportedTypes = PerformanceObserver.supportedEntryTypes || [];
      const typesToObserve: string[] = [];

      if (supportedTypes.includes('longtask')) {
        typesToObserve.push('longtask');
      }
      if (supportedTypes.includes('layout-shift')) {
        typesToObserve.push('layout-shift');
      }

      if (typesToObserve.length > 0) {
        observer.observe({ entryTypes: typesToObserve });
      }
    } catch (error) {
      console.error('Failed to setup PerformanceObserver:', error);
    }
  }

  /**
   * Log a performance report to console
   */
  logReport() {
    if (!this.enabled) return;

    console.group('📊 Performance Report');

    const metrics = this.exportMetrics();

    // Log navigation metrics
    if (metrics.navigation && Object.keys(metrics.navigation).length > 0) {
      console.group('Navigation Timing');
      for (const [key, value] of Object.entries(metrics.navigation)) {
        console.log(`${key}: ${(value as number).toFixed(2)}ms`);
      }
      console.groupEnd();
    }

    // Log paint metrics
    if (metrics.paint && Object.keys(metrics.paint).length > 0) {
      console.group('Paint Timing');
      for (const [key, value] of Object.entries(metrics.paint)) {
        console.log(`${key}: ${(value as number).toFixed(2)}ms`);
      }
      console.groupEnd();
    }

    // Log custom metrics
    if (metrics.metrics && Object.keys(metrics.metrics).length > 0) {
      console.group('Custom Metrics');
      for (const [name, stats] of Object.entries(metrics.metrics)) {
        const s = stats as PerformanceStats;
        console.log(`${name}:`, {
          mean: `${s.mean.toFixed(2)}ms`,
          median: `${s.median.toFixed(2)}ms`,
          p95: `${s.p95.toFixed(2)}ms`,
          min: `${s.min.toFixed(2)}ms`,
          max: `${s.max.toFixed(2)}ms`,
          count: s.count,
        });
      }
      console.groupEnd();
    }

    // Log memory usage
    if (metrics.memory) {
      console.group('Memory Usage');
      console.log(
        `Used: ${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(
        `Total: ${(metrics.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(
        `Limit: ${(metrics.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      );
      console.log(`Usage: ${metrics.memory.usagePercentage.toFixed(2)}%`);
      console.groupEnd();
    }

    // Log slow resources
    if (metrics.resources && metrics.resources.length > 0) {
      console.group('Slow Resources (>100ms)');
      metrics.resources.forEach((r: ExportedResourceMetric) => {
        console.log(
          `${r.type}: ${r.name.substring(0, 50)}... (${r.duration.toFixed(
            2,
          )}ms)`,
        );
      });
      console.groupEnd();
    }

    console.groupEnd();
  }
}

// Export singleton instance
export const perfMonitor = PerformanceMonitor.getInstance();
