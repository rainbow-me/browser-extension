import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { Address, Chain } from 'viem';

import { fetchGalleryNfts, fetchPolygonAllowList } from '~/core/network/nfts';
import {
  InfiniteQueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { NftSort } from '~/core/state/nfts';
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { PolygonAllowListDictionary } from '~/core/types/nfts';
import {
  filterSimpleHashNFTs,
  simpleHashNFTToUniqueAsset,
  simpleHashSupportedChainNames,
  simpleHashSupportedTestnetChainNames,
} from '~/core/utils/nfts';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { NFTS_TEST_DATA } from '~/test/utils';

const POLYGON_ALLOWLIST_STALE_TIME = 600000; // 10 minutes
const EMPTY_WALLET_ADDRESS = '0x3637f053D542E6D00Eee42D656dD7C59Fa33a62F';

// ///////////////////////////////////////////////
// Query Types

export type GalleryNftsArgs = {
  address: Address;
  sort: NftSort;
  testnetMode: boolean;
  userChains: Chain[];
};

// ///////////////////////////////////////////////
// Query Key

const galleryNftsQueryKey = ({
  address,
  sort,
  testnetMode,
  userChains,
}: GalleryNftsArgs) =>
  createQueryKey(
    'galleryNfts',
    { address, sort, testnetMode, userChains },
    { persisterVersion: 0 },
  );

// ///////////////////////////////////////////////
// Query Function

async function galleryNftsQueryFunction({
  queryKey: [{ address, sort, testnetMode, userChains }],
  pageParam,
}: QueryFunctionArgs<typeof galleryNftsQueryKey>) {
  if (
    process.env.IS_TESTING === 'true' &&
    isLowerCaseMatch(address, EMPTY_WALLET_ADDRESS)
  ) {
    return getGalleryNftsTestData({ sort });
  }
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
  const data = await fetchGalleryNfts({
    address,
    chains,
    nextPage: pageParam as string | undefined,
    sort: sort === 'alphabetical' ? 'name__asc' : 'last_acquired_date__desc',
  });
  const polygonAllowList = await polygonAllowListFetcher();
  const nfts = filterSimpleHashNFTs(data?.nfts, polygonAllowList)?.map((n) =>
    simpleHashNFTToUniqueAsset(n),
  );
  return {
    nfts,
    nextPage: data?.nextPage,
  };
}

type GalleryNftsResult = QueryFunctionResult<typeof galleryNftsQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useGalleryNfts<TSelectData = GalleryNftsResult>(
  { address, sort, testnetMode, userChains }: GalleryNftsArgs,
  config: InfiniteQueryConfig<GalleryNftsResult, Error, TSelectData> = {},
): UseInfiniteQueryResult<TSelectData> {
  return useInfiniteQuery({
    queryKey: galleryNftsQueryKey({ address, sort, testnetMode, userChains }),
    queryFn: galleryNftsQueryFunction,
    ...config,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: null,
    refetchInterval: 60000,
    retry: 3,
    staleTime: 60000,
  });
}

function getGalleryNftsTestData({ sort }: { sort: NftSort }) {
  if (sort === 'alphabetical') {
    return {
      ...NFTS_TEST_DATA,
      nfts: [...NFTS_TEST_DATA.nfts].reverse(),
    };
  }
  return NFTS_TEST_DATA;
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
