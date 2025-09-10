/* eslint-disable @typescript-eslint/no-explicit-any */
import { uuid4 } from '@sentry/core';

import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import {
  syncNetworksStore,
  syncStores,
} from '~/core/state/internal/syncStores';
import { localStorageRecycler } from '~/core/storage/localStorageRecycler';

import { handleDisconnect } from './handlers/handleDisconnect';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleOpenExtensionShortcut } from './handlers/handleOpenExtensionShortcut';
import { handlePrefetchDappMetadata } from './handlers/handlePrefetchMetadata';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { handleWallets } from './handlers/handleWallets';
import { startPopupRouter } from './procedures/popup';

require('../../core/utils/lockdown');

// Performance monitoring for tests only - passive collection
if (process.env.IS_TESTING === 'true') {
  (globalThis as any).__PERF_METRICS__ = {
    backgroundStartup: performance.now(),
  };
}

initializeSentry('background');
localStorageRecycler();

handleOpenExtensionShortcut();

startPopupRouter();

// Mark when popup router is ready - passive collection
if (process.env.IS_TESTING === 'true') {
  const metrics = (globalThis as any).__PERF_METRICS__ || {};
  metrics.popupRouterReady = performance.now();
  (globalThis as any).__PERF_METRICS__ = metrics;
}

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

handleInstallExtension();
handleProviderRequest({ inpageMessenger });
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();
handleWallets();
handleDisconnect();

syncNetworksStore('background');
syncStores();

uuid4();
