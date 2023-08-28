import {
  arbitrum,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
  zora,
} from '@wagmi/chains';
import { useMemo } from 'react';
import { Address, useBalance } from 'wagmi';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { lessThan } from '~/core/utils/numbers';

import { getNetworkNativeAssetUniqueId } from '../useNativeAssetForNetwork';
import { useUserAsset } from '../useUserAsset';

const DEFAULT_NATIVE_ASSET_SYMBOL = {
  [ChainId.mainnet]: mainnet.nativeCurrency?.symbol,
  [ChainId.optimism]: optimism.nativeCurrency?.symbol,
  [ChainId.base]: base.nativeCurrency?.symbol,
  [ChainId.zora]: zora.nativeCurrency?.symbol,
  [ChainId.arbitrum]: arbitrum.nativeCurrency?.symbol,
  [ChainId.polygon]: polygon.nativeCurrency?.symbol,
  [ChainId.bsc]: bsc.nativeCurrency?.symbol,
};
export const useApproveAppRequestValidations = ({
  address,
  chainId,
  selectedGas,
}: {
  address?: Address;
  chainId?: ChainId;
  selectedGas?: GasFeeParams | GasFeeLegacyParams;
}) => {
  const nativeAssetUniqueId =
    chainId &&
    getNetworkNativeAssetUniqueId({
      chainId: chainId,
    });
  const { data: nativeAsset } = useUserAsset(nativeAssetUniqueId || '');

  const { data: balance } = useBalance({
    address: address,
    chainId: chainId,
  });

  const enoughNativeAssetForGas = useMemo(() => {
    return lessThan(
      selectedGas?.gasFee?.amount || '0',
      balance?.value.toString() || '0',
    );
  }, [balance?.value, selectedGas?.gasFee?.amount]);

  const buttonLabel = useMemo(() => {
    if (!enoughNativeAssetForGas)
      return i18n.t('approve_request.insufficient_native_asset_for_gas', {
        symbol:
          nativeAsset?.symbol ||
          DEFAULT_NATIVE_ASSET_SYMBOL[chainId || ChainId.mainnet],
      });
    return i18n.t('approve_request.send_transaction');
  }, [chainId, enoughNativeAssetForGas, nativeAsset?.symbol]);

  return {
    enoughNativeAssetForGas:
      enoughNativeAssetForGas && selectedGas?.gasFee?.amount,
    buttonLabel,
  };
};
