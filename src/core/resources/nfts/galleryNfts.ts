import { useInfiniteQuery } from '@tanstack/react-query';
import { Chain } from 'viem';
import { Address } from 'wagmi';

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
  getSimpleHashSupportedChainNames,
  getSimpleHashSupportedTestnetChainNames,
} from '~/core/utils/chains';
import {
  filterSimpleHashNFTs,
  simpleHashNFTToUniqueAsset,
} from '~/core/utils/nfts';

const POLYGON_ALLOWLIST_STALE_TIME = 600000; // 10 minutes

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
  //   if (
  //     process.env.IS_TESTING === 'true' &&
  //     isLowerCaseMatch(address, EMPTY_WALLET_ADDRESS)
  //   ) {
  //     return NFTS_TEST_DATA;
  //   }
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
  const data = await fetchGalleryNfts({
    address,
    chains,
    nextPage: pageParam,
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
) {
  return useInfiniteQuery(
    galleryNftsQueryKey({ address, sort, testnetMode, userChains }),
    galleryNftsQueryFunction,
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
