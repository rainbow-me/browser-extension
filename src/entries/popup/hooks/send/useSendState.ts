import { Address } from '@wagmi/core';
import { useMemo, useState } from 'react';

import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { toWei } from '~/core/utils/ethereum';
import { toHex } from '~/core/utils/hex';
import { convertAmountToRawAmount } from '~/core/utils/numbers';
import { getDataForTokenTransfer } from '~/core/utils/transactions';

import { useEns } from '../useEns';

export const useSendState = ({
  assetAmount,
  asset,
  rawMaxAssetBalanceAmount,
}: {
  assetAmount?: string;
  asset: ParsedUserAsset | null;
  rawMaxAssetBalanceAmount: string;
}) => {
  const [toAddressOrName, setToAddressOrName] = useState<Address | string>('');
  const { saveSendAddress } = usePopupInstanceStore();
  const { currentCurrency } = useCurrentCurrencyStore();

  const [, setAsset] = useState<ParsedUserAsset>();

  const { currentAddress: fromAddress } = useCurrentAddressStore();
  const chainId = asset?.chainId ?? ChainId.mainnet;

  const { ensAddress: toAddress, ensName: toEnsName } = useEns({
    addressOrName: toAddressOrName ?? '',
  });

  const sendingNativeAsset = useMemo(
    () => !!asset && isNativeAsset(asset?.address, chainId),
    [asset, chainId],
  );

  const value = useMemo(
    () =>
      sendingNativeAsset && assetAmount ? toHex(toWei(assetAmount)) : '0x0',
    [assetAmount, sendingNativeAsset],
  );

  const data = useMemo(() => {
    if (!asset || !toAddress || !assetAmount || sendingNativeAsset) return '0x';
    const rawAmount = convertAmountToRawAmount(assetAmount, asset?.decimals);
    return getDataForTokenTransfer(rawAmount, toAddress);
  }, [assetAmount, asset, sendingNativeAsset, toAddress]);

  const txToAddress: Address = useMemo(() => {
    const assetAddress = asset?.address;
    const isSendingNativeAsset = assetAddress
      ? isNativeAsset(assetAddress, chainId)
      : true;
    return (
      !isSendingNativeAsset && assetAddress ? assetAddress : toAddress
    ) as Address;
  }, [asset?.address, chainId, toAddress]);

  const maxAssetBalanceParams = useMemo(() => {
    return asset?.isNativeAsset
      ? { value: rawMaxAssetBalanceAmount }
      : {
          data: getDataForTokenTransfer(
            rawMaxAssetBalanceAmount || '',
            toAddress || '',
          ),
        };
  }, [asset?.isNativeAsset, rawMaxAssetBalanceAmount, toAddress]);

  return {
    asset,
    maxAssetBalanceParams,
    currentCurrency,
    toAddressOrName,
    chainId,
    data,
    fromAddress,
    toAddress,
    toEnsName,
    txToAddress,
    value,
    setAsset,
    setToAddressOrName: (address: Address | string) => {
      setToAddressOrName(address);
      saveSendAddress({ address });
    },
  };
};
