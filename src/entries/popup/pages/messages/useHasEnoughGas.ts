import { useMemo } from 'react';

import { useGasStore } from '~/core/state';
import { ActiveSession } from '~/core/state/appSessions';
import { ChainId } from '~/core/types/chains';
import { toWei } from '~/core/utils/ethereum';
import { lessThan } from '~/core/utils/numbers';

import { useUserNativeAsset } from '../../hooks/useUserNativeAsset';

export const useHasEnoughGas = (session: ActiveSession) => {
  const chainId = session?.chainId || ChainId.mainnet;

  const { nativeAsset } = useUserNativeAsset({
    address: session?.address,
    chainId,
  });
  const selectedGas = useGasStore((state) => state.selectedGas);
  const hasEnough = useMemo(() => {
    return lessThan(
      selectedGas?.gasFee?.amount || '0',
      toWei(nativeAsset?.balance?.amount || '0'),
    );
  }, [selectedGas?.gasFee?.amount, nativeAsset?.balance?.amount]);
  return hasEnough;
};
