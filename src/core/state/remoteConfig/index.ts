import { createQueryStore } from '@storesjs/stores';

import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';

import { type RawFetchedConfig, fetchRemoteConfig } from './fetcher';

export interface RainbowConfigBase extends Record<string, unknown> {
  // features
  send_enabled: boolean;
  swaps_enabled: boolean;
  tx_requests_enabled: boolean;
  rpc_proxy_enabled: boolean;
  hw_wallets_enabled: boolean;
  custom_rpc_enabled: boolean;
  rnbw_rewards_enabled: boolean;
  defi_positions_enabled: boolean;
  degen_mode_enabled: boolean;
  nfts_enabled: boolean;
  approvals_enabled: boolean;
  atomic_swaps_enabled: boolean;
  delegation_enabled: boolean;
  // SWAPS
  default_slippage_bips: Partial<Record<ChainId, number>>;
}

export const defaultslippagInBips = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.mainnet:
      return 100;
    case ChainId.bsc:
    case ChainId.polygon:
      return 200;
    default:
      return 500;
  }
};

const DEFAULT_CONFIG: RainbowConfigBase = {
  // features
  send_enabled: true,
  swaps_enabled: true,
  tx_requests_enabled: true,
  rpc_proxy_enabled: true,
  hw_wallets_enabled: true,
  custom_rpc_enabled: true,
  rnbw_rewards_enabled: false,
  nfts_enabled: false,
  defi_positions_enabled: false,
  degen_mode_enabled: true,
  approvals_enabled: false,
  atomic_swaps_enabled: true,
  delegation_enabled: true,
  // SWAPS
  default_slippage_bips: Object.values(
    useNetworkStore.getState().getBackendSupportedChains(true),
  ).reduce<Partial<Record<ChainId, number>>>((acc, chain) => {
    acc[chain.id] = defaultslippagInBips(chain.id);
    return acc;
  }, {}),
};

/** Decode raw Firebase strings into typed config; single source of truth for parsing */
function transformRawToConfig(
  raw: RawFetchedConfig,
): Partial<RainbowConfigBase> {
  const result: Partial<RainbowConfigBase> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === 'true') {
      (result as Record<string, unknown>)[key] = true;
    } else if (value === 'false') {
      (result as Record<string, unknown>)[key] = false;
    } else if (
      key === 'default_slippage_bips_chainId' &&
      value.startsWith('{')
    ) {
      result.default_slippage_bips = JSON.parse(
        value,
      ) as RainbowConfigBase['default_slippage_bips'];
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}

export const useRemoteConfigStore = createQueryStore<
  RawFetchedConfig,
  never,
  RainbowConfigBase
>(
  {
    fetcher: () => fetchRemoteConfig(DEFAULT_CONFIG),
    setData: ({ data, set }) =>
      set({
        ...DEFAULT_CONFIG,
        ...transformRawToConfig(data),
      }),
    staleTime: 120_000,
  },
  (): RainbowConfigBase => ({ ...DEFAULT_CONFIG }),
);
