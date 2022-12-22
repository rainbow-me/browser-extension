import { parseEther } from 'ethers/lib/utils';
import { useMemo, useState } from 'react';
import { Address, useAccount } from 'wagmi';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { convertAmountToRawAmount } from '~/core/utils/numbers';
import { getDataForTokenTransfer } from '~/core/utils/transactions';

import { useEns } from '../useEns';

export const useSendTransactionState = ({
  assetAmount,
  asset,
}: {
  assetAmount?: string;
  asset: ParsedAddressAsset | null;
}) => {
  const [toAddressOrName, setToAddressOrName] = useState<Address | string>('');
  const { currentCurrency } = useCurrentCurrencyStore();

  const [, setAsset] = useState<ParsedAddressAsset>();

  const { address: fromAddress } = useAccount();
  const chainId = asset?.chainId ?? ChainId.mainnet;

  const { ensAddress: destinationAddress, ensName: toEnsName } = useEns({
    addressOrName: toAddressOrName ?? '',
  });

  const sendingNativeAsset = useMemo(
    () => !!asset && isNativeAsset(asset?.address, chainId),
    [asset, chainId],
  );

  const value = useMemo(
    () => (sendingNativeAsset && assetAmount ? parseEther(assetAmount) : '0x0'),
    [assetAmount, sendingNativeAsset],
  );

  const data = useMemo(() => {
    if (!asset || !destinationAddress || !assetAmount || sendingNativeAsset)
      return '0x';
    const rawAmount = convertAmountToRawAmount(assetAmount, asset?.decimals);
    return getDataForTokenTransfer(rawAmount, destinationAddress);
  }, [assetAmount, asset, sendingNativeAsset, destinationAddress]);

  const toAddress: Address = useMemo(() => {
    const assetAddress = asset?.address;
    const isSendingNativeAsset = assetAddress
      ? isNativeAsset(assetAddress, chainId)
      : true;
    return !isSendingNativeAsset && assetAddress
      ? assetAddress
      : destinationAddress;
  }, [asset?.address, chainId, destinationAddress]);

  return {
    asset,
    currentCurrency,
    destinationAddress,
    toAddressOrName,
    chainId,
    data,
    fromAddress,
    toAddress,
    toEnsName,
    value,
    setAsset,
    setToAddressOrName,
  };
};
