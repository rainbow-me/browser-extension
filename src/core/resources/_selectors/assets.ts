import {
  ParsedAddressAsset,
  ParsedAssetsDictByChain,
  UniqueId,
} from '~/core/types/assets';
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

// selector generators
export function selectUserAssetWithUniqueId(uniqueId: UniqueId) {
  return (assets: ParsedAssetsDictByChain) => {
    const { chain } = deriveAddressAndChainWithUniqueId(uniqueId);
    return assets?.[chain]?.[uniqueId];
  };
}
