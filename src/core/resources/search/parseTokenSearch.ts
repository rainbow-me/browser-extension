import { Address } from 'viem';

import {
  BNB_BSC_ADDRESS,
  ETH_ADDRESS,
  MATIC_POLYGON_ADDRESS,
} from '~/core/references';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';

const NATIVE_ASSET_UNIQUE_IDS = [
  `${ETH_ADDRESS}_${ChainId.mainnet}`,
  `${ETH_ADDRESS}_${ChainId.optimism}`,
  `${ETH_ADDRESS}_${ChainId.arbitrum}`,
  `${BNB_BSC_ADDRESS}_${ChainId.bsc}`,
  `${MATIC_POLYGON_ADDRESS}_${ChainId.polygon}`,
  `${ETH_ADDRESS}_${ChainId.base}`,
  `${ETH_ADDRESS}_${ChainId.zora}`,
  `${ETH_ADDRESS}_${ChainId.avalanche}`,
  `${ETH_ADDRESS}_${ChainId.blast}`,
  `${ETH_ADDRESS}_${ChainId.degen}`,
];

export function parseTokenSearch(
  asset: SearchAsset,
  chainId: ChainId,
): SearchAsset {
  const networkInfo = asset.networks[chainId];

  return {
    ...asset,
    address: networkInfo ? networkInfo.address : asset.address,
    chainId,
    decimals: networkInfo ? networkInfo.decimals : asset.decimals,
    isNativeAsset: NATIVE_ASSET_UNIQUE_IDS.includes(
      `${asset.uniqueId}_${chainId}`,
    ),
    mainnetAddress: asset.uniqueId as Address,
    uniqueId: `${networkInfo?.address || asset.uniqueId}_${chainId}`,
  };
}
