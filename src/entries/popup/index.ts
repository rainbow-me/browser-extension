import './global.css';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

// Initialize mocks BEFORE any other imports that might trigger fetches
if (process.env.IS_TESTING === 'true') {
  console.log(
    '[Popup] IS_TESTING is true, initializing mockFetch synchronously...',
  );
  try {
    // Use require instead of dynamic import for synchronous loading
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { mockFetch } = require('../../../e2e/mockFetch');
    mockFetch();
    console.log('[Popup] mockFetch initialized successfully');
  } catch (e) {
    console.error('[Popup] Failed to initialize mockFetch:', e);
  }
}

import {
  syncNetworksStore,
  syncStores,
} from '~/core/state/internal/syncStores';
import { initThemingLocal } from '~/design-system/styles/initThemingLocal';

import { App } from './App';

require('../../core/utils/lockdown');

initThemingLocal();
syncStores();
syncNetworksStore('popup');

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);
root.render(createElement(App));
