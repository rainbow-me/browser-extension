/**
 * This file is copied from assets.ts file.
 * It's imported by the iframe entrypoint and therefore a seperate import with almost no imports is the way to go.
 */

import { zeroAddress } from 'viem';

import { ETH_ADDRESS } from '../references';
import { customChainIdsToAssetNames } from '../references/assets';
import type { AddressOrEth } from '../types/assets';
import type { ChainId } from '../types/chains';

export const getCustomChainIconUrl = (
  chainId: ChainId,
  address: AddressOrEth,
) => {
  if (!chainId || !customChainIdsToAssetNames[chainId]) return '';
  const baseUrl =
    'https://raw.githubusercontent.com/rainbow-me/assets/master/blockchains/';

  if (address === zeroAddress || address === ETH_ADDRESS) {
    return `${baseUrl}${customChainIdsToAssetNames[chainId]}/info/logo.png`;
  } else {
    return `${baseUrl}${customChainIdsToAssetNames[chainId]}/assets/${address}/logo.png`;
  }
};
