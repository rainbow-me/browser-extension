import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/message-port';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

import type { PopupRouter } from '~/entries/background/procedures/popup';

import { createDeepProxy } from './deepProxy';
import { autoReconnect } from './retry';

// Mutable reference to the latest client
const firstPort = chrome.runtime.connect();
let _popupClient: RouterClient<PopupRouter> = createORPCClient(
  new RPCLink({ port: firstPort }),
);

// stable export which uses a deep proxy to ensure the client is always up to date
export const popupClient: RouterClient<PopupRouter> = createDeepProxy(
  () => _popupClient,
);

autoReconnect(
  // Pass the initial port for reconnection logic
  'popup->background',
  firstPort,
  () => chrome.runtime.connect(),
  (newPort) => {
    _popupClient = createORPCClient(new RPCLink({ port: newPort }));
  },
);

export const popupClientQueryUtils = createTanstackQueryUtils(popupClient, {
  path: ['orpc'],
});
