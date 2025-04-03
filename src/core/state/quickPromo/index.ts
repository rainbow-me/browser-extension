import { create } from 'zustand';

import { createStore } from '../internal/createStore';

export enum promoTypes {
  command_k = 'command_k',
  wallet_switcher = 'wallet_switcher',
  network_settings = 'network_settings',
  degen_mode = 'degen_mode',
}
export type PromoTypes = keyof typeof promoTypes;

export interface QuickPromoStore {
  seenPromos: { [key in PromoTypes]: boolean };
  setSeenPromo: (key: PromoTypes) => void;
}

export const quickPromoStore = createStore<QuickPromoStore>(
  (set, get) => ({
    seenPromos: {
      command_k: false,
      wallet_switcher: false,
      network_settings: false,
      degen_mode: false,
    },
    setSeenPromo: (key: PromoTypes) => {
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
  {
    persist: {
      name: 'quickPromoStore',
      version: 1,
    },
  },
);

export const useQuickPromoStore = create(() => quickPromoStore.getState());
