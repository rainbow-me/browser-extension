import { useMemo } from 'react';

import { useRemoteConfigStore } from '~/core/state/remoteConfig';

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

const IS_TESTING = process.env.IS_TESTING === 'true';

/**
 * Hook to get the active promo for a specific page
 * Returns the highest priority unseen promo that is enabled for the page
 */
export function usePromos(page: PromoPage, isWatchingWallet?: boolean) {
  const { seenPromos, setSeenPromo } = useQuickPromoStore();
  const rnbwRewardsEnabled = useRemoteConfigStore(
    (s) => s.rnbw_rewards_enabled,
  );
  const degenModeEnabled = useRemoteConfigStore((s) => s.degen_mode_enabled);

  const activePromo = useMemo(() => {
    const isPromoEnabled = (promoType: PromoType): boolean => {
      if (IS_TESTING) return false;
      switch (promoType) {
        case 'airdrop_banner':
          // Don't show airdrop banner for watching wallets
          return rnbwRewardsEnabled && !isWatchingWallet;
        case 'degen_mode':
          return degenModeEnabled;
        default:
          return true;
      }
    };

    const pagePromos = promosByPage[page];
    return (
      pagePromos.find(
        (promoType) => !seenPromos[promoType] && isPromoEnabled(promoType),
      ) ?? null
    );
  }, [
    page,
    seenPromos,
    isWatchingWallet,
    rnbwRewardsEnabled,
    degenModeEnabled,
  ]);

  return {
    activePromo,
    setSeenPromo,
    seenPromos,
  };
}
