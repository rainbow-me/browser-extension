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

initThemingLocal();
syncStores();
syncNetworksStore('popup');

if (process.env.IS_TESTING === 'true') {
  console.log('[Popup] IS_TESTING is true, initializing mockFetch...');
  await import('../../../e2e/mockFetch')
    .then((m) => {
      console.log('[Popup] mockFetch module loaded');
      m.mockFetch();
      console.log('[Popup] mockFetch initialized');
    })
    .catch((e) => {
      console.error('[Popup] Failed to load mockFetch:', e);
    });
} else {
  console.log('[Popup] IS_TESTING is not true:', process.env.IS_TESTING);
}

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);
root.render(createElement(App));
