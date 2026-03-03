/**
 * Portal host handler for viem-portal migration.
 * Subscribes to createTabTransportWithSender and processes provider requests.
 */
import type { PortalResponse } from 'viem-portal';

import {
  type PortalMessageWithSender,
  createTabTransportWithSender,
} from '~/core/provider/portalTransport';
import {
  type ProcessProviderRequestConfig,
  type ProviderResponse,
  processProviderRequest,
} from '~/core/provider/processProviderRequest';

function isPortalRequest(
  msg: unknown,
): msg is { type: 'request'; id: number; method: string; params?: unknown[] } {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'type' in msg &&
    (msg as { type: string }).type === 'request' &&
    'id' in msg &&
    'method' in msg
  );
}

function toPortalResponse(response: ProviderResponse): PortalResponse {
  if ('error' in response) {
    return {
      type: 'response',
      id: response.id,
      error: {
        code: response.error.code,
        message: response.error.message,
        data: response.error.name,
      },
    };
  }
  return {
    type: 'response',
    id: response.id,
    result: response.result,
  };
}

export function handlePortalHost(config: ProcessProviderRequestConfig) {
  const transport = createTabTransportWithSender();

  const unsubscribe = transport.subscribe(
    async (message: PortalMessageWithSender) => {
      if (!isPortalRequest(message)) return;

      const { _sender } = message;

      const meta = _sender
        ? {
            sender: {
              url: _sender.url,
              tab: _sender.tab
                ? { id: _sender.tab.id, title: _sender.tab.title }
                : undefined,
            },
            topic: 'providerRequest',
            id: message.id,
          }
        : undefined;

      // viem-portal EthRpcSchema uses eth_request with params [method, params]
      const [rpcMethod, rpcParams] =
        message.method === 'eth_request' && Array.isArray(message.params)
          ? (message.params as [string, unknown[]?])
          : [message.method, message.params];

      const input = {
        id: message.id,
        method: rpcMethod,
        params: rpcParams ?? [],
        meta,
      };

      try {
        const response = await processProviderRequest(input, config);
        transport.send(toPortalResponse(response));
      } catch (error) {
        transport.send(
          toPortalResponse({
            id: message.id,
            error: {
              code: -32603,
              message: error instanceof Error ? error.message : String(error),
              name: 'Internal error',
            },
          }),
        );
      }
    },
  );

  return () => {
    unsubscribe();
    transport.close?.();
  };
}
