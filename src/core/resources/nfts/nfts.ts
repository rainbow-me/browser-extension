import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { Address } from 'wagmi';

import {
  fetchNftCollections,
  fetchNfts,
  fetchPolygonAllowList,
} from '~/core/network/nfts';
import {
  InfiniteQueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ChainName } from '~/core/types/chains';
import {
  PolygonAllowListDictionary,
  SimpleHashCollectionDetails,
} from '~/core/types/nfts';
import { getSupportedChains } from '~/core/utils/chains';
import {
  filterSimpleHashNFTs,
  simpleHashNFTToUniqueAsset,
} from '~/core/utils/nfts';

const POLYGON_ALLOWLIST_STALE_TIME = 600000; // 10 minutes

// ///////////////////////////////////////////////
// Query Types

export type NftsArgs = {
  address: Address;
};

// ///////////////////////////////////////////////
// Query Key

const nftsQueryKey = ({ address }: NftsArgs) =>
  createQueryKey('nfts', { address }, { persisterVersion: 1 });

// ///////////////////////////////////////////////
// Query Function

async function nftsQueryFunction({
  queryKey: [{ address }],
  pageParam,
}: QueryFunctionArgs<typeof nftsQueryKey>) {
  const chains = getSupportedChains().map((chain) => chain.name as ChainName);
  const polygonAllowList = await polygonAllowListFetcher();
  const acquisitionMap: Record<string, string> = {};
  const collectionsResponse = await fetchNftCollections({
    address,
    chains,
    cursor: pageParam,
  });
  const collections = collectionsResponse.collections;
  const nextPage = collectionsResponse.nextPage;
  const filteredCollections = collections?.filter(
    (collection: SimpleHashCollectionDetails) => {
      const polygonContractAddressString =
        collection.collection_details.top_contracts.find((contract) =>
          contract.includes('polygon'),
        );
      const shouldPrefilterPolygonContract =
        collection.collection_details.top_contracts.length === 1 &&
        polygonContractAddressString;

      // we can significantly reduce the list size when requesting nfts
      // by locating collections only available on polygon
      // and prefiltering at the collection level

      if (shouldPrefilterPolygonContract) {
        const polygonContractAddress =
          polygonContractAddressString.split('.')[1];
        return polygonAllowList[polygonContractAddress.toLowerCase()];
      } else {
        if (collection.collection_id && collection.last_acquired_date) {
          acquisitionMap[collection.collection_id] =
            collection.last_acquired_date;
        }
        return true;
      }
    },
  );
  const collectionIds = filteredCollections
    .filter((c) => c.collection_id)
    .map((c) => c.collection_id);
  const nftsResponse = await fetchNfts({ address, chains, collectionIds });
  const nfts = filterSimpleHashNFTs(nftsResponse, polygonAllowList).map((nft) =>
    simpleHashNFTToUniqueAsset(nft),
  );
  return {
    nfts,
    nextPage,
  };
}

type NftsResult = QueryFunctionResult<typeof nftsQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useNfts<TSelectData = NftsResult>(
  { address }: NftsArgs,
  config: InfiniteQueryConfig<NftsResult, Error, TSelectData> = {},
) {
  return useInfiniteQuery(nftsQueryKey({ address }), nftsQueryFunction, {
    ...config,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    refetchInterval: 10000,
    retry: 3,
  });
}

// ///////////////////////////////////////////////
// Query Utils

export function getNftCount({ address }: NftsArgs) {
  const nftData: UseInfiniteQueryResult<NftsResult, Error> | undefined =
    queryClient.getQueryData(nftsQueryKey({ address }));
  console.log('base data: ', nftData);
  if (nftData?.data?.pages) {
    const nfts = nftData?.data?.pages;
    console.log('NFTS: ', nfts);
  }
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
