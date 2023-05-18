/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from 'firebase/app';
import {
  fetchAndActivate,
  getAll,
  getRemoteConfig,
} from 'firebase/remote-config';

import { RainbowError, logger } from '~/logger';

import { ChainName } from '../types/chains';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
};

export interface RainbowConfig extends Record<string, any> {
  // features
  send_enabled: boolean;
  swaps_enabled: boolean;
  tx_requests_enabled: boolean;
  flashbots_enabled: boolean;
  // SWAPS
  default_slippage_bips: {
    [ChainName.mainnet]: number;
    [ChainName.optimism]: number;
    [ChainName.polygon]: number;
    [ChainName.arbitrum]: number;
    [ChainName.bsc]: number;
  };
  trace_call_block_number_offset: number;
  invite_code_required: boolean;
}

const DEFAULT_CONFIG = {
  // features
  send_enabled: true,
  swaps_enabled: true,
  tx_requests_enabled: true,
  flashbots_enabled: true,
  // SWAPS
  default_slippage_bips: {
    arbitrum: 200,
    mainnet: 100,
    optimism: 200,
    polygon: 200,
    bsc: 200,
  },
  trace_call_block_number_offset: 20,
  invite_code_required: false,
};

// Initialize with defaults in case firebase doesn't respond
const config: RainbowConfig = { ...DEFAULT_CONFIG, status: 'loading' };

export const init = async () => {
  try {
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
      if (key === 'default_slippage_bips') {
        config[key] = JSON.parse(
          entry.asString(),
        ) as RainbowConfig['default_slippage_bips'];
      } else if (
        key === 'send_enabled' ||
        key === 'swaps_enabled' ||
        key === 'tx_requests_enabled' ||
        key === 'f2c_ratio_enabled' ||
        key === 'flashbots_enabled' ||
        key === 'op_rewards_enabled' ||
        key === 'profiles_enabled'
      ) {
        config[key] = entry.asBoolean();
      } else if (key === 'trace_call_block_number_offset') {
        config[key] = entry.asNumber();
      } else {
        config[key] = entry.asString();
      }
    });
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

init();

export default config;
