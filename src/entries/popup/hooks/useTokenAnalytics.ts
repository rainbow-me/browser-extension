import _ from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import { analytics } from '~/analytics';
import { ParsedUserAsset } from '~/core/types/assets';
import { isCustomChain } from '~/core/utils/chains';

type Entrypoint = 'home' | 'send' | 'swap';

export function useTokenAnalytics(
  tokens: ParsedUserAsset[],
  entrypoint: Entrypoint,
) {
  const prevAnalyticsRef = useRef<{
    totalTokens: number;
    noPrice: number;
    noIcon: number;
    custom: number;
    entrypoint: Entrypoint;
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
      totalTokens: tokens.length,
      noPrice,
      noIcon,
      custom,
      entrypoint,
    } as const;
  }, [tokens, entrypoint]);

  // only report if values have changed (reduces reporting with rerenders)
  useEffect(() => {
    if (
      !prevAnalyticsRef.current ||
      !_.isEqual(prevAnalyticsRef.current, analyticsCategories)
    ) {
      prevAnalyticsRef.current = analyticsCategories;
      analytics.track(analytics.event.tokenMetadata, analyticsCategories);
    }
  }, [analyticsCategories, entrypoint]);
}
