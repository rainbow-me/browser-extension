import { useInfiniteQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { fetchNfts } from '~/core/network/nfts';
import {
  InfiniteQueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { ChainName } from '~/core/types/chains';
import {
  filterSimpleHashNFTs,
  simpleHashNFTToUniqueAsset,
} from '~/core/utils/nfts';

// ///////////////////////////////////////////////
// Query Types

export type NftsForCollectionArgs = {
  address: Address;
  collectionId: string;
  collectionChains: ChainName[];
};

// ///////////////////////////////////////////////
// Query Key

const nftsForCollectionQueryKey = ({
  address,
  collectionId,
  collectionChains,
}: NftsForCollectionArgs) =>
  createQueryKey(
    'nftsForCollection',
    { address, collectionId, collectionChains },
    { persisterVersion: 0 },
  );

// ///////////////////////////////////////////////
// Query Function

async function nftsForCollectionQueryFunction({
  queryKey: [{ address, collectionId, collectionChains }],
  pageParam,
}: QueryFunctionArgs<typeof nftsForCollectionQueryKey>) {
  const result = await fetchNfts({
    address,
    chains: collectionChains,
    collectionIds: [collectionId],
    nextPage: pageParam as string | undefined,
  });
  const nfts = filterSimpleHashNFTs(result?.nfts, {})?.map((n) =>
    simpleHashNFTToUniqueAsset(n),
  );
  return {
    nfts,
    nextPage: result?.nextPage,
  };
}

type NftsForCollectionResult = QueryFunctionResult<
  typeof nftsForCollectionQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useNftsForCollection<TSelectData = NftsForCollectionResult>(
  { address, collectionId, collectionChains }: NftsForCollectionArgs,
  config: InfiniteQueryConfig<NftsForCollectionResult, Error, TSelectData> = {},
) {
  return useInfiniteQuery({
    queryKey: nftsForCollectionQueryKey({
      address,
      collectionId,
      collectionChains,
    }),
    queryFn: nftsForCollectionQueryFunction,
    ...config,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: null,
    refetchInterval: 60000,
    retry: 3,
    staleTime: 60000,
  });
}
