import { Chain } from 'viem/chains';

import { BackendNetworks, UserPreferences } from '~/core/types/chains';
import { ChainId } from '~/core/types/chains';
import { NetworkState } from './networks';

const RPC_PROXY_API_KEY = process.env.RPC_PROXY_API_KEY;

export const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000;

const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${RPC_PROXY_API_KEY}`;
};

export function toChainId(id: string): ChainId {
  return parseInt(id, 10);
}

/**
 * Converts an object to a string hash
 * 
 * **IMPORTANT: The delimiter should not appear in any of the object values**
 * @param obj - The object to convert to a hash
 * @param delimiter - The delimiter to use between the object values
 * @returns The hash of the object
 */
const toHash = <T extends object>(obj: T, delimiter = '----'): string => Object.values(obj).join(delimiter);

/**
 * Maps provide O(1) insertion and lookup time.
 * Therefore this can be solved in O(n) (and not O(n²) like most solutions).
 * For that, it is necessary to generate a unique primitive (string / number)
 * key for each object.
 * 
 * Using `toHash` we take a delimiter that does not appear in any of the values and compose a string.
 * Then a Map gets created. For difference: when an element exists already in the Map, it gets removed, 
 * otherwise it gets added. Therefore only the elements that are included odd times (meaning only once) remain.
 * For union: when an element exists already in the Map, it is kept, otherwise it gets added.
 * This will only work if the elements are unique in each array unlike lodash's `differenceBy`.
 */
export function differenceOrUnionOf<T extends object, K extends keyof T | undefined = undefined>({
  existing,
  incoming,
  valueKey,
  method = 'difference',
}: {
  existing: T[],
  incoming: T[],
  valueKey?: K,
  method?: 'difference' | 'union',
}): Map<string, K extends keyof T ? T[K] : T> {
  const entries = new Map();

  for(const el of [...existing, ...incoming]) {
    const key = toHash(el);
    switch (method) {
      case 'union':
        entries.set(key, valueKey ? el[valueKey] : el);
        break;
      case 'difference':
        if(entries.has(key)) {
          entries.delete(key);
        } else {
          entries.set(key, valueKey ? el[valueKey] : el);
        }
        break;
    }
  }
  
  return entries as Map<string, K extends keyof T ? T[K] : T>;
}

import { useRainbowChainsStore } from '~/core/state/rainbowChains';
import { useUserChainsStore } from '~/core/state/userChains';
import { GasSpeed } from '~/core/types/gas';

export const buildInitialUserPreferences = (): Partial<Record<ChainId, UserPreferences>> => {
  const userOverrides: Partial<Record<ChainId, UserPreferences>> = {};

  const rainbowChains = useRainbowChainsStore.getState().rainbowChains;
  const { userChains, userChainsOrder } = useUserChainsStore.getState();

  for (const chainId of Object.keys(rainbowChains)) {
    const chainIdNum = toChainId(chainId);
    const chain = rainbowChains[chainIdNum];

    if (!userOverrides[chainIdNum]) {
      userOverrides[chainIdNum] = {} as UserPreferences;
    }

    userOverrides[chainIdNum].activeRpcUrl = chain.activeRpcUrl;
    userOverrides[chainIdNum].enabled = userChains[chainIdNum] ?? false;
    userOverrides[chainIdNum].order = userChainsOrder[chainIdNum];

    let rpcs: Record<string, Chain> = {};
    // construct RPCs
    for (const c of chain.chains) {
      const rpcUrl = c.rpcUrls.default.http[0];
      rpcs[rpcUrl] = c;
    }

    userOverrides[chainIdNum].rpcs = rpcs;
  }

  return userOverrides;
}

/**
 * Updates user preferences for newly supported backend-driven networks.
 * For each new network, it enables the network and sets its active RPC URL
 * to the backend's default RPC endpoint.
 * 
 * @param state - Current network state containing user overrides
 * @param diff - Map of new networks keyed by chain ID, containing network config from backend
 * @returns Updated user overrides with enabled networks and default RPC URLs
 */
export const modifyUserPreferencesForNewlySupportedNetworks = (state: NetworkState, diff: Map<string, BackendNetworks['networks'][number]>) => {
  const userOverrides = { ...state.userOverrides };

  for (const chainId of diff.keys()) {
    const chainIdNum = toChainId(chainId);
    const incoming = diff.get(chainId);

    if (!incoming || !userOverrides[chainIdNum]) continue;

    const defaultRpcUrl = proxyBackendNetworkRpcEndpoint(incoming.defaultRPC.url);

    userOverrides[chainIdNum] = {
      ...userOverrides[chainIdNum],
      enabled: true,
      activeRpcUrl: defaultRpcUrl
    }
  }

  return userOverrides;
}

/** -----------------------------------------------------------------------------------
 *  Backend networks helper functions.
 *  Some of these defaults, e.g. gas speeds, should eventually come from the backend.
 * ------------------------------------------------------------------------------------*/

export function getDefaultGasSpeeds(chainId: ChainId): GasSpeed[] {
  switch (chainId) {
    case ChainId.bsc:
    case ChainId.polygon:
      return [GasSpeed.NORMAL, GasSpeed.FAST, GasSpeed.URGENT];
    case ChainId.gnosis:
      return [GasSpeed.NORMAL];
    default:
      return [GasSpeed.NORMAL, GasSpeed.FAST, GasSpeed.URGENT, GasSpeed.CUSTOM];
  }
}

export function getDefaultPollingInterval(chainId: ChainId): number {
  switch (chainId) {
    case ChainId.polygon:
      return 2_000;
    case ChainId.arbitrum:
    case ChainId.bsc:
      return 3_000;
    default:
      return 5_000;
  }
}
