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

// Performance monitoring for tests only
let perfCollector: any;
if (process.env.IS_TESTING === 'true') {
  await import('../../../scripts/perf/startup-metrics').then((module) => {
    perfCollector = module.getStartupCollector();
    perfCollector.markScriptsLoaded();
    console.log('[PERF] Popup scripts loaded');
  });
}

initThemingLocal();

// Mark store setup
if (process.env.IS_TESTING === 'true' && perfCollector) {
  perfCollector.mark('store:begin');
}

syncStores();
syncNetworksStore('popup');

// if (process.env.IS_TESTING === 'true' && perfCollector) {
//   perfCollector.markStoreSetup();

//   // Try to measure background connection
// This is approximate - real measurement would need to track actual message passing
//   const backgroundReady = new Promise((resolve) => {
//     chrome.runtime.sendMessage({ type: 'ping' }, () => {
//       resolve(true);
//     });
//   });

//   backgroundReady?.then(() => {
//     perfCollector?.markBackgroundConnected();
//   });
// }

if (process.env.IS_TESTING === 'true') {
  await import('../../../e2e/mockFetch').then((m) => m.mockFetch());
}

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);

// Mark before React render
if (process.env.IS_TESTING === 'true' && perfCollector) {
  perfCollector.mark('react:beforeRender');
}

root.render(createElement(App));

// Mark first render (this is approximate, actual render is async)
if (process.env.IS_TESTING === 'true' && perfCollector) {
  // Use requestAnimationFrame to approximate when render completes
  requestAnimationFrame(() => {
    perfCollector?.markFirstRender();
    perfCollector?.markUIReady();

    // Export metrics to console for collection
    const metrics = perfCollector?.getAllMetrics();
    console.log('[PERF] Startup metrics:', JSON.stringify(metrics, null, 2));

    // Store metrics in window for test collection
    (window as any).__PERF_METRICS__ = metrics;
  });
}
