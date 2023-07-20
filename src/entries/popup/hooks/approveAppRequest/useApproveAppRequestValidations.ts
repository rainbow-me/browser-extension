import { useMemo } from 'react';
import { chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId, bsc } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { toWei } from '~/core/utils/ethereum';
import { lessThan } from '~/core/utils/numbers';

import { getNetworkNativeAssetUniqueId } from '../useNativeAssetForNetwork';
import { useUserAsset } from '../useUserAsset';

const DEFAULT_NATIVE_ASSET_SYMBOL = {
  [ChainId.mainnet]: chain.mainnet.nativeCurrency?.symbol,
  [ChainId.optimism]: chain.optimism.nativeCurrency?.symbol,
  [ChainId.arbitrum]: chain.arbitrum.nativeCurrency?.symbol,
  [ChainId.polygon]: chain.polygon.nativeCurrency?.symbol,
  [ChainId.bsc]: bsc.nativeCurrency?.symbol,
  [ChainId.hardhat]: chain.hardhat.nativeCurrency?.symbol,
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
