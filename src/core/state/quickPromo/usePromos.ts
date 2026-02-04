import { useMemo } from 'react';

import config from '~/core/firebase/remoteConfig';

import { PromoType, useQuickPromoStore } from './index';

// Pages where promos can be shown
export type PromoPage =
  | 'tokens'
  | 'wallet_switcher'
  | 'network_settings'
  | 'swap';

// Which promos can appear on each page (in priority order)
const promosByPage: Record<PromoPage, PromoType[]> = {
  tokens: ['airdrop_banner', 'command_k'],
  wallet_switcher: ['wallet_switcher'],
  network_settings: ['network_settings'],
  swap: ['degen_mode'],
};

// Feature flag checks for promos
const isPromoEnabled = (
  promoType: PromoType,
  isWatchingWallet?: boolean,
): boolean => {
  switch (promoType) {
    case 'airdrop_banner':
      // Don't show airdrop banner for watching wallets
      return config.rnbw_rewards_enabled && !isWatchingWallet;
    case 'degen_mode':
      return config.degen_mode_enabled;
    default:
      return true;
  }
};

/**
 * Hook to get the active promo for a specific page
 * Returns the highest priority unseen promo that is enabled for the page
 */
export function usePromos(page: PromoPage, isWatchingWallet?: boolean) {
  const { seenPromos, setSeenPromo } = useQuickPromoStore();

  const activePromo = useMemo(() => {
    const pagePromos = promosByPage[page];
    return (
      pagePromos.find(
        (promoType) =>
          !seenPromos[promoType] && isPromoEnabled(promoType, isWatchingWallet),
      ) ?? null
    );
  }, [page, seenPromos, isWatchingWallet]);

  return {
    activePromo,
    setSeenPromo,
    seenPromos,
  };
}
