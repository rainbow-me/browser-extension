import { arbitrum, bsc, mainnet, optimism, polygon } from '@wagmi/chains';
import { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { toWei } from '~/core/utils/ethereum';
import { lessThan } from '~/core/utils/numbers';

import { getNetworkNativeAssetUniqueId } from '../useNativeAssetForNetwork';
import { useUserAsset } from '../useUserAsset';

const DEFAULT_NATIVE_ASSET_SYMBOL = {
  [ChainId.mainnet]: mainnet.nativeCurrency?.symbol,
  [ChainId.optimism]: optimism.nativeCurrency?.symbol,
  [ChainId.arbitrum]: arbitrum.nativeCurrency?.symbol,
  [ChainId.polygon]: polygon.nativeCurrency?.symbol,
  [ChainId.bsc]: bsc.nativeCurrency?.symbol,
};
export const useApproveAppRequestValidations = ({
  chainId,
  selectedGas,
}: {
  chainId: ChainId;
  selectedGas?: GasFeeParams | GasFeeLegacyParams;
}) => {
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const chainIdToUse = connectedToHardhat ? ChainId.mainnet : chainId;

  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: chainIdToUse,
  });
  const nativeAsset = useUserAsset(nativeAssetUniqueId || '');

  const enoughNativeAssetForGas = useMemo(() => {
    return lessThan(
      selectedGas?.gasFee?.amount || '0',
      toWei(nativeAsset?.balance?.amount || '0'),
    );
  }, [nativeAsset?.balance?.amount, selectedGas?.gasFee?.amount]);

  const buttonLabel = useMemo(() => {
    if (!enoughNativeAssetForGas)
      return i18n.t('approve_request.insufficient_native_asset_for_gas', {
        symbol:
          nativeAsset?.symbol || DEFAULT_NATIVE_ASSET_SYMBOL[chainIdToUse],
      });
    return i18n.t('approve_request.send_transaction');
  }, [chainIdToUse, enoughNativeAssetForGas, nativeAsset?.symbol]);

  return {
    enoughNativeAssetForGas,
    buttonLabel,
  };
};
