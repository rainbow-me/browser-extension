import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { fetchNft } from '~/core/network/nfts';
import { createQueryKey } from '~/core/react-query';
import { ChainId } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';

export function useNft(
  {
    contractAddress,
    chainId,
    tokenId,
  }: {
    contractAddress: Address;
    chainId: ChainId;
    tokenId: string;
  },
  { initialData }: { initialData: UniqueAsset },
) {
  return useQuery({
    queryKey: createQueryKey(
      'nft',
      { contractAddress, chainId, tokenId },
      { persisterVersion: 1 },
    ),
    queryFn: ({ queryKey }) => fetchNft(queryKey[0]),
    initialData,
    initialDataUpdatedAt: initialData !== undefined ? Date.now() : 0,
    enabled: !!contractAddress && !!chainId && !!tokenId,
    // TODO: restore this when we find a SimpleHash replacement
    // retry: 3,
    staleTime: Infinity, // Keep data in cache indefinitely
    gcTime: Infinity, // Keep data in cache indefinitely
  });
}
