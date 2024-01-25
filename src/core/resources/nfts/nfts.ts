import { useInfiniteQuery } from '@tanstack/react-query';
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
import {
  SUPPORTED_MAINNET_CHAINS,
  SUPPORTED_TESTNET_CHAINS,
} from '~/core/references';
import { ChainName } from '~/core/types/chains';
import {
  PolygonAllowListDictionary,
  SimpleHashCollectionDetails,
  UniqueAsset,
} from '~/core/types/nfts';
import { getSimpleHashSupportedChainNames } from '~/core/utils/chains';
import {
  filterSimpleHashNFTs,
  simpleHashNFTToUniqueAsset,
} from '~/core/utils/nfts';

const POLYGON_ALLOWLIST_STALE_TIME = 600000; // 10 minutes

// ///////////////////////////////////////////////
// Query Types

export type NftsArgs = {
  address: Address;
  testnetMode: boolean;
};

// ///////////////////////////////////////////////
// Query Key

const nftsQueryKey = ({ address, testnetMode }: NftsArgs) =>
  createQueryKey('nfts', { address, testnetMode }, { persisterVersion: 2 });

// ///////////////////////////////////////////////
// Query Function

async function nftsQueryFunction({
  queryKey: [{ address, testnetMode }],
  pageParam,
}: QueryFunctionArgs<typeof nftsQueryKey>) {
  const simpleHashSupportedChains = getSimpleHashSupportedChainNames();
  const chains = (
    !testnetMode ? SUPPORTED_MAINNET_CHAINS : SUPPORTED_TESTNET_CHAINS
  )
    .map(({ name }) => name as ChainName)
    .filter((chainName) =>
      simpleHashSupportedChains.includes(chainName.toLowerCase()),
    );
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
  const collectionOwnerMap: Record<
    string,
    {
      distinct_nft_count: number;
      distinct_owner_count: number;
      total_quantity: number;
    }
  > = {};
  const collectionIds = filteredCollections
    .filter((c) => c.collection_id)
    .map((c) => {
      collectionOwnerMap[c.collection_id] = {
        distinct_nft_count: c.collection_details.distinct_nft_count,
        distinct_owner_count: c.collection_details.distinct_owner_count,
        total_quantity: c.collection_details.total_quantity,
      };
      return c.collection_id;
    });
  const nftsResponse = collectionIds?.length
    ? await fetchNfts({ address, chains, collectionIds })
    : [];
  const nfts = filterSimpleHashNFTs(nftsResponse, polygonAllowList).map(
    (nft) => {
      const uniqueAsset = simpleHashNFTToUniqueAsset(nft);
      const collectionOwnersData =
        collectionOwnerMap[nft.collection.collection_id || ''];
      if (collectionOwnersData) {
        return {
          ...uniqueAsset,
          collection: { ...uniqueAsset.collection, ...collectionOwnersData },
        };
      } else {
        return uniqueAsset;
      }
    },
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
  { address, testnetMode }: NftsArgs,
  config: InfiniteQueryConfig<NftsResult, Error, TSelectData> = {},
) {
  return useInfiniteQuery(
    nftsQueryKey({ address, testnetMode }),
    nftsQueryFunction,
    {
      ...config,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
      refetchInterval: 600000,
      retry: 3,
    },
  );
}

// ///////////////////////////////////////////////
// Query Utils

export function getNftCount({ address, testnetMode }: NftsArgs) {
  const nftData:
    | {
        pages: {
          nfts: UniqueAsset[];
          nextPage?: string;
        }[];
        pageParams: (string | null)[];
      }
    | undefined = queryClient.getQueryData(
    nftsQueryKey({ address, testnetMode }),
  );
  if (nftData?.pages) {
    const nfts = nftData?.pages
      .map((page: { nfts: UniqueAsset[]; nextPage?: string }) => page.nfts)
      .flat();
    return nfts?.length || 0;
  } else {
    return 0;
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
