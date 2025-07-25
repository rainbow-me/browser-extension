import { isValidAddress } from '@ethereumjs/util';
import { useCallback, useMemo, useState } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { selectUserAssetsDictByChain } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId, chainNameToIdMapping } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { UniqueAsset } from '~/core/types/nfts';
import { getChain } from '~/core/utils/chains';
import { toWei } from '~/core/utils/ethereum';
import {
  add,
  convertAmountToRawAmount,
  lessOrEqualThan,
  lessThan,
} from '~/core/utils/numbers';

import { useUserNativeAsset } from '../useUserNativeAsset';

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
  const getNativeAssetChainId = () => {
    if (asset) {
      return asset?.chainId || ChainId.mainnet;
    } else if (nft && nft.network) {
      return chainNameToIdMapping[nft.network];
    }
    return ChainId.mainnet;
  };
  const { nativeAsset } = useUserNativeAsset({
    chainId: getNativeAssetChainId(),
  });

  const [isValidToAddress, setIsValidToAddress] = useState(false);
  const [toAddressIsTokenContract, setToAddressIsTokenContract] =
    useState(false);

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

  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { data: userAssets = {} } = useUserAssets(
    { address: currentAddress, currency: currentCurrency },
    { select: selectUserAssetsDictByChain },
  );

  const tokenContracts = useMemo(
    () =>
      Object.values(userAssets)
        .map((byChain) =>
          Object.values(byChain).map((a) => a.address.toLowerCase()),
        )
        .flat(),
    [userAssets],
  );

  const validateToAddress = useCallback(
    (address?: Address) => {
      const candidate = address || toAddress || '';
      const validAddress = isValidAddress(candidate);
      if (!validAddress) {
        setIsValidToAddress(false);
        return false;
      }
      const lower = candidate.toLowerCase();
      const sendingToToken =
        asset && !asset.isNativeAsset && asset.address.toLowerCase() === lower;
      const knownToken = tokenContracts.includes(lower);
      const isTokenContract = sendingToToken || knownToken;
      const valid = !isTokenContract;
      setIsValidToAddress(valid);
      setToAddressIsTokenContract(isTokenContract);
      return isTokenContract;
    },
    [asset, toAddress, tokenContracts],
  );

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
    buttonLabel,
    isValidToAddress,
    readyForReview,
    validateToAddress,
    toAddressIsTokenContract,
  };
};
