/* eslint-disable @typescript-eslint/no-explicit-any */
import './fcm';
import { initializeApp } from 'firebase/app';
import {
  fetchAndActivate,
  getAll,
  getRemoteConfig,
  isSupported,
} from 'firebase/remote-config';
import { useCallback, useSyncExternalStore } from 'react';

import { logger } from '~/logger';

import { useNetworkStore } from '../state/networks/networks';
import { ChainId } from '../types/chains';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY_BX,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN_BX,
  projectId: process.env.FIREBASE_PROJECT_ID_BX,
  appId: process.env.FIREBASE_APP_ID_BX,
};

export interface RainbowConfig extends Record<string, any> {
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

const DEFAULT_CONFIG = {
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
  // SWAPS
  default_slippage_bips: Object.values(
    useNetworkStore.getState().getBackendSupportedChains(true),
  ).reduce<Partial<Record<ChainId, number>>>((acc, chain) => {
    acc[chain.id] = defaultslippagInBips(chain.id);
    return acc;
  }, {}),
};

// Subscription management for reactive config updates
const configListeners = new Set<() => void>();

const notifyConfigChange = () => {
  configListeners.forEach((listener) => listener());
};

const subscribeToConfig = (listener: () => void) => {
  configListeners.add(listener);
  return () => configListeners.delete(listener);
};

// Initialize with defaults in case firebase doesn't respond
const configData: RainbowConfig = { ...DEFAULT_CONFIG, status: 'loading' };

// Proxy to intercept property sets and notify subscribers
const config: RainbowConfig = new Proxy(configData, {
  set(target, prop, value) {
    const key = prop as keyof RainbowConfig;
    if (target[key] !== value) {
      target[key] = value;
      notifyConfigChange();
    }
    return true;
  },
});

/**
 * React hook for reactive remote config values.
 * Re-renders when the specified config key changes.
 */
export function useRemoteConfig<K extends keyof RainbowConfig>(
  key: K,
): RainbowConfig[K] {
  const getSnapshot = useCallback(() => config[key], [key]);
  const value = useSyncExternalStore(
    subscribeToConfig,
    getSnapshot,
    getSnapshot,
  );
  return value;
}

export const init = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);

      // Initialize Remote Config and get a reference to the service
      const remoteConfig = getRemoteConfig(app);
      remoteConfig.settings.minimumFetchIntervalMillis = 120000;
      remoteConfig.defaultConfig = {
        ...DEFAULT_CONFIG,
        default_slippage_bips: JSON.stringify(
          DEFAULT_CONFIG.default_slippage_bips,
        ),
      };
      const fetchedRemotely = await fetchAndActivate(remoteConfig);

      if (fetchedRemotely) {
        logger.debug('Configs were retrieved from the backend and activated.');
      } else {
        logger.debug(
          'No configs were fetched from the backend, and the local configs were already activated',
        );
      }
      const parameters = getAll(remoteConfig);
      Object.entries(parameters).forEach(($) => {
        const [key, entry] = $;
        const realKey = key.replace('BX_', '');
        // Ignore non BX keys
        if (key.startsWith('BX_')) {
          if (key === 'BX_default_slippage_bips_chainId') {
            config['default_slippage_bips'] = JSON.parse(
              entry.asString(),
            ) as RainbowConfig['default_slippage_bips'];
          } else if (
            key === 'BX_send_enabled' ||
            key === 'BX_swaps_enabled' ||
            key === 'BX_tx_requests_enabled' ||
            key === 'BX_rpc_proxy_enabled' ||
            key === 'BX_hw_wallets_enabled' ||
            key === 'BX_custom_rpc_enabled' ||
            key === 'BX_rnbw_rewards_enabled' ||
            key === 'BX_defi_positions_enabled' ||
            key === 'BX_degen_mode_enabled' ||
            key === 'BX_nfts_enabled' ||
            key === 'BX_approvals_enabled'
          ) {
            config[realKey] = entry.asBoolean();
          } else {
            config[realKey] = entry.asString();
          }
        }
      });
    }
  } catch (e) {
    logger.info('Using default remote config');
    // most likely blocked by adblockers or dns
  } finally {
    config.status = 'ready';
    if (process.env.IS_DEV === 'true') {
      logger.info('Current remote config:', {
        config: JSON.stringify(config, null, 2),
      });
    }
  }
};

const loadedListeners = new Set<(config: RainbowConfig) => void>();
export const onConfigLoaded = (cb: (config: RainbowConfig) => void) => {
  loadedListeners.add(cb);
  return () => loadedListeners.delete(cb);
};

init().then(() => [...loadedListeners].forEach((cb) => cb(config)));

export default config;
