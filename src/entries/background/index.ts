import { uuid4 } from '@sentry/core';

import { initializeMessenger } from '~/core/messengers';
import { setupDelegationClient } from '~/core/resources/delegations/setup';
import { initializeSentry } from '~/core/sentry';
import { localStorageRecycler } from '~/core/storage/localStorageRecycler';

import { createPortalHostConfig } from './handlers/createPortalHostConfig';
import { handleAutoLock } from './handlers/handleAutoLock';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleOpenExtensionShortcut } from './handlers/handleOpenExtensionShortcut';
import { handlePortalHost } from './handlers/handlePortalHost';
import { handlePrefetchDappMetadata } from './handlers/handlePrefetchMetadata';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { handleWallets } from './handlers/handleWallets';
import { startPopupRouter } from './procedures/popup';

require('../../core/utils/lockdown');

initializeSentry('background');
localStorageRecycler();

handleOpenExtensionShortcut();

// Configure delegation SDK - required before execute_rap, revokeDelegation etc.
setupDelegationClient();

startPopupRouter();

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

handleInstallExtension();
handlePortalHost(createPortalHostConfig(inpageMessenger));
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();
handleWallets();
handleAutoLock();

uuid4();
