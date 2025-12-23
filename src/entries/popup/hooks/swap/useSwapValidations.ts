import { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { getChain } from '~/core/utils/chains';
import { toWei } from '~/core/utils/ethereum';
import {
  add,
  convertAmountToRawAmount,
  lessOrEqualThan,
  lessThan,
} from '~/core/utils/numbers';

import { getNetworkNativeAssetUniqueId } from '../useNativeAssetForNetwork';
import { useUserAsset } from '../useUserAsset';

export const useSwapValidations = ({
  assetToSell,
  assetToSellValue,
  selectedGas,
  isMaxZeroDueToInsufficientGas,
}: {
  assetToSell?: ParsedSearchAsset | null;
  assetToSellValue?: string;
  selectedGas?: GasFeeParams | GasFeeLegacyParams;
  isMaxZeroDueToInsufficientGas?: boolean;
}) => {
  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: assetToSell?.chainId,
  });
  const { data: userNativeAsset } = useUserAsset(nativeAssetUniqueId || '');

  const enoughAssetBalance = useMemo(() => {
    if (assetToSellValue) {
      if (!assetToSell?.isNativeAsset) {
        return lessOrEqualThan(
          convertAmountToRawAmount(
            assetToSellValue,
            assetToSell?.decimals || 18,
          ),
          convertAmountToRawAmount(
            assetToSell?.balance?.amount || '0',
            assetToSell?.decimals || 18,
          ),
        );
      } else {
        return lessOrEqualThan(
          toWei(assetToSellValue || '0'),
          toWei(assetToSell?.balance?.amount || '0'),
        );
      }
    }
    return true;
  }, [assetToSell, assetToSellValue]);

  const enoughNativeAssetBalanceForGas = useMemo(() => {
    // If gas hasn't been estimated yet, don't block the user
    if (!selectedGas?.gasFee?.amount) {
      return true;
    }
    // When selling native asset, use its balance directly (it's the same as userNativeAsset)
    // This ensures we use the balance that's actually displayed in the UI
    if (assetToSell?.isNativeAsset) {
      const nativeBalance = assetToSell?.balance?.amount;
      if (!nativeBalance) {
        return true; // Balance not loaded yet, don't block
      }
      return lessOrEqualThan(
        add(toWei(assetToSellValue || '0'), selectedGas.gasFee.amount),
        toWei(nativeBalance),
      );
    }
    // For non-native assets, check if we have enough native asset for gas
    const nativeBalance = userNativeAsset?.balance?.amount;
    if (!nativeBalance) {
      return true; // Balance not loaded yet, don't block
    }
    return lessThan(selectedGas.gasFee.amount, toWei(nativeBalance));
  }, [
    assetToSell?.isNativeAsset,
    assetToSell?.balance?.amount,
    assetToSellValue,
    userNativeAsset?.balance?.amount,
    selectedGas?.gasFee?.amount,
  ]);

  const buttonLabel = useMemo(() => {
    // If max is 0 due to insufficient gas and no amount entered, show gas message
    if (isMaxZeroDueToInsufficientGas && !assetToSellValue) {
      return i18n.t('send.button_label.insufficient_native_asset_for_gas', {
        symbol: getChain({ chainId: assetToSell?.chainId || ChainId.mainnet })
          .nativeCurrency.symbol,
      });
    }
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
    isMaxZeroDueToInsufficientGas,
    assetToSellValue,
  ]);

  const enoughAssetsForSwap =
    Boolean(enoughAssetBalance) && Boolean(enoughNativeAssetBalanceForGas);

  return {
    buttonLabel,
    enoughAssetBalance,
    enoughNativeAssetBalanceForGas,
    enoughAssetsForSwap,
    readyForReview: enoughAssetsForSwap && selectedGas?.gasFee?.amount,
  };
};
