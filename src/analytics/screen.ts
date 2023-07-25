/* eslint sort-keys: "error"*/

import { ROUTES } from '~/entries/popup/urls';

/**
 * All screen names by path, used by `analytics.screen()`.
 * We're flipping the key/value pairs from `ROUTES` to avoid maintenance.
 * SETTINGS__PRIVACY__WALLETS_AND_KEYS -> settings.privacy.wallets_and_keys
 */
export const screen = Object.fromEntries(
  Object.entries(ROUTES).map(([key, value]) => [
    value,
    key.toLowerCase().replace('__', '.'),
  ]),
);
