import { type FirebaseApp, initializeApp } from 'firebase/app';
import {
  type RemoteConfig,
  fetchAndActivate,
  getAll,
  getRemoteConfig,
  isSupported,
} from 'firebase/remote-config';

import { logger } from '~/logger';

import type { RainbowConfigBase } from './index';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY_BX,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN_BX,
  projectId: process.env.FIREBASE_PROJECT_ID_BX,
  appId: process.env.FIREBASE_APP_ID_BX,
};

let cachedApp: FirebaseApp | null = null;
let cachedRemoteConfig: RemoteConfig | null = null;

function getFirebaseRemoteConfig(): RemoteConfig {
  if (!cachedRemoteConfig) {
    cachedApp = initializeApp(firebaseConfig);
    cachedRemoteConfig = getRemoteConfig(cachedApp);
  }
  return cachedRemoteConfig;
}

/** Raw string values from Firebase; decoding happens in the query store transform */
export type RawFetchedConfig = Record<string, string>;

export async function fetchRemoteConfig(
  defaultConfig: RainbowConfigBase,
): Promise<RawFetchedConfig> {
  // In test builds, skip Firebase entirely — use defaults only.
  // This avoids network calls and ensures deterministic behavior in E2E tests.
  if (process.env.IS_TESTING === 'true') {
    return {};
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      logger.info('Firebase Remote Config not supported');
      return {};
    }

    const remoteConfig = getFirebaseRemoteConfig();
    remoteConfig.defaultConfig = {
      ...defaultConfig,
      default_slippage_bips: JSON.stringify(
        defaultConfig.default_slippage_bips,
      ),
    };

    const fetchedRemotely = await fetchAndActivate(remoteConfig);

    if (fetchedRemotely) {
      logger.debug(
        'Firebase Remote Config values were retrieved from the backend and activated.',
      );
    } else {
      logger.debug(
        'No configs were fetched from Firebase; local configs were already activated',
      );
    }

    const parameters = getAll(remoteConfig);
    const result: RawFetchedConfig = {};

    Object.entries(parameters).forEach(([key, entry]) => {
      if (!key.startsWith('BX_')) return;
      result[key.replace('BX_', '')] = entry.asString();
    });

    if (process.env.IS_DEV === 'true') {
      logger.info('Fetched remote config:', {
        config: JSON.stringify(result, null, 2),
      });
    }

    return result;
  } catch (e) {
    logger.info('Using default remote config');
    return {};
  }
}
