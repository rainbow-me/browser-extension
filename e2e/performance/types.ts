// Performance metric types for consistency across the codebase

export interface PerformanceMetrics {
  domContentLoaded?: number;
  firstMeaningfulPaint?: number;
  loadScripts?: number;
  setupStore?: number;
  firstReactRender?: number;
  uiStartup?: number;
  memoryUsage?: number;
  flowDuration?: number;
  [key: string]: number | undefined;
}

export interface FlowMetrics {
  flow: 'cold-start' | 'warm-reload' | 'wallet-import';
  metrics: PerformanceMetrics;
}

export interface PerformanceResults {
  browser: string;
  browserVersion?: string;
  metrics: FlowMetrics[];
}

export interface BaselineConfig {
  version: string;
  description: string;
  lastUpdated: string;
  thresholds: {
    warning: number;
    critical: number;
  };
  chrome?: BaselineMetrics;
  firefox?: BaselineMetrics;
  [browser: string]:
    | BaselineMetrics
    | string
    | { warning: number; critical: number }
    | undefined;
}

export interface BaselineMetrics {
  coldStart?: PerformanceMetrics;
  warmReload?: PerformanceMetrics;
  walletImport?: PerformanceMetrics;
}

export type MetricStatus = 'pass' | 'warning' | 'critical';
