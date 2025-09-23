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

type UserAssetsArgs = {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

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
  console.log('[parseUserAssets] START:', {
    address,
    assetsCount: assets.length,
    chainIds,
    currency,
    firstAsset: assets[0],
    allAssets: assets,
  });
  const parsedAssetsDict = chainIds.reduce(
    (dict, currentChainId) => ({ ...dict, [currentChainId]: {} }),
    {},
  ) as ParsedAssetsDictByChain;
  console.log('[parseUserAssets] Initial dict created for chains:', chainIds);

  for (const { asset, quantity, small_balance } of assets) {
    console.log('[parseUserAssets] Processing asset:', {
      asset_code: asset?.asset_code,
      chain_id: asset?.chain_id,
      quantity,
      symbol: asset?.symbol,
      full_asset: asset,
    });
    if (greaterThan(quantity, 0)) {
      const parsedAsset = parseUserAsset({
        asset,
        currency,
        balance: quantity,
        smallBalance: small_balance,
      });
      parsedAssetsDict[parsedAsset?.chainId][parsedAsset.uniqueId] =
        parsedAsset;
      console.log('[parseUserAssets] Added asset to dict:', {
        chainId: parsedAsset?.chainId,
        uniqueId: parsedAsset.uniqueId,
        symbol: parsedAsset.symbol,
      });
    } else {
      console.log('[parseUserAssets] Skipped asset (quantity <= 0):', {
        asset_code: asset?.asset_code,
        quantity,
      });
    }
  }
  console.log('[parseUserAssets] After processing all assets, dict state:', {
    chains: Object.keys(parsedAssetsDict),
    assetCounts: Object.entries(parsedAssetsDict).map(([chainId, assets]) => ({
      chainId,
      count: Object.keys(assets).length,
    })),
  });

  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore.getState();
  console.log('[parseUserAssets] Hardhat state:', {
    connectedToHardhat,
    connectedToHardhatOp,
    IS_TESTING: process.env.IS_TESTING,
    assetsLength: assets.length,
    chainIds,
  });
  // TEMPORARY DEBUG - Remove this after testing
  if (process.env.IS_TESTING === 'true') {
    console.error(
      '[DEBUG] IS_TESTING is true, connectedToHardhat:',
      connectedToHardhat,
      'connectedToHardhatOp:',
      connectedToHardhatOp,
    );
  }

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
    // Initialize the chain entry if it doesn't exist
    if (!parsedAssetsDict[mainnetOrOptimismChainId]) {
      parsedAssetsDict[mainnetOrOptimismChainId] = {};
    }
    const assets = parsedAssetsDict[mainnetOrOptimismChainId];
    console.log(
      '[parseUserAssets] Adding hardhat assets to chain:',
      mainnetOrOptimismChainId,
    );
    assets[ethereumOrOptimismAsset.uniqueId] = ethereumOrOptimismAsset;
    if (process.env.IS_TESTING === 'true') {
      assets[USDC_MAINNET_ASSET.uniqueId] = USDC_MAINNET_ASSET;
      assets[DAI_MAINNET_ASSET.uniqueId] = DAI_MAINNET_ASSET;
      console.log('[parseUserAssets] Added test assets:', {
        ETH: ethereumOrOptimismAsset.uniqueId,
        USDC: USDC_MAINNET_ASSET.uniqueId,
        DAI: DAI_MAINNET_ASSET.uniqueId,
        totalAssetsInChain: Object.keys(assets).length,
      });
    } else {
      console.log(
        '[parseUserAssets] NOT adding test assets - IS_TESTING:',
        process.env.IS_TESTING,
      );
    }

    const balanceRequests = Object.values(assets).map(async (asset) => {
      if (asset.chainId !== mainnetOrOptimismChainId) return asset;
      // Skip provider fetch in test mode - use hardcoded test balances
      if (process.env.IS_TESTING === 'true') {
        console.log(
          '[parseUserAssets] Skipping provider fetch in test mode for:',
          asset.symbol,
        );
        return asset;
      }
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
    console.log('[parseUserAssets] After hardhat balance fetch:', {
      chainId: mainnetOrOptimismChainId,
      assetCount: Object.keys(newAssets).length,
      assetKeys: Object.keys(newAssets),
    });
  } else {
    console.log('[parseUserAssets] NOT connected to hardhat');
  }
  const totalAssets = Object.values(parsedAssetsDict).reduce(
    (sum, chainAssets) => sum + Object.keys(chainAssets).length,
    0,
  );
  console.log('[parseUserAssets] Final result:', {
    chains: Object.keys(parsedAssetsDict),
    totalAssets,
    byChain: Object.entries(parsedAssetsDict).map(([chainId, assets]) => ({
      chainId,
      assetCount: Object.keys(assets).length,
    })),
  });
  return parsedAssetsDict;
}
