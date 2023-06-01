/* eslint sort-keys: "error"*/

import { ROUTES } from '~/entries/popup/urls';

/**
 * All screen names by path, used by `analytics.screen()`.
 * We're flipping the key/value pairs from `ROUTES` to avoid maintenance.
 */
export const screen = Object.fromEntries(
  Object.entries(ROUTES).map(([key, value]) => [value, key]),
);
