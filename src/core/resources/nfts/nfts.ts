import { useInfiniteQuery } from '@tanstack/react-query';
import { Chain } from 'viem';
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
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import {
  PolygonAllowListDictionary,
  SimpleHashCollectionDetails,
  UniqueAsset,
} from '~/core/types/nfts';
import {
  getSimpleHashSupportedChainNames,
  getSimpleHashSupportedTestnetChainNames,
} from '~/core/utils/chains';
import {
  filterSimpleHashNFTs,
  simpleHashNFTToUniqueAsset,
} from '~/core/utils/nfts';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { NFTS_TEST_DATA, NFTS_TEST_DATA_0XF39 } from '~/test/utils';
const EMPTY_WALLET_ADDRESS = '0x3637f053D542E6D00Eee42D656dD7C59Fa33a62F';
const TEST_WALLET_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

const POLYGON_ALLOWLIST_STALE_TIME = 600000; // 10 minutes

// ///////////////////////////////////////////////
// Query Types

export type NftsArgs = {
  address: Address;
  testnetMode: boolean;
  userChains: Chain[];
};

// ///////////////////////////////////////////////
// Query Key

const nftsQueryKey = ({ address, testnetMode, userChains }: NftsArgs) =>
  createQueryKey(
    'nfts',
    { address, testnetMode, userChains },
    { persisterVersion: 3 },
  );

// ///////////////////////////////////////////////
// Query Function

async function nftsQueryFunction({
  queryKey: [{ address, testnetMode, userChains }],
  pageParam,
}: QueryFunctionArgs<typeof nftsQueryKey>) {
  if (
    process.env.IS_TESTING === 'true' &&
    isLowerCaseMatch(address, EMPTY_WALLET_ADDRESS)
  ) {
    return NFTS_TEST_DATA;
  }
  if (
    process.env.IS_TESTING === 'true' &&
    isLowerCaseMatch(address, TEST_WALLET_ADDRESS)
  ) {
    return NFTS_TEST_DATA_0XF39;
  }
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
  console.log('-- nfts', nfts);
  return {
    nfts,
    nextPage,
  };
}

type NftsResult = QueryFunctionResult<typeof nftsQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useNfts<TSelectData = NftsResult>(
  { address, testnetMode, userChains }: NftsArgs,
  config: InfiniteQueryConfig<NftsResult, Error, TSelectData> = {},
) {
  return useInfiniteQuery(
    nftsQueryKey({ address, testnetMode, userChains }),
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

export function getNftCount({ address, testnetMode, userChains }: NftsArgs) {
  const nftData:
    | {
        pages: {
          nfts: UniqueAsset[];
          nextPage?: string;
        }[];
        pageParams: (string | null)[];
      }
    | undefined = queryClient.getQueryData(
    nftsQueryKey({ address, testnetMode, userChains }),
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
