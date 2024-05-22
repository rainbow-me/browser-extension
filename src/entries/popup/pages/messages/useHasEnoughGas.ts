import { useGasStore } from '~/core/state';
import { ActiveSession } from '~/core/state/appSessions';
import { ChainId } from '~/core/types/chains';
import { toWei } from '~/core/utils/ethereum';
import { lessThan } from '~/core/utils/numbers';

import { useNativeAsset } from '../../hooks/useNativeAsset';

export const useHasEnoughGas = (session: ActiveSession) => {
  const chainId = session?.chainId || ChainId.mainnet;

  const { nativeAsset } = useNativeAsset({
    address: session?.address,
    chainId,
  });
  const selectedGas = useGasStore.use.selectedGas();

  console.log('nativeAsset', chainId, nativeAsset);
  return lessThan(
    selectedGas?.gasFee?.amount || '0',
    toWei(nativeAsset?.balance?.amount || '0'),
  );
};
