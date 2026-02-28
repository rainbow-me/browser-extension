import { useMemo, useState } from 'react';
import { Address, Hex, parseEther, parseUnits } from 'viem';

import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId, chainNameToIdMapping } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';
import { isNativeAsset } from '~/core/utils/chains';
import {
  getDataForNftTransfer,
  getDataForTokenTransfer,
} from '~/core/utils/transactions';

import { useEns } from '../useEns';

export const useSendState = ({
  assetAmount,
  asset,
  nft,
  rawMaxAssetBalanceAmount,
}: {
  assetAmount?: string;
  asset: ParsedUserAsset | null;
  nft?: UniqueAsset;
  rawMaxAssetBalanceAmount: bigint;
}) => {
  const [toAddressOrName, setToAddressOrName] = useState<Address | string>('');
  const { saveSendAddress } = usePopupInstanceStore();
  const { currentCurrency } = useCurrentCurrencyStore();

  const [, setAsset] = useState<ParsedUserAsset>();

  const { currentAddress: fromAddress } = useCurrentAddressStore();
  const getChainId = () => {
    if (asset) {
      return asset?.chainId ?? ChainId.mainnet;
    } else if (nft) {
      return nft?.network ? chainNameToIdMapping[nft.network] : ChainId.mainnet;
    }
    return ChainId.mainnet;
  };
  const chainId = getChainId();

  const { ensAddress: toAddress, ensName: toEnsName } = useEns({
    addressOrName: toAddressOrName ?? '',
  });

  const sendingNativeAsset = useMemo(
    () => !!asset && isNativeAsset(asset?.address, chainId),
    [asset, chainId],
  );

  const value = useMemo(
    () => (sendingNativeAsset && assetAmount ? parseEther(assetAmount) : 0n),
    [assetAmount, sendingNativeAsset],
  );

  const data = useMemo(() => {
    if (nft && toAddress) {
      return getDataForNftTransfer(fromAddress, toAddress, nft);
    }
    if (!asset || !toAddress || !assetAmount || sendingNativeAsset) return '0x';
    const rawAmount = parseUnits(assetAmount, asset?.decimals ?? 18);
    return getDataForTokenTransfer(rawAmount, toAddress);
  }, [assetAmount, asset, fromAddress, nft, sendingNativeAsset, toAddress]);

  const txToAddress: Address = useMemo(() => {
    const assetAddress = asset?.address;
    const isSendingNativeAsset = assetAddress
      ? isNativeAsset(assetAddress, chainId)
      : true;
    return (
      !isSendingNativeAsset && assetAddress ? assetAddress : toAddress
    ) as Address;
  }, [asset?.address, chainId, toAddress]);

  const maxAssetBalanceParams: { value: bigint } | { data: Hex } =
    useMemo(() => {
      if (nft && toAddress) {
        return {
          data: (getDataForNftTransfer(fromAddress, toAddress, nft) ??
            '0x') as Hex,
        };
      }
      if (!asset || asset.isNativeAsset) {
        return { value: rawMaxAssetBalanceAmount ?? 0n };
      }
      if (!toAddress) {
        return { data: '0x' as Hex };
      }
      return {
        data: getDataForTokenTransfer(
          rawMaxAssetBalanceAmount ?? 0n,
          toAddress as Address,
        ),
      };
    }, [asset, fromAddress, nft, rawMaxAssetBalanceAmount, toAddress]);

  return {
    asset,
    maxAssetBalanceParams,
    currentCurrency,
    toAddressOrName,
    chainId,
    data,
    fromAddress: fromAddress as Address,
    toAddress: toAddress as Address | undefined,
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
