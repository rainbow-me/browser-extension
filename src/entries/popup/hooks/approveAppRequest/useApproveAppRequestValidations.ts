import { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { chainIdToUse, getChain } from '~/core/utils/chains';
import { toWei } from '~/core/utils/ethereum';
import { lessThan } from '~/core/utils/numbers';

import { useNativeAsset } from '../useNativeAsset';

export const useApproveAppRequestValidations = ({
  chainId,
  selectedGas,
}: {
  chainId: ChainId;
  selectedGas?: GasFeeParams | GasFeeLegacyParams;
}) => {
  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore.getState();

  const activeChainId = chainIdToUse(
    connectedToHardhat,
    connectedToHardhatOp,
    chainId,
  );

  const { nativeAsset } = useNativeAsset({ chainId });

  const enoughNativeAssetForGas = useMemo(() => {
    return lessThan(
      selectedGas?.gasFee?.amount || '0',
      toWei(nativeAsset?.balance?.amount || '0'),
    );
  }, [nativeAsset?.balance?.amount, selectedGas?.gasFee?.amount]);

  const buttonLabel = useMemo(() => {
    if (!enoughNativeAssetForGas)
      return i18n.t('approve_request.insufficient_native_asset_for_gas', {
        symbol: getChain({ chainId: activeChainId }).nativeCurrency.name,
      });
    return i18n.t('approve_request.send_transaction');
  }, [enoughNativeAssetForGas, activeChainId]);

  return {
    enoughNativeAssetForGas:
      enoughNativeAssetForGas && selectedGas?.gasFee?.amount,
    buttonLabel,
  };
};
