import { RainbowError, logger } from '~/logger';

import { queryClient } from '../react-query';
import { ChainId, ChainName, chainNameToIdMapping } from '../types/chains';
import {
  PolygonAllowListDictionary,
  SimpleHashCollectionDetails,
  SimpleHashNFT,
  UniqueAsset,
} from '../types/nfts';
import {
  simpleHashNFTToUniqueAsset,
  simpleHashSupportedChainNames,
  simpleHashSupportedTestnetChainNames,
  validateSimpleHashNFT,
} from '../utils/nfts';

import { RainbowFetchClient } from './internal/rainbowFetch';
import { nftAllowListClient } from './nftAllowList';

interface SimpleHashCollectionsResponse {
  collections: SimpleHashCollectionDetails[];
  next_cursor: string | null;
}

interface SimpleHashNftsResponse {
  nfts: SimpleHashNFT[];
  next_cursor: string | null;
}

const nftApi = new RainbowFetchClient({
  baseUrl: `https://${process.env.NFT_API_URL}/api/v0`,
  headers: {
    'x-api-key': process.env.NFT_API_KEY || '',
  },
});

export const fetchGalleryNfts = async ({
  address,
  chains,
  nextPage,
  sort,
}: {
  address: string;
  chains: ChainName[];
  nextPage?: string;
  sort: 'name__asc' | 'last_acquired_date__desc';
}) => {
  try {
    const response: {
      data: SimpleHashNftsResponse;
      headers: Headers;
      status: number;
    } = await nftApi.get('/nfts/owners_v2', {
      params: {
        chains: chains.join(','),
        ...(nextPage ? { cursor: nextPage } : {}),
        filters: 'spam_score__lte=90',
        wallet_addresses: address,
        order_by: sort,
      },
    });
    return {
      nfts: response?.data?.nfts || [],
      nextPage: response?.data?.next_cursor,
    };
  } catch (e) {
    logger.error(new RainbowError('Fetch NFT Gallery: '), {
      message: (e as Error)?.message,
    });
  }
  return {
    nfts: [],
  };
};

export const fetchNftCollections = async ({
  address,
  chains,
  nextPage,
  sort,
}: {
  address: string;
  chains: ChainName[];
  nextPage?: string;
  sort: 'name__asc' | 'last_acquired_date__desc';
}) => {
  try {
    const response: {
      data: SimpleHashCollectionsResponse;
      headers: Headers;
      status: number;
    } = await nftApi.get('/nfts/collections_by_wallets_v2', {
      params: {
        chains: chains.join(','),
        ...(nextPage ? { cursor: nextPage } : {}),
        wallet_addresses: address,
        order_by: sort,
        spam_score__lte: '90',
        nft_ids: '1',
      },
    });
    return {
      collections: response?.data?.collections || [],
      nextPage: response.data?.next_cursor,
    };
  } catch (e) {
    logger.error(new RainbowError('Fetch NFT Collections: '), {
      message: (e as Error)?.message,
    });
    return { collections: [], nextPage: undefined };
  }
};

export const fetchNfts = async ({
  address,
  chains,
  collectionIds,
  nextPage,
}: {
  address: string;
  chains: ChainName[];
  collectionIds: string[];
  nextPage?: string;
}) => {
  try {
    const response: {
      data: SimpleHashNftsResponse;
      headers: Headers;
      status: number;
    } = await nftApi.get('/nfts/owners', {
      params: {
        chains: chains.join(','),
        collection_ids: collectionIds.join(','),
        ...(nextPage ? { cursor: nextPage } : {}),
        wallet_addresses: address,
      },
    });
    return {
      nfts: response?.data?.nfts,
      nextPage: response?.data?.next_cursor,
    };
  } catch (e) {
    logger.error(new RainbowError('Fetch NFTs: '), {
      message: (e as Error)?.message,
    });
    return {
      nfts: [],
    };
  }
};

export const fetchPolygonAllowList =
  async (): Promise<PolygonAllowListDictionary> => {
    const allowList = await nftAllowListClient.get<{
      data: { addresses: string[] };
    }>('/137-allowlist.json');
    const polygonAllowListDictionary = allowList.data?.data?.addresses?.reduce(
      (allowListDict, tokenAddress) => {
        allowListDict[tokenAddress.toLowerCase()] = true;
        return allowListDict;
      },
      {} as PolygonAllowListDictionary,
    );
    return polygonAllowListDictionary;
  };

export function polygonAllowListFetcher() {
  return queryClient.fetchQuery<PolygonAllowListDictionary>({
    queryKey: ['137-allowList'],
    queryFn: async () => await fetchPolygonAllowList(),
    staleTime: 60000,
  });
}

export const reportNftAsSpam = async (nft: UniqueAsset) => {
  const network =
    nft?.network === ChainName.mainnet ? 'ethereum' : nft?.network;
  try {
    await nftApi.post(
      '/nfts/report/spam',
      JSON.stringify({
        contract_address: nft?.asset_contract.address,
        chain_id: network,
        token_id: nft?.id,
      }),
    );
  } catch (error) {
    logger.error(new RainbowError('reportNftAsSpam: failed to report nft'), {
      message: (error as Error).message,
    });
  }
};

const simplehashChainNames = [
  ...simpleHashSupportedChainNames,
  ...simpleHashSupportedTestnetChainNames,
];

/**
 * @throws when chain is not supported
 * @throws when fetching simplehash fails for some reason
 */
export const fetchNft = async ({
  contractAddress,
  tokenId,
  chainId,
}: {
  contractAddress: string;
  chainId: ChainId;
  tokenId: string;
}) => {
  const chain = simplehashChainNames.find(
    (chainName) => chainNameToIdMapping[chainName] === chainId,
  );
  if (!chain) throw new Error('Chain not supported');

  try {
    const response = await nftApi.get<SimpleHashNFT>(
      `/nfts/${chain}/${contractAddress}/${tokenId}`,
    );
    const validatedNft = validateSimpleHashNFT(response.data);
    if (!validatedNft) throw new Error('Invalid NFT');
    return simpleHashNFTToUniqueAsset(validatedNft);
  } catch (e) {
    logger.error(new RainbowError('Fetch NFT: '), {
      message: (e as Error)?.message,
    });
    throw new Error('Failed to fetch Nft');
  }
};
