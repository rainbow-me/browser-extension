/* eslint-disable @typescript-eslint/no-explicit-any */
import './global.css';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import {
  syncNetworksStore,
  syncStores,
} from '~/core/state/internal/syncStores';
import { initThemingLocal } from '~/design-system/styles/initThemingLocal';

import { App } from './App';

require('../../core/utils/lockdown');

// Performance monitoring for tests only - passive collection
if (process.env.IS_TESTING === 'true') {
  (window as any).__PERF_METRICS__ = {
    scriptsLoaded: performance.now(),
  };
}

initThemingLocal();

// Mark store setup start
if (process.env.IS_TESTING === 'true') {
  const metrics = (window as any).__PERF_METRICS__ || {};
  metrics.storeSetupStart = performance.now();
  (window as any).__PERF_METRICS__ = metrics;
}

syncStores();
syncNetworksStore('popup');

// Mark store setup complete
if (process.env.IS_TESTING === 'true') {
  const metrics = (window as any).__PERF_METRICS__ || {};
  metrics.storeSetupEnd = performance.now();
  if (metrics.storeSetupStart) {
    metrics.setupStore = metrics.storeSetupEnd - metrics.storeSetupStart;
  }
  (window as any).__PERF_METRICS__ = metrics;
}

if (process.env.IS_TESTING === 'true') {
  await import('../../../e2e/mockFetch').then((m) => m.mockFetch());
}

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);

// Mark before React render
if (process.env.IS_TESTING === 'true') {
  const metrics = (window as any).__PERF_METRICS__ || {};
  metrics.beforeReactRender = performance.now();
  (window as any).__PERF_METRICS__ = metrics;
}

root.render(createElement(App));

// Mark first render (approximate - actual render is async)
if (process.env.IS_TESTING === 'true') {
  requestAnimationFrame(() => {
    const metrics = (window as any).__PERF_METRICS__ || {};
    const now = performance.now();

    // Calculate final metrics
    if (metrics.beforeReactRender) {
      metrics.firstReactRender = Math.round(now - metrics.beforeReactRender);
    }

    // Total UI startup time
    metrics.uiStartup = Math.round(now);

    // Round other metrics
    if (metrics.scriptsLoaded) {
      metrics.loadScripts = Math.round(metrics.scriptsLoaded);
    }
    if (metrics.setupStore) {
      metrics.setupStore = Math.round(metrics.setupStore);
    }

    // Clean up intermediate values
    delete metrics.storeSetupStart;
    delete metrics.storeSetupEnd;
    delete metrics.beforeReactRender;
    delete metrics.scriptsLoaded;

    (window as any).__PERF_METRICS__ = metrics;
    console.log('[PERF] Startup metrics:', metrics);
  });
}
