/**
 * Startup performance metrics collection
 * Based on MetaMask's approach but adapted for Rainbow extension
 */

export interface StartupMetrics {
  // Core timing metrics
  uiStartup?: number; // Total time from start to UI ready
  domContentLoaded?: number;
  domInteractive?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;

  // Extension-specific metrics
  backgroundConnect?: number; // Time to connect to background script
  loadScripts?: number; // Time to load all scripts
  setupStore?: number; // Time to setup state management
  getState?: number; // Time to get initial state
  initialActions?: number; // Time for initial actions
  firstReactRender?: number; // Time to first React render
}

export class StartupPerformanceCollector {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();
  private startTime: number;

  constructor() {
    this.startTime = performance.now();

    // Mark the start of the session
    this.mark('startup:begin');
  }

  /**
   * Mark a point in time
   */
  mark(name: string): void {
    const time = performance.now();
    this.marks.set(name, time);

    // Also use native Performance API if available
    if (typeof performance.mark === 'function') {
      performance.mark(name);
    }
  }

  /**
   * Measure duration between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }

    const duration = (end || performance.now()) - start;
    this.measures.set(name, duration);

    // Also use native Performance API if available
    if (typeof performance.measure === 'function' && endMark) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {
        // Marks might not exist in Performance API
      }
    }

    return duration;
  }

  /**
   * Get navigation timing metrics
   */
  getNavigationMetrics(): Partial<StartupMetrics> {
    const metrics: Partial<StartupMetrics> = {};

    if (
      typeof window !== 'undefined' &&
      window.performance &&
      window.performance.timing
    ) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart || this.startTime;

      if (timing.domContentLoadedEventEnd > 0) {
        metrics.domContentLoaded =
          timing.domContentLoadedEventEnd - navigationStart;
      }

      if (timing.domInteractive > 0) {
        metrics.domInteractive = timing.domInteractive - navigationStart;
      }
    }

    // Get paint timing if available
    if (
      typeof window !== 'undefined' &&
      window.performance &&
      window.performance.getEntriesByType
    ) {
      const paintEntries = window.performance.getEntriesByType('paint');

      const firstPaint = paintEntries.find(
        (entry) => entry.name === 'first-paint',
      );
      if (firstPaint) {
        metrics.firstPaint = Math.round(firstPaint.startTime);
      }

      const firstContentfulPaint = paintEntries.find(
        (entry) => entry.name === 'first-contentful-paint',
      );
      if (firstContentfulPaint) {
        metrics.firstContentfulPaint = Math.round(
          firstContentfulPaint.startTime,
        );
      }
    }

    return metrics;
  }

  /**
   * Track background script connection
   */
  markBackgroundConnected(): void {
    this.mark('background:connected');
    const duration = this.measure(
      'backgroundConnect',
      'startup:begin',
      'background:connected',
    );
    console.log(`Background connected in ${duration}ms`);
  }

  /**
   * Track script loading completion
   */
  markScriptsLoaded(): void {
    this.mark('scripts:loaded');
    const duration = this.measure(
      'loadScripts',
      'startup:begin',
      'scripts:loaded',
    );
    console.log(`Scripts loaded in ${duration}ms`);
  }

  /**
   * Track store setup completion
   */
  markStoreSetup(): void {
    this.mark('store:setup');
    const duration = this.measure('setupStore', 'startup:begin', 'store:setup');
    console.log(`Store setup in ${duration}ms`);
  }

  /**
   * Track initial state retrieval
   */
  markStateLoaded(): void {
    this.mark('state:loaded');
    const duration = this.measure('getState', 'store:setup', 'state:loaded');
    console.log(`State loaded in ${duration}ms`);
  }

  /**
   * Track initial actions completion
   */
  markInitialActionsComplete(): void {
    this.mark('actions:initial');
    const duration = this.measure(
      'initialActions',
      'state:loaded',
      'actions:initial',
    );
    console.log(`Initial actions completed in ${duration}ms`);
  }

  /**
   * Track first React render
   */
  markFirstRender(): void {
    this.mark('react:firstRender');
    const duration = this.measure(
      'firstReactRender',
      'scripts:loaded',
      'react:firstRender',
    );
    console.log(`First React render in ${duration}ms`);
  }

  /**
   * Mark UI as fully ready
   */
  markUIReady(): void {
    this.mark('ui:ready');
    const duration = this.measure('uiStartup', 'startup:begin', 'ui:ready');
    console.log(`UI ready in ${duration}ms`);
  }

  /**
   * Get all collected metrics
   */
  getAllMetrics(): StartupMetrics {
    const navMetrics = this.getNavigationMetrics();
    const customMetrics: StartupMetrics = {};

    // Add our custom measures
    for (const [key, value] of this.measures.entries()) {
      customMetrics[key as keyof StartupMetrics] = Math.round(value);
    }

    return {
      ...navMetrics,
      ...customMetrics,
    };
  }

  /**
   * Export metrics for reporting
   */
  exportMetrics(): string {
    const metrics = this.getAllMetrics();
    return JSON.stringify(metrics, null, 2);
  }
}

// Singleton instance for use across the extension
let collectorInstance: StartupPerformanceCollector | null = null;

export function getStartupCollector(): StartupPerformanceCollector {
  if (!collectorInstance) {
    collectorInstance = new StartupPerformanceCollector();
  }
  return collectorInstance;
}

export function resetStartupCollector(): void {
  collectorInstance = null;
}
