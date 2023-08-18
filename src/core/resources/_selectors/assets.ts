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

export function selectUserAssetsFilteringSmallBalancesList(
  assets: ParsedAssetsDictByChain,
) {
  return selectUserAssetsList(assets).filter(
    (a) => parseFloat(a?.native?.balance?.amount) > 1,
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
    assets?.[ChainId.base],
    assets?.[ChainId.zora],
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
    [ChainId.base]: mapAddresses(assets?.[ChainId.base]) || [],
    [ChainId.zora]: mapAddresses(assets?.[ChainId.zora]) || [],
  };
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
