import { isValidAddress } from 'ethereumjs-util';
import { useEffect, useMemo, useState } from 'react';
import { Address, useProvider } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { GasFeeLegacyParams, GasFeeParams } from '~/core/types/gas';
import { toWei } from '~/core/utils/ethereum';
import { add, lessThan } from '~/core/utils/numbers';

import { getNetworkNativeAssetUniqueId } from '../useNativeAssetForNetwork';
import { useUserAsset } from '../useUserAsset';

export const useSendTransactionValidations = ({
  asset,
  assetAmount,
  selectedGas,
  toAddress,
}: {
  asset?: ParsedAddressAsset | null;
  assetAmount?: string;
  selectedGas?: GasFeeParams | GasFeeLegacyParams;
  toAddress?: Address;
}) => {
  const [toAddressIsSmartContract, setToAddressIsSmartContract] =
    useState(false);

  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: asset?.chainId || ChainId.mainnet,
  });
  const provider = useProvider({ chainId: asset?.chainId || ChainId.mainnet });

  const nativeAsset = useUserAsset(nativeAssetUniqueId || '');

  const enoughAssetBalance = useMemo(() => {
    if (!asset?.isNativeAsset) {
      return lessThan(toWei(assetAmount || '0'), asset?.balance?.amount || '0');
    } else {
      return lessThan(
        add(toWei(assetAmount || '0'), selectedGas?.gasFee?.amount || '0'),
        toWei(asset?.balance?.amount || '0'),
      );
    }
  }, [
    asset?.balance?.amount,
    asset?.isNativeAsset,
    assetAmount,
    selectedGas?.gasFee?.amount,
  ]);

  const enoughNativeAssetForGas = useMemo(
    () =>
      lessThan(
        selectedGas?.gasFee?.amount || '0',
        nativeAsset?.native?.balance?.amount || '0',
      ),
    [nativeAsset?.native?.balance, selectedGas?.gasFee],
  );

  const validToAddress = useMemo(
    () => isValidAddress(toAddress || ''),
    [toAddress],
  );

  useEffect(() => {
    const checkToAddress = async () => {
      if (!toAddress) {
        setToAddressIsSmartContract(false);
      } else {
        const code = await provider.getCode(toAddress);
        setToAddressIsSmartContract(code !== '0x');
      }
    };
    checkToAddress();
  }, [provider, toAddress]);

  return {
    validToAddress,
    enoughAssetBalance,
    enoughNativeAssetForGas,
    toAddressIsSmartContract,
  };
};
