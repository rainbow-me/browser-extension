import type { Address } from 'viem';
import browser from 'webextension-polyfill';

import { Language } from '~/core/languages';
import type { SupportedCurrencyKey } from '~/core/references';
import { ChainId } from '~/core/types/chains';
import { GasSpeed } from '~/core/types/gas';
import type {
  AutoLockTimerOption,
  DefaultTxSpeedOption,
  ThemeOption,
} from '~/core/types/settings';
// eslint-disable-next-line boundaries/element-types
import type { Tab } from '~/entries/popup/components/Tabs/TabBar';

import { defineExtensionStorageWithDefaults } from './define';
import { useStorageValue } from './hook';

export type FeatureFlagTypes =
  | 'command_k_internal_shortcuts_enabled'
  | 'full_watching_wallets';

export interface SettingsStorageSchema {
  // Existing migrated stores
  'settings:isDefaultWallet': boolean;
  'settings:isSoundEnabled': boolean;
  'settings:isAnalyticsDisabled': boolean;

  // Phase 1: Simple boolean stores
  'settings:isDeveloperToolsEnabled': boolean;
  'settings:isHideAssetBalances': boolean;
  'settings:isHideSmallBalances': boolean;
  'settings:isTestnetMode': boolean;

  // Phase 2: Simple value stores
  'settings:autoLockTimer': AutoLockTimerOption;
  'settings:currentChainId': number;
  'settings:currentCurrency': SupportedCurrencyKey;
  'settings:defaultTxSpeed': DefaultTxSpeedOption;
  'settings:selectedTab': Tab;

  // Phase 3: Medium complexity stores
  'settings:isConnectedToHardhat': boolean;
  'settings:isConnectedToHardhatOp': boolean;
  'settings:currentLanguage': Language;

  // Phase 4: High complexity stores
  'settings:currentAddress': Address;
  'settings:currentTheme': Exclude<ThemeOption, 'system'>;
  'settings:currentUserSelectedTheme': ThemeOption;
  'settings:featureFlags': Record<FeatureFlagTypes, boolean>;
}

const defaults = {
  // Existing migrated stores
  'settings:isAnalyticsDisabled': false,
  'settings:isDefaultWallet': true,
  'settings:isSoundEnabled': true,

  // Phase 1: Simple boolean stores
  'settings:isDeveloperToolsEnabled': false,
  'settings:isHideAssetBalances': false,
  'settings:isHideSmallBalances': false,
  'settings:isTestnetMode': false,

  // Phase 2: Simple value stores
  'settings:autoLockTimer': 'none',
  'settings:currentChainId': ChainId.mainnet,
  'settings:currentCurrency': 'USD',
  'settings:defaultTxSpeed': GasSpeed.NORMAL,
  'settings:selectedTab': 'tokens',

  // Phase 3: Medium complexity stores
  'settings:isConnectedToHardhat': false,
  'settings:isConnectedToHardhatOp': false,
  'settings:currentLanguage': Language.EN_US,

  // Phase 4: High complexity stores
  'settings:currentAddress': '' as Address,
  'settings:currentTheme': 'dark',
  'settings:currentUserSelectedTheme': 'dark',
  'settings:featureFlags': {
    full_watching_wallets: false,
    command_k_internal_shortcuts_enabled: false,
  },
} as const satisfies Partial<SettingsStorageSchema>;

export const settingsStorage = defineExtensionStorageWithDefaults<
  SettingsStorageSchema,
  typeof defaults
>(browser.storage.local, defaults);

export function useSettingsStore<
  T extends keyof SettingsStorageSchema extends `settings:${infer K}`
    ? K
    : unknown,
>(key: T) {
  return useStorageValue(settingsStorage, `settings:${key}`);
}

export function getSettingsValue_OldSync<T extends keyof typeof defaults>(
  key: T,
): SettingsStorageSchema[T] {
  const defaultValue = settingsStorage.getDefault(
    key,
  ) as SettingsStorageSchema[T];
  let value: SettingsStorageSchema[T] = defaultValue;

  // Async update, but always return the current value synchronously
  void settingsStorage
    .getItem(key)
    .then((val: SettingsStorageSchema[T] | null) => {
      value = val !== null ? val : defaultValue;

      const unsubscribe = settingsStorage.onChange(
        key,
        (newVal: SettingsStorageSchema[T] | null) => {
          value = newVal !== null ? newVal : defaultValue;
        },
      );

      // Cleanup subscription on unload/close if possible
      const cleanup = () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
      if (
        typeof window !== 'undefined' &&
        typeof window.addEventListener === 'function'
      ) {
        window.addEventListener('unload', cleanup, { once: true });
      } else if (
        typeof self !== 'undefined' &&
        typeof self.addEventListener === 'function'
      ) {
        self.addEventListener('unload', cleanup as EventListener, {
          once: true,
        });
        self.addEventListener('close', cleanup as EventListener, {
          once: true,
        });
      }
    });

  return value;
}
