import { createBaseStore } from '@storesjs/stores';

import { createExtensionStoreOptions } from '../_internal';

// Promo types as a union
export type PromoType =
  | 'airdrop_banner'
  | 'command_k'
  | 'wallet_switcher'
  | 'network_settings'
  | 'degen_mode';

export interface QuickPromoStore {
  seenPromos: Record<PromoType, boolean>;
  setSeenPromo: (key: PromoType) => void;
}

export const useQuickPromoStore = createBaseStore<QuickPromoStore>(
  (set, get) => ({
    seenPromos: {
      airdrop_banner: false,
      command_k: false,
      wallet_switcher: false,
      network_settings: false,
      degen_mode: false,
    },
    setSeenPromo: (key: PromoType) => {
      const seenPromos = get().seenPromos;
      const newSeenPromos = {
        ...seenPromos,
        [key]: true,
      };
      set({
        seenPromos: newSeenPromos,
      });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'quickPromoStore',
    version: 1,
    merge(_persistedState, currentState) {
      const persistedState = _persistedState as QuickPromoStore;
      return {
        ...currentState,
        seenPromos: {
          ...currentState.seenPromos,
          ...persistedState?.seenPromos,
        },
      };
    },
  }),
);
