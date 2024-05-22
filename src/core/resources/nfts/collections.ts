import { useInfiniteQuery } from '@tanstack/react-query';
import { Chain } from 'viem';
import { Address } from 'wagmi';

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
  getSimpleHashSupportedChainNames,
  getSimpleHashSupportedTestnetChainNames,
} from '~/core/utils/chains';

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

async function nftCollectionsQueryFunction({
  queryKey: [{ address, sort, testnetMode, userChains }],
  pageParam,
}: QueryFunctionArgs<typeof nftCollectionsQueryKey>) {
  const activeChainIds = userChains
    .filter((chain) => {
      return !testnetMode ? !chain.testnet : chain.testnet;
    })
    .map((chain) => chain.id);
  const simplehashChainNames = !testnetMode
    ? getSimpleHashSupportedChainNames()
    : getSimpleHashSupportedTestnetChainNames();
  const chains = simplehashChainNames.filter((simplehashChainName) => {
    const id = chainNameToIdMapping[simplehashChainName];
    return activeChainIds.includes(id) || simplehashChainName === 'gnosis';
  }) as ChainName[];
  const data = await fetchNftCollections({
    address,
    chains,
    nextPage: pageParam,
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
  return useInfiniteQuery(
    nftCollectionsQueryKey({ address, sort, testnetMode, userChains }),
    nftCollectionsQueryFunction,
    {
      ...config,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
      refetchInterval: 600000,
      retry: 3,
      staleTime: 600000,
    },
  );
}

// ///////////////////////////////////////////////
// Polygon Allow List Fetcher

function polygonAllowListFetcher() {
  return queryClient.fetchQuery<PolygonAllowListDictionary>(
    ['137-allowlist'],
    async () => await fetchPolygonAllowList(),
    { staleTime: POLYGON_ALLOWLIST_STALE_TIME },
  );
}
