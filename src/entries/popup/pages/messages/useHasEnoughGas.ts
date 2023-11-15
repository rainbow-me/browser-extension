import { useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { toWei } from '~/core/utils/ethereum';
import { lessThan } from '~/core/utils/numbers';

import { useNativeAsset } from '../../hooks/useNativeAsset';

export const useHasEnoughGas = (chainId: ChainId) => {
  const { nativeAsset } = useNativeAsset({ chainId });
  const { selectedGas } = useGasStore();

  return lessThan(
    selectedGas?.gasFee?.amount || '0',
    toWei(nativeAsset?.balance?.amount || '0'),
  );
};
