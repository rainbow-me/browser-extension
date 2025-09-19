import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/message-port';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

import type { PopupRouter } from '~/entries/background/procedures/popup';
import { POPUP_PORT_NAME } from '~/entries/background/procedures/popup/constants';

import { createDeepProxy } from './deepProxy';
import { autoReconnect } from './retry';

function createPort() {
  return chrome.runtime.connect({ name: POPUP_PORT_NAME });
}

// Mutable reference to the latest client
const firstPort = createPort();
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
  createPort,
  (newPort) => {
    _popupClient = createORPCClient(new RPCLink({ port: newPort }));
  },
);

export const popupClientQueryUtils = createTanstackQueryUtils(popupClient, {
  path: ['orpc'],
});
