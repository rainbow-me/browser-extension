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

// Performance monitoring for tests only
let perfCollector: any;
if (process.env.IS_TESTING === 'true') {
  import('../../../scripts/perf/startup-metrics').then((module) => {
    perfCollector = module.getStartupCollector();
    perfCollector.mark('background:start');
    console.log('[PERF] Background script started');
  });
}

initializeSentry('background');
localStorageRecycler();

handleOpenExtensionShortcut();

startPopupRouter();

// Mark when popup router is ready
if (process.env.IS_TESTING === 'true' && perfCollector) {
  perfCollector.mark('background:popupRouterReady');
  console.log('[PERF] Popup router ready');
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
