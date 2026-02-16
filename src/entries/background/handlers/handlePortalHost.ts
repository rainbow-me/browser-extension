/**
 * handlePortalHost - Sets up the viem-portal host in background
 *
 * Handles incoming RPC requests from inpage via the portal transport.
 *
 * Uses a custom tab-aware transport because chrome.runtime.sendMessage()
 * from the service worker does NOT reach content scripts in MV3.
 * Responses must be routed via chrome.tabs.sendMessage(tabId, ...).
 */

import type { PortalHost, PortalMessage, Transport } from 'viem-portal';

import {
  ErrorCodes,
  type ProviderSchema,
  type RpcProvider,
  createPortalHost,
} from '~/core/provider/handleProviderPortal';
import type { ProviderRequestPayload } from '~/core/provider/types';
import { useAppSessionsStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';
import { getDappHost } from '~/core/utils/connectedApps';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { getViemClient } from '~/core/viem/clients';

let portalHost: PortalHost<ProviderSchema> | null = null;
let requestIdCounter = 100;

const PORTAL_ENVELOPE_TYPE = 'rainbow-portal';

interface PortalEnvelope {
  type: typeof PORTAL_ENVELOPE_TYPE;
  message: PortalMessage;
}

function isPortalEnvelope(data: unknown): data is PortalEnvelope {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === PORTAL_ENVELOPE_TYPE
  );
}

/**
 * Tab-aware transport for the background service worker.
 *
 * Receives portal messages via chrome.runtime.onMessage (from content scripts)
 * and routes responses back via chrome.tabs.sendMessage (to the originating tab).
 */
function createBackgroundTabTransport(): Transport {
  const handlers = new Set<(message: PortalMessage) => void>();
  const requestTabMap = new Map<number, number>();

  const listener = (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => {
    if (!isPortalEnvelope(message)) return false;

    const portalMsg = message.message;
    if (portalMsg.type === 'request' && sender.tab?.id != null) {
      requestTabMap.set(portalMsg.id, sender.tab.id);
      setTimeout(() => requestTabMap.delete(portalMsg.id), 120_000);
    }

    handlers.forEach((h) => h(portalMsg));
    sendResponse({});
    return true;
  };

  chrome.runtime.onMessage.addListener(listener);

  return {
    send(message: PortalMessage) {
      const envelope = { type: PORTAL_ENVELOPE_TYPE, message };

      if (message.type === 'response') {
        const tabId = requestTabMap.get(message.id);
        if (tabId != null) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          chrome.tabs.sendMessage(tabId, envelope).catch(() => {});
          requestTabMap.delete(message.id);
          return;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      chrome.runtime.sendMessage(envelope).catch(() => {});
    },
    subscribe(handler: (message: PortalMessage) => void) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close() {
      chrome.runtime.onMessage.removeListener(listener);
      handlers.clear();
      requestTabMap.clear();
    },
  };
}

const senderMap = new Map<number, chrome.runtime.MessageSender>();

function capturePortalSenders() {
  chrome.runtime.onMessage.addListener(
    (message: unknown, sender: chrome.runtime.MessageSender) => {
      if (!isPortalEnvelope(message)) return false;
      const msg = message.message;
      if (msg.type === 'request') {
        senderMap.set(msg.id, sender);
        setTimeout(() => senderMap.delete(msg.id), 60_000);
      }
      return false;
    },
  );
}

/**
 * Initialize the portal host for handling provider requests
 */
export function startPortalHost(): PortalHost<ProviderSchema> {
  if (portalHost) {
    return portalHost;
  }

  capturePortalSenders();

  const transport = createBackgroundTabTransport();

  portalHost = createPortalHost(
    {
      getActiveSession: (host: string) => {
        const session = useAppSessionsStore
          .getState()
          .getActiveSession({ host });
        if (session) {
          return {
            address: session.address,
            chainId: session.chainId,
          };
        }
        return null;
      },

      removeSession: (host: string) => {
        useAppSessionsStore.getState().removeAppSession({ host });
      },

      updateSessionChain: (host: string, chainId: number) => {
        useAppSessionsStore
          .getState()
          .updateActiveSessionChainId({ host, chainId });
      },

      resolveHost: (portalRequestId: number) => {
        const sender = senderMap.get(portalRequestId);
        return getDappHost(sender?.url) || '';
      },

      isSupportedChain: (chainId: number) => {
        return !!useNetworkStore.getState().getBackendSupportedChain(chainId);
      },

      getChainRpcUrl: (chainId: number) => {
        const chain = useNetworkStore.getState().getActiveRpcForChain(chainId);
        return chain?.rpcUrls.default.http[0];
      },

      addRpcForChain: (chainId: number, rpcUrl: string) => {
        const backendChain = useNetworkStore
          .getState()
          .getBackendSupportedChain(chainId);
        if (!backendChain) return;
        const chain = {
          id: chainId,
          name: backendChain.name,
          nativeCurrency: backendChain.nativeCurrency,
          rpcUrls: {
            default: { http: [rpcUrl] },
            public: { http: [rpcUrl] },
          },
        };
        useNetworkStore
          .getState()
          .addCustomChain(chainId, chain, rpcUrl, false);
      },

      requestApproval: async (request: {
        method: string;
        params?: unknown[];
        host: string;
        tabId?: number;
        portalRequestId?: number;
      }) => {
        const sender = request.portalRequestId
          ? senderMap.get(request.portalRequestId)
          : undefined;
        const tabId = request.tabId ?? sender?.tab?.id;

        requestIdCounter += 1;
        const id = requestIdCounter;
        const payload: ProviderRequestPayload = {
          id,
          method: request.method,
          params: request.params,
          meta: {
            sender: {
              url: sender?.url,
              tab: { id: tabId, title: sender?.tab?.title },
            },
            topic: 'provider_request',
          },
        };

        const { addPendingRequest, waitForPendingRequest } =
          usePendingRequestStore.getState();
        addPendingRequest(payload);

        if (tabId) {
          const popupUrl =
            chrome.runtime.getURL('popup.html') + `?tabId=${tabId}`;
          const window = await chrome.windows.create({
            url: popupUrl,
            type: 'popup',
            width: POPUP_DIMENSIONS.width,
            height: POPUP_DIMENSIONS.height,
          });
          useNotificationWindowStore
            .getState()
            .setNotificationWindow(String(tabId), window);
        }

        const result = await waitForPendingRequest(id);

        if (result.status === 'APPROVED') {
          return result.payload;
        }
        throw {
          code: ErrorCodes.USER_REJECTED,
          message: 'User rejected the request',
        };
      },

      // PublicClient.request() uses literal method types; we widen to arbitrary RPC forwarding
      getProvider: (chainId?: number) =>
        getViemClient({ chainId }) as RpcProvider,
    },
    transport,
  );

  return portalHost;
}

/**
 * Handler to initialize the portal host
 */
export function handlePortalHost(): void {
  startPortalHost();
}
