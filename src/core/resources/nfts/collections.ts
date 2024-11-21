import { useInfiniteQuery } from '@tanstack/react-query';
import { Address, Chain } from 'viem';

import {
  fetchNftCollections,
  polygonAllowListFetcher,
} from '~/core/network/nfts';
import {
  InfiniteQueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { NftSort } from '~/core/state/nfts';
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { SimpleHashCollectionDetails } from '~/core/types/nfts';
import {
  simpleHashSupportedChainNames,
  simpleHashSupportedTestnetChainNames,
} from '~/core/utils/nfts';

export const MOCK_NFT_COLLECTION = [
  {
    collection_id: 'f7ff98307273f299b678b13e3f29ac13',
    distinct_nfts_owned: 4,
    distinct_nfts_owned_string: '4',
    total_copies_owned: 4,
    total_copies_owned_string: '4',
    last_acquired_date: '2024-03-03T15:07:30Z',
    nft_ids: [
      'gnosis.0x22c1f6050e56d2876009903609a2cc3fef83b415.6682088',
      'gnosis.0x22c1f6050e56d2876009903609a2cc3fef83b415.6707380',
      'gnosis.0x22c1f6050e56d2876009903609a2cc3fef83b415.6945644',
      'gnosis.0x22c1f6050e56d2876009903609a2cc3fef83b415.7054159',
    ],
    collection_details: {
      name: 'POAP',
      description: 'The Proof of Attendance Protocol',
      image_url:
        'https://lh3.googleusercontent.com/tOzkCPkfPuwnhNfb4thFA_6xiojAFHTNEPuCYnZS3q3GF4zNneOxowGQNpOI5Gr_-fVYC5eBFIf79HQvtsyEDpVRW2olLdlnPg',
      banner_image_url: '',
      category: null,
      is_nsfw: false,
      external_url: 'https://www.poap.xyz/',
      twitter_username: '',
      discord_url: '',
      instagram_username: null,
      medium_username: null,
      telegram_url: null,
      marketplace_pages: [],
      metaplex_mint: null,
      metaplex_first_verified_creator: null,
      spam_score: 0,
      floor_prices: [],
      distinct_owner_count: 1336860,
      distinct_nft_count: 7131380,
      total_quantity: 7131380,
      chains: ['gnosis'],
      top_contracts: ['gnosis.0x22c1f6050e56d2876009903609a2cc3fef83b415'],
    },
  },
];

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
