import { useInfiniteQuery } from '@tanstack/react-query';
import { Address, Chain } from 'viem';

import {
  fetchNftCollections,
  fetchPolygonAllowList,
} from '~/core/network/nfts';
import {
  InfiniteQueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { NftSort } from '~/core/state/nfts';
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import {
  PolygonAllowListDictionary,
  SimpleHashCollectionDetails,
} from '~/core/types/nfts';
import {
  simpleHashSupportedChainNames,
  simpleHashSupportedTestnetChainNames,
} from '~/core/utils/nfts';

const POLYGON_ALLOWLIST_STALE_TIME = 600000; // 10 minutes

// ///////////////////////////////////////////////
// Query Types

export type NftCollectionsArgs = {
  address: Address;
  sort: NftSort;
  testnetMode: boolean;
  userChains: Chain[];
};

// ///////////////////////////////////////////////
// Query Key

const nftCollectionsQueryKey = ({
  address,
  sort,
  testnetMode,
  userChains,
}: NftCollectionsArgs) =>
  createQueryKey(
    'nftCollections',
    { address, sort, testnetMode, userChains },
    { persisterVersion: 0 },
  );

// ///////////////////////////////////////////////
// Query Function

type _QueryResult = {
  collections: SimpleHashCollectionDetails[];
  nextPage?: string | null;
  pages?: { collections: SimpleHashCollectionDetails[] };
};

async function nftCollectionsQueryFunction({
  queryKey: [{ address, sort, testnetMode, userChains }],
  pageParam,
}: QueryFunctionArgs<typeof nftCollectionsQueryKey>): Promise<_QueryResult> {
  const activeChainIds = userChains
    .filter((chain) => {
      return !testnetMode ? !chain.testnet : chain.testnet;
    })
    .map((chain) => chain.id);
  const simplehashChainNames = !testnetMode
    ? simpleHashSupportedChainNames
    : simpleHashSupportedTestnetChainNames;
  const chains = simplehashChainNames.filter((simplehashChainName) => {
    const id = chainNameToIdMapping[simplehashChainName];
    return activeChainIds.includes(id) || simplehashChainName === 'gnosis';
  }) as ChainName[];
  const data = await fetchNftCollections({
    address,
    chains,
    nextPage: pageParam as string | undefined,
    sort: sort === 'alphabetical' ? 'name__asc' : 'last_acquired_date__desc',
  });
  const polygonAllowList = await polygonAllowListFetcher();
  const filteredCollections = data?.collections?.filter(
    (collection: SimpleHashCollectionDetails) => {
      const polygonContractAddressString =
        collection.collection_details.top_contracts.find((contract) =>
          contract.includes('polygon'),
        );
      const shouldPrefilterPolygonContract =
        collection.collection_details.top_contracts.length === 1 &&
        polygonContractAddressString;

      if (shouldPrefilterPolygonContract) {
        const polygonContractAddress =
          polygonContractAddressString.split('.')[1];
        return polygonAllowList[polygonContractAddress.toLowerCase()];
      } else {
        return true;
      }
    },
  );
  return {
    collections: filteredCollections,
    nextPage: data?.nextPage,
  };
}

type NftCollectionsResult = QueryFunctionResult<
  typeof nftCollectionsQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useNftCollections<TSelectData = NftCollectionsResult>(
  { address, sort, testnetMode, userChains }: NftCollectionsArgs,
  config: InfiniteQueryConfig<NftCollectionsResult, Error, TSelectData> = {},
) {
  return useInfiniteQuery({
    queryKey: nftCollectionsQueryKey({
      address,
      sort,
      testnetMode,
      userChains,
    }),
    queryFn: nftCollectionsQueryFunction,
    ...config,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: undefined,
    refetchInterval: 60000,
    retry: 3,
  });
}

// ///////////////////////////////////////////////
// Polygon Allow List Fetcher

function polygonAllowListFetcher() {
  return queryClient.fetchQuery<PolygonAllowListDictionary>({
    queryKey: ['137-allowList'],
    queryFn: async () => await fetchPolygonAllowList(),
    staleTime: POLYGON_ALLOWLIST_STALE_TIME,
  });
}
