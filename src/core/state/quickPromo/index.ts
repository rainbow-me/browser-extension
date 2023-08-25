import create from 'zustand';

import { createStore } from '../internal/createStore';

export enum promoTypes {
  command_k = 'command_k',
  wallet_switcher = 'wallet_switcher',
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
      version: 0,
    },
  },
);

export const useQuickPromoStore = create(quickPromoStore);
