import { useMemo } from 'react';
import { parseEther } from 'viem';

import { useGasStore } from '~/core/state';
import { ActiveSession } from '~/core/state/appSessions';
import { ChainId } from '~/core/types/chains';

import { useUserNativeAsset } from '../../hooks/useUserNativeAsset';

export const useHasEnoughGas = (session: ActiveSession) => {
  const chainId = session?.chainId || ChainId.mainnet;

  const { nativeAsset, isLoading: isNativeAssetLoading } = useUserNativeAsset({
    address: session?.address,
    chainId,
  });

  const selectedGas = useGasStore((state) => state.selectedGas);

  const hasEnough = useMemo(() => {
    if (isNativeAssetLoading) {
      return undefined;
    }

    return (
      (selectedGas?.gasFee?.amount ?? 0n) <
      parseEther(nativeAsset?.balance?.amount || '0')
    );
  }, [
    selectedGas?.gasFee?.amount,
    nativeAsset?.balance?.amount,
    isNativeAssetLoading,
  ]);

  return {
    hasEnough,
    isLoading: isNativeAssetLoading,
  };
};
