import { useCallback } from 'react';

import { useHiddenAssetStore } from '~/core/state/hiddenAssets/hiddenAssets';

export const useHiddenAssets = () => {
  const {
    hiddenAssets,
    addHiddenAsset: addHiddenAssetStore,
    removeHiddenAsset: removeHiddenAssetStore,
  } = useHiddenAssetStore();

  const isHidden = useCallback(
    (address: string, chainId: number) =>
      hiddenAssets.some((uniqueId) => uniqueId === `${address}-${chainId}`),
    [hiddenAssets],
  );

  const addHiddenAsset = useCallback(
    (tokenAddress: string, chainId: number) => {
      addHiddenAssetStore({ uniqueId: `${tokenAddress}-${chainId}` });
    },
    [addHiddenAssetStore],
  );

  const removeHiddenAsset = useCallback(
    (tokenAddress: string, chainId: number) => {
      removeHiddenAssetStore({ uniqueId: `${tokenAddress}-${chainId}` });
    },
    [removeHiddenAssetStore],
  );

  return {
    addHiddenAsset,
    removeHiddenAsset,
    isHidden,
  };
};
