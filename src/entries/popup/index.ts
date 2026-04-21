import './global.css';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { setupDelegationClient } from '~/core/resources/delegations/setup';
import { setupSwapsClient } from '~/core/resources/swaps/setup';
import { initThemingLocal } from '~/design-system/styles/initThemingLocal';

import { App } from './App';
import { setupPendingTransactionCleanup } from './pendingTransactionCleanup';

require('../../core/utils/lockdown');

initThemingLocal();

if (process.env.IS_TESTING === 'true') {
  await import('../../../e2e/mockFetch').then((m) => m.mockFetch());
}

// Configure delegation SDK before render
setupDelegationClient();

// Point swaps SDK at staging for this test build
setupSwapsClient();

setupPendingTransactionCleanup();

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);
root.render(createElement(App));
