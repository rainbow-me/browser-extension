import { Address } from 'wagmi';

import { ETH_ADDRESS } from '~/core/references';
import {
  ParsedAddressAsset,
  ParsedAssetsDict,
  ParsedAssetsDictByChain,
  UniqueId,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { deriveAddressAndChainWithUniqueId } from '~/core/utils/address';
import { add } from '~/core/utils/numbers';

// selectors
export function selectUserAssetsList(assets?: ParsedAssetsDictByChain) {
  return Object.values(assets || {})
    .map((chainAssets) => Object.values(chainAssets))
    .flat()
    .sort(
      (a: ParsedAddressAsset, b: ParsedAddressAsset) =>
        parseFloat(b?.native?.balance?.amount) -
        parseFloat(a?.native?.balance?.amount),
    );
}

export function selectUserAssetsDictByChain(assets: ParsedAssetsDictByChain) {
  return assets;
}

export function selectUserAssetsListByChainId(assets: ParsedAssetsDictByChain) {
  const assetsByNetwork = [
    assets?.[ChainId.mainnet],
    assets?.[ChainId.optimism],
    assets?.[ChainId.polygon],
    assets?.[ChainId.arbitrum],
    assets?.[ChainId.bsc],
  ].flat();
  return assetsByNetwork
    .map((chainAssets) =>
      Object.values(chainAssets).sort(
        (a: ParsedAddressAsset, b: ParsedAddressAsset) =>
          parseFloat(b?.native?.balance?.amount) -
          parseFloat(a?.native?.balance?.amount),
      ),
    )
    .flat();
}

export function selectUserAssetAddressMapByChainId(
  assets?: ParsedAssetsDictByChain,
) {
  const mapAddresses = (list: ParsedAssetsDict) =>
    Object.values(list || {}).map((i) => i?.address);

  return Object.values(ChainId).reduce((result, chainId) => {
    const key = chainId as ChainId;
    result[key] = assets ? mapAddresses(assets[key]) : [];
    return result;
  }, {} as Record<ChainId, (Address | typeof ETH_ADDRESS)[]>);
}

// selector generators
export function selectUserAssetWithUniqueId(uniqueId: UniqueId) {
  return (assets: ParsedAssetsDictByChain) => {
    const { chain } = deriveAddressAndChainWithUniqueId(uniqueId);
    return assets?.[chain]?.[uniqueId];
  };
}

export function selectUserAssetsBalance() {
  return (assets: ParsedAssetsDictByChain) => {
    const networksTotalBalance = Object.values(assets).map((assetsOnject) => {
      const assetsNetwork = Object.values(assetsOnject);
      const networkBalance = assetsNetwork
        .map((asset) => asset.native.balance.amount)
        .reduce(
          (prevBalance, currBalance) => add(prevBalance, currBalance),
          '0',
        );
      return networkBalance;
    });
    const totalAssetsBalance = networksTotalBalance.reduce(
      (prevBalance, currBalance) => add(prevBalance, currBalance),
      '0',
    );
    return totalAssetsBalance;
  };
}
