import uniqBy from 'lodash/uniqBy';
import { useMemo } from 'react';

import { usePinnedAssetStore } from '~/core/state/pinnedAssets';
import { ParsedUserAsset } from '~/core/types/assets';

export const useFilteredPinnedAssets = (assets: ParsedUserAsset[]) => {
  const { uniqueIds } = usePinnedAssetStore();

  const computeUniqueAssets = (assets: ParsedUserAsset[]) => {
    return uniqBy(
      assets.sort(
        (a: ParsedUserAsset, b: ParsedUserAsset) =>
          parseFloat(b?.native?.balance?.amount) -
          parseFloat(a?.native?.balance?.amount),
      ),
      'uniqueId',
    );
  };

  const filteredAssets = useMemo(
    () => [
      ...computeUniqueAssets(
        assets.filter((asset) => uniqueIds.includes(asset.uniqueId)),
      ),
      ...computeUniqueAssets(
        assets.filter((asset) => !uniqueIds.includes(asset.uniqueId)),
      ),
    ],
    [assets, uniqueIds],
  );

  return filteredAssets;
};
