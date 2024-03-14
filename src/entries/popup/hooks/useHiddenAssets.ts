import { useCallback } from 'react';

import { useHiddenAssetStore } from '~/core/state/hiddenAssets/hiddenAssets';
import { ParsedUserAsset } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';

export const useHiddenAssets = () => {
  const {
    hiddenAssets,
    addHiddenAsset: addHiddenAssetStore,
    removeHiddenAsset: removeHiddenAssetStore,
  } = useHiddenAssetStore();

  const isHidden = useCallback(
    (asset: ParsedUserAsset | SearchAsset) =>
      hiddenAssets.some(
        (uniqueId) => uniqueId === `${asset.address}-${asset.chainId}`,
      ),
    [hiddenAssets],
  );

  const addHiddenAsset = useCallback(
    (asset: ParsedUserAsset) => {
      addHiddenAssetStore({ uniqueId: `${asset.address}-${asset.chainId}` });
    },
    [addHiddenAssetStore],
  );

  const removeHiddenAsset = useCallback(
    (asset: ParsedUserAsset) => {
      removeHiddenAssetStore({ uniqueId: `${asset.address}-${asset.chainId}` });
    },
    [removeHiddenAssetStore],
  );

  return {
    addHiddenAsset,
    removeHiddenAsset,
    isHidden,
  };
};
