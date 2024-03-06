import uniqBy from 'lodash/uniqBy';
import { useCallback, useMemo } from 'react';

import { usePinnedAssetStore } from '~/core/state/pinnedAssets';
import { ParsedUserAsset } from '~/core/types/assets';

export const useFilteredPinnedAssets = (assets: ParsedUserAsset[]) => {
  const { pinnedAssets } = usePinnedAssetStore();

  const isPinned = useCallback(
    (assetUniqueId: string) =>
      pinnedAssets.some(({ uniqueId }) => uniqueId === assetUniqueId),
    [pinnedAssets],
  );

  const computeUniqueAssets = useCallback(
    (assets: ParsedUserAsset[]) => {
      const filteredAssets = assets.filter(
        ({ uniqueId }) => !isPinned(uniqueId),
      );

      return uniqBy(
        filteredAssets.sort(
          (a, b) =>
            parseFloat(b?.native?.balance?.amount) -
            parseFloat(a?.native?.balance?.amount),
        ),
        'uniqueId',
      );
    },
    [isPinned],
  );

  const computePinnedAssets = useCallback(
    (assets: ParsedUserAsset[]) => {
      const filteredAssets = assets.filter((asset) => isPinned(asset.uniqueId));

      const sortedAssets = filteredAssets.sort((a, b) => {
        const pinnedFirstAsset = pinnedAssets.find(
          ({ uniqueId }) => uniqueId === a.uniqueId,
        );

        const pinnedSecondAsset = pinnedAssets.find(
          ({ uniqueId }) => uniqueId === b.uniqueId,
        );

        // This won't happen, but we'll just return to it's
        // default sorted order just in case it will happen
        if (!pinnedFirstAsset || !pinnedSecondAsset) return 0;

        return pinnedFirstAsset.createdAt - pinnedSecondAsset.createdAt;
      });

      return sortedAssets;
    },
    [isPinned, pinnedAssets],
  );

  const filteredAssets = useMemo(
    () => [...computePinnedAssets(assets), ...computeUniqueAssets(assets)],
    [assets, computePinnedAssets, computeUniqueAssets],
  );

  return filteredAssets;
};
