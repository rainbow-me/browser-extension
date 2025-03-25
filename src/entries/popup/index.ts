import './global.css';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { syncStores } from '~/core/state/internal/syncStores';
import { networksStoreMigrationStore } from '~/core/state/networks/migration';
import { initThemingLocal } from '~/design-system/styles/initThemingLocal';

import { App } from './App';

require('../../core/utils/lockdown');

initThemingLocal();

const initialNetworksMigrationState = networksStoreMigrationStore.getState();
if (initialNetworksMigrationState.didCompleteNetworksMigration) {
  syncStores();
} else {
  networksStoreMigrationStore.subscribe((state) => {
    if (state.didCompleteNetworksMigration) {
      syncStores();
    }
  });
}

if (process.env.IS_TESTING === 'true') {
  await import('../../../e2e/mockFetch').then((m) => m.mockFetch());
}

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);
root.render(createElement(App));
