import { type Address, getAddress } from 'viem';

import type { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { logger } from '~/logger';

import { hyperliquidDappHook } from './hyperliquid';
import type { DappHook } from './types';

const DAPP_HOOKS: readonly DappHook[] = [hyperliquidDappHook];

const getMatchingDappHooks = (host: string) =>
  DAPP_HOOKS.filter((hook) => hook.matchesHost(host));

const getRequestAddress = (request: ProviderRequestPayload): Address | null => {
  switch (request.method) {
    case 'personal_sign':
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return getSigningRequestDisplayDetails(request).address;
    case 'eth_sendTransaction':
    case 'wallet_sendCalls': {
      const from = request.params?.[0];
      if (
        from &&
        typeof from === 'object' &&
        'from' in from &&
        typeof from.from === 'string'
      ) {
        return getAddress(from.from);
      }
      return null;
    }
    default:
      return null;
  }
};

export const runDappSessionAddedHooks = async ({
  address,
  host,
}: {
  address: Parameters<NonNullable<DappHook['onSessionAdded']>>[0]['address'];
  host: string;
}) => {
  const hooks = getMatchingDappHooks(host);
  await Promise.all(
    hooks.map(async (hook) => {
      try {
        await hook.onSessionAdded?.({ address, host });
      } catch (error) {
        logger.warn('Dapp session hook failed', {
          error: error instanceof Error ? error.message : String(error),
          host,
        });
      }
    }),
  );
};

export const runApprovedProviderRequestHooks = async (
  request: ProviderRequestPayload,
) => {
  const senderUrl = request.meta?.sender.url || '';
  const host = (isValidUrl(senderUrl) && getDappHost(senderUrl)) || '';
  if (!host) {
    return;
  }

  const address = getRequestAddress(request);
  if (!address) {
    return;
  }

  const hooks = getMatchingDappHooks(host);
  await Promise.all(
    hooks.map(async (hook) => {
      try {
        await hook.onApprovedProviderRequest?.({ address, host, request });
      } catch (error) {
        logger.warn('Dapp approved request hook failed', {
          error: error instanceof Error ? error.message : String(error),
          host,
          method: request.method,
        });
      }
    }),
  );
};
