import { useInfiniteQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

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
    nextPage: pageParam,
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
  return useInfiniteQuery(
    nftsForCollectionQueryKey({ address, collectionId, collectionChains }),
    nftsForCollectionQueryFunction,
    {
      ...config,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
      refetchInterval: 600000,
      retry: 3,
      staleTime: 600000,
    },
  );
}
