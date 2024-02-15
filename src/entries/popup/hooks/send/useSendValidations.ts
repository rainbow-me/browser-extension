import { isValidAddress } from '@ethereumjs/util';
import { getProvider } from '@wagmi/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { UniqueAsset } from '~/core/types/nfts';
import { chainIdFromChainName, getChain } from '~/core/utils/chains';
import { toWei } from '~/core/utils/ethereum';
import {
  add,
  convertAmountToRawAmount,
  lessOrEqualThan,
  lessThan,
} from '~/core/utils/numbers';

import { useNativeAsset } from '../useNativeAsset';

export const useSendValidations = ({
  asset,
  assetAmount,
  nft,
  selectedGas,
  toAddress,
  toAddressOrName,
}: {
  asset?: ParsedUserAsset | null;
  assetAmount?: string;
  nft?: UniqueAsset;
  selectedGas?: GasFeeParams | GasFeeLegacyParams;
  toAddress?: Address;
  toAddressOrName?: string;
}) => {
  const [toAddressIsSmartContract, setToAddressIsSmartContract] =
    useState(false);

  const getNativeAssetChainId = () => {
    if (asset) {
      return asset?.chainId || ChainId.mainnet;
    } else if (nft && nft.network) {
      return chainIdFromChainName(nft.network);
    }
    return ChainId.mainnet;
  };
  const { nativeAsset } = useNativeAsset({
    chainId: getNativeAssetChainId(),
  });

  const [isValidToAddress, setIsValidToAddress] = useState(false);

  const validateToAddress = useCallback(
    (address?: Address) =>
      setIsValidToAddress(isValidAddress(address || toAddress || '')),
    [toAddress],
  );

  const enoughAssetBalance = useMemo(() => {
    if (nft) {
      return true;
    }
    if (assetAmount) {
      if (!asset?.isNativeAsset) {
        return lessOrEqualThan(
          convertAmountToRawAmount(assetAmount, asset?.decimals || 18),
          convertAmountToRawAmount(
            asset?.balance?.amount || '0',
            asset?.decimals || 18,
          ),
        );
      } else {
        return lessOrEqualThan(
          toWei(assetAmount || '0'),
          toWei(asset?.balance?.amount || '0'),
        );
      }
    }
  }, [
    asset?.balance?.amount,
    asset?.decimals,
    asset?.isNativeAsset,
    assetAmount,
    nft,
  ]);

  const enoughNativeAssetForGas = useMemo(() => {
    if (asset?.isNativeAsset) {
      return lessOrEqualThan(
        add(toWei(assetAmount || '0'), selectedGas?.gasFee?.amount || '0'),
        toWei(nativeAsset?.balance?.amount || '0'),
      );
    }
    return lessThan(
      selectedGas?.gasFee?.amount || '0',
      toWei(nativeAsset?.balance?.amount || '0'),
    );
  }, [
    asset?.isNativeAsset,
    assetAmount,
    nativeAsset?.balance?.amount,
    selectedGas?.gasFee?.amount,
  ]);

  useEffect(() => {
    const checkToAddress = async () => {
      if (!toAddress) {
        setToAddressIsSmartContract(false);
      } else {
        setToAddressIsSmartContract(false);
        const provider = getProvider({
          chainId: asset?.chainId || ChainId.mainnet,
        });
        const code = await provider.getCode(toAddress);
        setToAddressIsSmartContract(code !== '0x');
      }
    };
    checkToAddress();
  }, [asset?.chainId, nft, toAddress]);

  const buttonLabel = useMemo(() => {
    if (!isValidToAddress && toAddressOrName !== '')
      return i18n.t('send.button_label.enter_valid_address');

    if (!toAddress && !assetAmount && !nft) {
      return i18n.t('send.button_label.enter_address_and_amount');
    }
    if (!assetAmount && !nft) {
      return i18n.t('send.button_label.enter_amount');
    }
    if (toAddressOrName === '') {
      return i18n.t('send.button_label.enter_address');
    }
    if (!enoughAssetBalance)
      return i18n.t('send.button_label.insufficient_asset', {
        symbol: asset?.symbol,
      });
    if (!enoughNativeAssetForGas)
      return i18n.t('send.button_label.insufficient_native_asset_for_gas', {
        symbol: getChain({ chainId: asset?.chainId || ChainId.mainnet })
          .nativeCurrency.symbol,
      });
    return i18n.t('send.button_label.review');
  }, [
    asset?.chainId,
    asset?.symbol,
    assetAmount,
    enoughAssetBalance,
    enoughNativeAssetForGas,
    isValidToAddress,
    nft,
    toAddress,
    toAddressOrName,
  ]);

  const readyForReview = useMemo(
    () =>
      selectedGas?.gasFee?.amount &&
      isValidToAddress &&
      toAddressOrName !== '' &&
      (assetAmount || !!nft) &&
      enoughAssetBalance &&
      enoughNativeAssetForGas,
    [
      assetAmount,
      enoughAssetBalance,
      enoughNativeAssetForGas,
      isValidToAddress,
      nft,
      selectedGas?.gasFee?.amount,
      toAddressOrName,
    ],
  );

  return {
    enoughAssetBalance,
    enoughNativeAssetForGas,
    toAddressIsSmartContract,
    buttonLabel,
    isValidToAddress,
    readyForReview,
    validateToAddress,
  };
};
