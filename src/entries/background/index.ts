import { uuid4 } from '@sentry/core';

import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { migrateStorage } from '~/core/state/currentSettings/migrate';
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

initializeSentry('background');
migrateStorage();
localStorageRecycler();

handleOpenExtensionShortcut();

startPopupRouter();

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
