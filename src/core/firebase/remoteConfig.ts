/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from 'firebase/app';
import {
  fetchAndActivate,
  getAll,
  getRemoteConfig,
  isSupported,
} from 'firebase/remote-config';

import { RainbowError, logger } from '~/logger';

import { ChainName } from '../types/chains';

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
  flashbots_enabled: boolean;
  rpc_proxy_enabled: boolean;
  points_enabled: boolean;
  defi_positions_enabled: boolean;
  rewards_enabled: boolean;
  rewards_bridging_enabled: boolean;
  degen_mode: boolean;
  // SWAPS
  default_slippage_bips: {
    [ChainName.mainnet]: number;
    [ChainName.optimism]: number;
    [ChainName.polygon]: number;
    [ChainName.arbitrum]: number;
    [ChainName.base]: number;
    [ChainName.zora]: number;
    [ChainName.bsc]: number;
    [ChainName.avalanche]: number;
    [ChainName.blast]: number;
    [ChainName.degen]: number;
    [ChainName.apechain]: number;
  };
}

const DEFAULT_CONFIG = {
  // features
  send_enabled: true,
  swaps_enabled: true,
  tx_requests_enabled: true,
  flashbots_enabled: true,
  rpc_proxy_enabled: true,
  points_enabled: true,
  defi_positions_enabled: false,
  rewards_enabled: true,
  rewards_bridging_enabled: true,
  degen_mode: false,
  // SWAPS
  default_slippage_bips: {
    arbitrum: 200,
    mainnet: 100,
    optimism: 200,
    polygon: 200,
    base: 200,
    zora: 200,
    bsc: 200,
    avalanche: 200,
    blast: 200,
    degen: 200,
    apechain: 200,
  },
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
          if (key === 'BX_default_slippage_bips') {
            config[realKey] = JSON.parse(
              entry.asString(),
            ) as RainbowConfig['default_slippage_bips'];
          } else if (
            key === 'BX_send_enabled' ||
            key === 'BX_swaps_enabled' ||
            key === 'BX_tx_requests_enabled' ||
            key === 'BX_flashbots_enabled' ||
            key === 'BX_rpc_proxy_enabled' ||
            key === 'BX_points_enabled' ||
            key === 'BX_defi_positions_enabled' ||
            key === 'BX_rewards_enabled' ||
            key === 'BX_rewards_bridging_enabled' ||
            key === 'BX_degen_mode'
          ) {
            config[realKey] = entry.asBoolean();
          } else {
            config[realKey] = entry.asString();
          }
        }
      });
    }
  } catch (e) {
    console.log('error getting remote config', e);
    logger.info(`error getting remote config: ${e}`);
    logger.info('Using default config');
    logger.error(new RainbowError('error getting remote config'));
  } finally {
    config.status = 'ready';
    if (process.env.IS_DEV === 'true') {
      console.log('CURRENT CONFIG', JSON.stringify(config, null, 2));
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
