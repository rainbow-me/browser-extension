/* eslint-disable @typescript-eslint/no-explicit-any */
import './fcm';
import { initializeApp } from 'firebase/app';
import {
  fetchAndActivate,
  getAll,
  getRemoteConfig,
  isSupported,
} from 'firebase/remote-config';

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
  points_enabled: boolean;
  defi_positions_enabled: boolean;
  rewards_enabled: boolean;
  rewards_bridging_enabled: boolean;
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
  points_enabled: true,
  nfts_enabled: false,
  defi_positions_enabled: false,
  rewards_enabled: true,
  rewards_bridging_enabled: true,
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

// Initialize with defaults in case firebase doesn't respond
const config: RainbowConfig = { ...DEFAULT_CONFIG, status: 'loading' };

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
            key === 'BX_points_enabled' ||
            key === 'BX_defi_positions_enabled' ||
            key === 'BX_rewards_enabled' ||
            key === 'BX_rewards_bridging_enabled' ||
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
