import { uuid4 } from '@sentry/core';

import { initializeSentry } from '~/core/sentry';
import { localStorageRecycler } from '~/core/storage/localStorageRecycler';

import { handleAutoLock } from './handlers/handleAutoLock';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleOpenExtensionShortcut } from './handlers/handleOpenExtensionShortcut';
import { handlePrefetchDappMetadata } from './handlers/handlePrefetchMetadata';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { startPopupRouter } from './procedures/popup';

require('../../core/utils/lockdown');

initializeSentry('background');
localStorageRecycler();

handleOpenExtensionShortcut();

startPopupRouter();

// Initialize handlers
handleInstallExtension();
handleProviderRequest();
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();

handleAutoLock();

uuid4();
