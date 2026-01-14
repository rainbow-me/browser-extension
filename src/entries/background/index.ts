import { uuid4 } from '@sentry/core';

import { initializeMessenger } from '~/core/messengers';
import { setupDelegationClient } from '~/core/resources/delegations/setup';
import { initializeSentry } from '~/core/sentry';
import { localStorageRecycler } from '~/core/storage/localStorageRecycler';

import { handleAutoLock } from './handlers/handleAutoLock';
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
localStorageRecycler();

handleOpenExtensionShortcut();

// Register delegation config (doesn't import SDK - just stores config)
// SDK will be loaded lazily when delegation functions are first used
//
// MIGRATION NOTE: When switching to direct imports, setupDelegationClient()
// will call configure() synchronously, but this call site doesn't need to change
setupDelegationClient();
startPopupRouter();

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

handleInstallExtension();
handleProviderRequest({ inpageMessenger });
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();
handleWallets();
handleAutoLock();

uuid4();
