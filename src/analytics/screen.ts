/* eslint sort-keys: "error"*/

import { ROUTES } from '~/entries/popup/urls';

/**
 * All screen names by path, used by `analytics.screen()`.
 * We're flipping the key/value pairs from `ROUTES` to avoid maintenance.
 * Route names like `SETTINGS__PRIVACY__WALLETS_AND_KEYS` are
 * transformed to `settings.privacy.wallets_and_keys` screen events.
 */
export const screen: Record<string, any> = Object.fromEntries(
  Object.entries(ROUTES).map(([key, value]) => [
    value,
    key.toLowerCase().replaceAll('__', '.'),
  ]),
);
