import { useMemo } from 'react';
import { parseEther, parseUnits } from 'viem';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { getChain } from '~/core/utils/chains';

import { getNetworkNativeAssetUniqueId } from '../useNativeAssetForNetwork';
import { useUserAsset } from '../useUserAsset';

export const useSwapValidations = ({
  assetToSell,
  assetToSellValue,
  selectedGas,
}: {
  assetToSell?: ParsedSearchAsset | null;
  assetToSellValue?: string;
  selectedGas?: GasFeeParams | GasFeeLegacyParams | null;
}) => {
  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: assetToSell?.chainId,
  });
  const { data: userNativeAsset } = useUserAsset(nativeAssetUniqueId || '');

  const enoughAssetBalance = useMemo(() => {
    if (assetToSellValue) {
      if (!assetToSell?.isNativeAsset) {
        const decimals = assetToSell?.decimals || 18;
        return (
          parseUnits(assetToSellValue, decimals) <=
          parseUnits(assetToSell?.balance?.amount || '0', decimals)
        );
      } else {
        return (
          parseEther(assetToSellValue || '0') <=
          parseEther(assetToSell?.balance?.amount || '0')
        );
      }
    }
    return true;
  }, [assetToSell, assetToSellValue]);

  const enoughNativeAssetBalanceForGas = useMemo(() => {
    const nativeBalanceWei = parseEther(
      userNativeAsset?.balance?.amount || '0',
    );
    if (assetToSell?.isNativeAsset) {
      return (
        parseEther(assetToSellValue || '0') +
          (selectedGas?.gasFee?.amount ?? 0n) <=
        nativeBalanceWei
      );
    }
    return (selectedGas?.gasFee?.amount ?? 0n) < nativeBalanceWei;
  }, [
    assetToSell?.isNativeAsset,
    assetToSellValue,
    userNativeAsset?.balance?.amount,
    selectedGas?.gasFee?.amount,
  ]);

  const buttonLabel = useMemo(() => {
    if (!enoughAssetBalance)
      return i18n.t('send.button_label.insufficient_asset', {
        symbol: assetToSell?.symbol,
      });
    if (!enoughNativeAssetBalanceForGas)
      return i18n.t('send.button_label.insufficient_native_asset_for_gas', {
        symbol: getChain({ chainId: assetToSell?.chainId || ChainId.mainnet })
          .nativeCurrency.symbol,
      });
    return '';
  }, [
    assetToSell?.chainId,
    assetToSell?.symbol,
    enoughAssetBalance,
    enoughNativeAssetBalanceForGas,
  ]);

  const enoughAssetsForSwap =
    Boolean(enoughAssetBalance) && Boolean(enoughNativeAssetBalanceForGas);

  return {
    buttonLabel,
    enoughAssetBalance,
    enoughNativeAssetBalanceForGas,
    enoughAssetsForSwap,
    readyForReview: enoughAssetsForSwap && selectedGas?.gasFee?.amount != null,
  };
};
