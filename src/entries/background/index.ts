import { uuid4 } from '@sentry/core';

import { initializeMessenger } from '~/core/messengers';
import { setupDelegationClient } from '~/core/resources/delegations/setup';
import { setupSwapsClient } from '~/core/resources/swaps/setup';
import { initializeSentry } from '~/core/sentry';
import { useBatchStore } from '~/core/state';
import { localStorageRecycler } from '~/core/storage/localStorageRecycler';

import { handleAutoLock } from './handlers/handleAutoLock';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleOpenExtensionShortcut } from './handlers/handleOpenExtensionShortcut';
import { handlePrefetchDappMetadata } from './handlers/handlePrefetchMetadata';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { handleWallets } from './handlers/handleWallets';
import { handleWatchPendingTransactions } from './handlers/handleWatchPendingTransactions';
import { startPopupRouter } from './procedures/popup';

require('../../core/utils/lockdown');

initializeSentry('background');
localStorageRecycler();

handleOpenExtensionShortcut();

// Configure delegation SDK - required before execute_rap, revokeDelegation etc.
setupDelegationClient();

// Point swaps SDK at staging for this test build
setupSwapsClient();

startPopupRouter();

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

handleInstallExtension();
handleProviderRequest({ inpageMessenger });
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();
handleWallets();
handleAutoLock();
handleWatchPendingTransactions();

useBatchStore.getState().evictExpiredBatches();

uuid4();
