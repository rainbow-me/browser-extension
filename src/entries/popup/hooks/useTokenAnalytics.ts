import _ from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import { analytics } from '~/analytics';
import { ParsedUserAsset } from '~/core/types/assets';
import { isCustomChain } from '~/core/utils/chains';

type Screen = 'wallet' | 'send' | 'swap';

export function useTokenAnalytics(tokens: ParsedUserAsset[], screen: Screen) {
  const prevAnalyticsRef = useRef<{
    screen: Screen;
    totalTokens: number;
    noPrice: number;
    noIcon: number;
    custom: number;
  } | null>(null);

  const analyticsCategories = useMemo(() => {
    const noPrice = tokens.filter(
      (asset) => !asset.native?.price?.amount,
    ).length;

    const noIcon = tokens.filter((asset) => !asset.icon_url).length;

    const custom = tokens.filter((asset) =>
      isCustomChain(asset.chainId),
    ).length;

    return {
      screen,
      totalTokens: tokens.length,
      noPrice,
      noIcon,
      custom,
    } as const;
  }, [tokens, screen]);

  // only report if values have changed (reduces reporting with rerenders)
  useEffect(() => {
    if (
      !prevAnalyticsRef.current ||
      !_.isEqual(prevAnalyticsRef.current, analyticsCategories)
    ) {
      prevAnalyticsRef.current = analyticsCategories;
      analytics.track(analytics.event.tokenMetadata, analyticsCategories);
    }
  }, [analyticsCategories, screen]);
}
