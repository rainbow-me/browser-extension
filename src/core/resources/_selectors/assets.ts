import {
  ParsedAddressAsset,
  ParsedAssetsDict,
  ParsedAssetsDictByChain,
  UniqueId,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { deriveAddressAndChainWithUniqueId } from '~/core/utils/address';

// selectors
export function selectUserAssetsList(assets: ParsedAssetsDictByChain) {
  return Object.values(assets)
    .map((chainAssets) => Object.values(chainAssets))
    .flat()
    .sort(
      (a: ParsedAddressAsset, b: ParsedAddressAsset) =>
        parseFloat(b?.native?.balance?.amount) -
        parseFloat(a?.native?.balance?.amount),
    );
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
    .map((chainAssets) => Object.values(chainAssets))
    .flat();
}

export function selectUserAssetAddressMapByChainId(
  assets: ParsedAssetsDictByChain,
) {
  const mapAddresses = (list: ParsedAssetsDict) =>
    Object.values(list || {}).map((i) => i?.address);
  return {
    [ChainId.mainnet]: mapAddresses(assets?.[ChainId.mainnet]) || [],
    [ChainId.optimism]: mapAddresses(assets?.[ChainId.optimism]) || [],
    [ChainId.bsc]: mapAddresses(assets?.[ChainId.bsc]) || [],
    [ChainId.polygon]: mapAddresses(assets?.[ChainId.polygon]) || [],
    [ChainId.arbitrum]: mapAddresses(assets?.[ChainId.arbitrum]) || [],
  };
}

// selector generators
export function selectUserAssetWithUniqueId(uniqueId: UniqueId) {
  return (assets: ParsedAssetsDictByChain) => {
    const { chain } = deriveAddressAndChainWithUniqueId(uniqueId);
    return assets?.[chain]?.[uniqueId];
  };
}
