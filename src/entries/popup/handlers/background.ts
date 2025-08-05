import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/message-port';
import type { RouterClient } from '@orpc/server';

import { PopupRouter } from '~/entries/background/procedures/popup';

const port = chrome.runtime.connect();
const link = new RPCLink({ port });

export const popupClient: RouterClient<PopupRouter> = createORPCClient(link);
