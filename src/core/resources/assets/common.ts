import { Address } from 'viem';

import { createQueryKey } from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import {
  AssetApiResponse,
  ParsedAssetsDictByChain,
  ParsedUserAsset,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  fetchAssetBalanceViaProvider,
  parseUserAsset,
} from '~/core/utils/assets';
import { greaterThan } from '~/core/utils/numbers';
import { getProvider } from '~/core/wagmi/clientToProvider';
import {
  DAI_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  OPTIMISM_MAINNET_ASSET,
  USDC_MAINNET_ASSET,
} from '~/test/utils';

export type UserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  testnetMode?: boolean;
};
export const userAssetsQueryKey = ({
  address,
  currency,
  testnetMode,
}: UserAssetsArgs) =>
  createQueryKey(
    'userAssets',
    { address, currency, testnetMode },
    { persisterVersion: 3 },
  );

export type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

export async function parseUserAssets({
  address,
  assets,
  chainIds,
  currency,
}: {
  address: Address;
  assets: {
    quantity: string;
    small_balance?: boolean;
    asset: AssetApiResponse;
  }[];
  chainIds: ChainId[];
  currency: SupportedCurrencyKey;
}) {
  const parsedAssetsDict = chainIds.reduce(
    (dict, currentChainId) => ({ ...dict, [currentChainId]: {} }),
    {},
  ) as ParsedAssetsDictByChain;
  for (const { asset, quantity, small_balance } of assets) {
    if (greaterThan(quantity, 0)) {
      const parsedAsset = parseUserAsset({
        asset,
        currency,
        balance: quantity,
        smallBalance: small_balance,
      });
      parsedAssetsDict[parsedAsset?.chainId][parsedAsset.uniqueId] =
        parsedAsset;
    }
  }

  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore.getState();
  if (connectedToHardhat || connectedToHardhatOp) {
    // separating out these ternaries for readability
    const selectedHardhatChainId = connectedToHardhat
      ? ChainId.hardhat
      : ChainId.hardhatOptimism;

    const mainnetOrOptimismChainId = connectedToHardhat
      ? ChainId.mainnet
      : ChainId.optimism;

    const ethereumOrOptimismAsset = connectedToHardhat
      ? ETH_MAINNET_ASSET
      : OPTIMISM_MAINNET_ASSET;

    // Ensure assets are checked if connected to hardhat
    const assets = parsedAssetsDict[mainnetOrOptimismChainId];
    assets[ethereumOrOptimismAsset.uniqueId] = ethereumOrOptimismAsset;
    if (process.env.IS_TESTING === 'true') {
      assets[USDC_MAINNET_ASSET.uniqueId] = USDC_MAINNET_ASSET;
      assets[DAI_MAINNET_ASSET.uniqueId] = DAI_MAINNET_ASSET;
    }

    const balanceRequests = Object.values(assets).map(async (asset) => {
      if (asset.chainId !== mainnetOrOptimismChainId) return asset;
      const provider = getProvider({ chainId: selectedHardhatChainId });
      try {
        const parsedAsset = await fetchAssetBalanceViaProvider({
          parsedAsset: asset,
          currentAddress: address,
          currency,
          provider,
        });
        return parsedAsset;
      } catch (e) {
        return asset;
      }
    });

    const newParsedAssetsByUniqueId = await Promise.all(balanceRequests);
    const newAssets = newParsedAssetsByUniqueId.reduce<
      Record<string, ParsedUserAsset>
    >((acc, parsedAsset) => {
      acc[parsedAsset.uniqueId] = parsedAsset;
      return acc;
    }, {});
    // eslint-disable-next-line require-atomic-updates
    parsedAssetsDict[mainnetOrOptimismChainId] = newAssets;
  }
  return parsedAssetsDict;
}
