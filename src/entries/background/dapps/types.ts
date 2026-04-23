import type { Address } from 'viem';

import type { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';

export type DappHookContext = {
  address: Address;
  host: string;
};

export type DappApprovedProviderRequestContext = DappHookContext & {
  request: ProviderRequestPayload;
};

export type DappHook = {
  matchesHost: (host: string) => boolean;
  onApprovedProviderRequest?: (
    context: DappApprovedProviderRequestContext,
  ) => Promise<void> | void;
  onSessionAdded?: (context: DappHookContext) => Promise<void> | void;
};
