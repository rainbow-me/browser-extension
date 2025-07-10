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

export const MOCK_NFTS_FOR_COLLECTION = [
  {
    lastSalePaymentToken: 'ETH',
    asset_contract: {
      address: '0x22c1f6050e56d2876009903609a2cc3fef83b415',
      name: 'POAP',
      schema_name: 'ERC721',
      symbol: 'The Proof of Attendance Protocol',
      deployed_by: null,
    },
    background: null,
    collection: {
      description: 'The Proof of Attendance Protocol',
      discord_url: null,
      external_url: 'https://www.poap.xyz/',
      image_url:
        'https://lh3.googleusercontent.com/tOzkCPkfPuwnhNfb4thFA_6xiojAFHTNEPuCYnZS3q3GF4zNneOxowGQNpOI5Gr_-fVYC5eBFIf79HQvtsyEDpVRW2olLdlnPg',
      name: 'POAP',
      slug: '',
      twitter_username: null,
      collection_id: 'f7ff98307273f299b678b13e3f29ac13',
    },
    description:
      'This POAP confirms that you were a staked Hacker at Circuit Breaker, an ETHGlobal async hackathon focused on leveraging zero-knowledge (ZK) technology!\n\nThis hackathon had 567 hackers exploring the potential of ZK, revolutionizing privacy, security and scalability within the blockchain ecosystem. In the end, 110 projects were submitted!',
    external_link: 'https://api.poap.tech/metadata/168746/7054159',
    familyImage:
      'https://lh3.googleusercontent.com/tOzkCPkfPuwnhNfb4thFA_6xiojAFHTNEPuCYnZS3q3GF4zNneOxowGQNpOI5Gr_-fVYC5eBFIf79HQvtsyEDpVRW2olLdlnPg',
    familyName: 'POAP',
    fullUniqueId: 'mainnet_0x22c1f6050e56d2876009903609a2cc3fef83b415_7054159',
    id: '7054159',
    image_original_url:
      'https://assets.poap.xyz/9fef1ce8-9737-4f0f-9101-243f8f4c415f.png',
    image_preview_url:
      'https://lh3.googleusercontent.com/Q4dYE5JEblT1j_bgJe9_QW-F6wQVGCTIwU5Mtyh056gSqvptq0HbMi0OG9m1Y3mb4TvTaLIqe9lvAope6GHdz9sjGR5424RjeRE-=s250',
    image_thumbnail_url:
      'https://lh3.googleusercontent.com/Q4dYE5JEblT1j_bgJe9_QW-F6wQVGCTIwU5Mtyh056gSqvptq0HbMi0OG9m1Y3mb4TvTaLIqe9lvAope6GHdz9sjGR5424RjeRE-=s1000',
    image_url:
      'https://cdn.simplehash.com/assets/5946904874eb0e4bebdf3b71942d8db3564038734bf650d63a7680fdec412d6c.png',
    isPoap: true,
    isSendable: false,
    lowResUrl:
      'https://lh3.googleusercontent.com/Q4dYE5JEblT1j_bgJe9_QW-F6wQVGCTIwU5Mtyh056gSqvptq0HbMi0OG9m1Y3mb4TvTaLIqe9lvAope6GHdz9sjGR5424RjeRE-=s1000',
    marketplaceId: null,
    marketplaceName: null,
    name: 'Circuit Breaker Hacker',
    network: ChainName.mainnet,
    permalink: '',
    poapDropId: '168746',
    predominantColor: '#0e061b',
    traits: [
      {
        trait_type: 'startDate',
        value: '02-Feb-2024',
        display_type: null,
      },
      {
        trait_type: 'endDate',
        value: '22-Feb-2024',
        display_type: null,
      },
      {
        trait_type: 'virtualEvent',
        value: 'true',
        display_type: null,
      },
      {
        trait_type: 'eventURL',
        value: 'https://ethglobal.com/events/circuitbreaker',
        display_type: null,
      },
    ],
    uniqueId: '0x22c1f6050e56d2876009903609a2cc3fef83b415_7054159',
    urlSuffixForAsset: '0x22c1f6050e56d2876009903609a2cc3fef83b415/7054159',
    video_url: null,
    video_properties: null,
    audio_url: null,
    audio_properties: null,
    model_url: null,
    model_properties: null,
    last_sale: null,
  },
];

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
  const nfts = filterSimpleHashNFTs(result?.nfts)?.map((n) =>
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
    // TODO: restore this when we find a SimpleHash replacement
    // retry: 3,
    staleTime: Infinity, // Keep data in cache indefinitely
    gcTime: Infinity, // Keep data in cache indefinitely
  });
}
