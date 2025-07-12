import { isValidAddress } from '@ethereumjs/util';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
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

const validateRecipient = (
  toAddress: Address | undefined,
  asset: ParsedUserAsset | null,
  userAssets: ParsedUserAsset[]
): boolean => {
  if (!toAddress) return false;
  
  const recipientAddress = toAddress.toLowerCase();
  
  // Token being sent shares contract address with recipient
  if (asset && asset.address.toLowerCase() === recipientAddress) {
    return false;
  }
  
  // Token contract send prevention - check if recipient matches any token contract
  const isTokenContract = userAssets.some(
    userAsset => userAsset.address.toLowerCase() === recipientAddress
  );
  
  return !isTokenContract;
};

export const useSendValidations = ({
  asset,
  assetAmount,
  nft,
  selectedGas,
  toAddress,
  toAddressOrName,
  userAssets = [],
}: {
  asset?: ParsedUserAsset | null;
  assetAmount?: string;
  nft?: UniqueAsset;
  selectedGas?: GasFeeParams | GasFeeLegacyParams;
  toAddress?: Address;
  toAddressOrName?: string;
  userAssets?: ParsedUserAsset[];
}) => {
  const [recipientValidationError, setRecipientValidationError] = useState<string | null>(null);

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

  const isValidRecipient = useMemo(() => {
    return validateRecipient(toAddress, asset || null, userAssets);
  }, [toAddress, asset, userAssets]);

  useEffect(() => {
    if (!toAddress) {
      setRecipientValidationError(null);
      return;
    }

    if (!isValidRecipient) {
      // Check if sending to token contract
      if (asset && asset.address.toLowerCase() === toAddress.toLowerCase()) {
        setRecipientValidationError(
          i18n.t('send.validation.sending_to_token_contract', {
            tokenName: asset.symbol,
          }) || 'You cannot send a token to its own contract address'
        );
      } else {
        setRecipientValidationError(
          i18n.t('send.validation.sending_to_token_contract_generic') || 
          'You cannot send tokens to a token contract address'
        );
      }
    } else {
      setRecipientValidationError(null);
    }
  }, [toAddress, asset, isValidRecipient]);

  const buttonLabel = useMemo(() => {
    if (!isValidToAddress && toAddressOrName !== '')
      return i18n.t('send.button_label.enter_valid_address');

    if (recipientValidationError) {
      return recipientValidationError;
    }

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
    recipientValidationError,
  ]);

  const readyForReview = useMemo(
    () =>
      selectedGas?.gasFee?.amount &&
      isValidToAddress &&
      toAddressOrName !== '' &&
      (assetAmount || !!nft) &&
      enoughAssetBalance &&
      enoughNativeAssetForGas &&
      isValidRecipient,
    [
      assetAmount,
      enoughAssetBalance,
      enoughNativeAssetForGas,
      isValidToAddress,
      nft,
      selectedGas?.gasFee?.amount,
      toAddressOrName,
      isValidRecipient,
    ],
  );

  return {
    enoughAssetBalance,
    enoughNativeAssetForGas,
    isValidRecipient,
    recipientValidationError,
    buttonLabel,
    isValidToAddress,
    readyForReview,
    validateToAddress,
  };
};
