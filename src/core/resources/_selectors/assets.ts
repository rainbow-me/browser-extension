import { useNetworkStore } from '~/core/state/networks/networks';
import {
  ParsedAssetsDictByChain,
  ParsedUserAsset,
  UniqueId,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { deriveAddressAndChainWithUniqueId } from '~/core/utils/address';
import { add } from '~/core/utils/numbers';

// selectors
export function selectorFilterByUserChains<T>({
  data,
  selector,
  chain,
}: {
  data: ParsedAssetsDictByChain;
  selector: (data: ParsedAssetsDictByChain) => T;
  chain?: ChainId;
}): T {
  const chainIdsBasedOnMainnetId = useNetworkStore
    .getState()
    .getBackendChainIdsByMainnetId();
  const { enabledChainIds } = useNetworkStore.getState();
  const allUserChainIds = Array.from(enabledChainIds)
    .map((chainId) => {
      const backendChainIds = chainIdsBasedOnMainnetId[chainId];
      if (!enabledChainIds.has(chainId)) return [];

      if (backendChainIds) {
        return [...backendChainIds, chainId];
      }
      return [chainId];
    })
    .flat()
    .filter(Boolean);

  const filteredAssetsDictByChain = Object.keys(data).reduce((acc, key) => {
    const chainKey = Number(key);
    if (chain === chainKey || (!chain && allUserChainIds.includes(chainKey))) {
      acc[chainKey] = data[chainKey];
    }
    return acc;
  }, {} as ParsedAssetsDictByChain);

  return selector(filteredAssetsDictByChain);
}

export function selectUserAssetsList(assets: ParsedAssetsDictByChain) {
  return Object.values(assets)
    .map((chainAssets) => Object.values(chainAssets))
    .flat()
    .sort(
      (a: ParsedUserAsset, b: ParsedUserAsset) =>
        parseFloat(b?.native?.balance?.amount) -
        parseFloat(a?.native?.balance?.amount),
    );
}

export function selectUserAssetsFilteringSmallBalancesList(
  assets: ParsedAssetsDictByChain,
) {
  return selectUserAssetsList(assets).filter((a) => !a.smallBalance);
}

export function selectUserAssetsDictByChain(assets: ParsedAssetsDictByChain) {
  return assets;
}

export function selectUserAssetsListByChainId(assets: ParsedAssetsDictByChain) {
  const assetsByNetwork = useNetworkStore
    .getState()
    .getSupportedAssetsChainIds()
    .map((chain) => assets?.[chain])
    .filter(Boolean)
    .filter((chainAssets) => Object.keys(chainAssets).length > 0);

  return assetsByNetwork
    .map((chainAssets) =>
      Object.values(chainAssets).sort(
        (a: ParsedUserAsset, b: ParsedUserAsset) =>
          parseFloat(b?.native?.balance?.amount) -
          parseFloat(a?.native?.balance?.amount),
      ),
    )
    .flat();
}

// selector generators
export function selectUserAssetWithUniqueId(uniqueId: UniqueId) {
  return (assets: ParsedAssetsDictByChain) => {
    const { chain } = deriveAddressAndChainWithUniqueId(uniqueId);
    return assets?.[chain]?.[uniqueId];
  };
}

export function selectUserAssetsBalance(
  assets: ParsedAssetsDictByChain,
  hidden: (asset: ParsedUserAsset) => boolean,
) {
  const networksTotalBalance = Object.values(assets).map((assetsOnject) => {
    const assetsNetwork = Object.values(assetsOnject);

    const networkBalance = assetsNetwork
      .filter((asset) => !hidden(asset))
      .map((asset) => asset.native.balance.amount)
      .reduce((prevBalance, currBalance) => add(prevBalance, currBalance), '0');
    return networkBalance;
  });
  const totalAssetsBalance = networksTotalBalance.reduce(
    (prevBalance, currBalance) => add(prevBalance, currBalance),
    '0',
  );
  return totalAssetsBalance;
}
