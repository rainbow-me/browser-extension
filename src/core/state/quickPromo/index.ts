import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

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

export const useQuickPromoStore = createRainbowStore<QuickPromoStore>(
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
    storageKey: 'quickPromoStore',
    version: 1,
  },
);
