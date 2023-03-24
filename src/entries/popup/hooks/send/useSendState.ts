import { useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { toWei } from '~/core/utils/ethereum';
import { convertAmountToRawAmount, toHex } from '~/core/utils/numbers';
import { getDataForTokenTransfer } from '~/core/utils/transactions';

import { useEns } from '../useEns';

export const useSendState = ({
  assetAmount,
  asset,
}: {
  assetAmount?: string;
  asset: ParsedAddressAsset | null;
}) => {
  const [toAddressOrName, setToAddressOrName] = useState<Address | string>('');
  const { currentCurrency } = useCurrentCurrencyStore();

  const [, setAsset] = useState<ParsedAddressAsset>();

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

  return {
    asset,
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
    setToAddressOrName,
  };
};
