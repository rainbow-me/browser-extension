import { RainbowError, logger } from '~/logger';

import { ChainName } from '../types/chains';
import {
  PolygonAllowListDictionary,
  SimpleHashCollectionDetails,
  SimpleHashNFT,
} from '../types/nfts';

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

export const fetchNftCollections = async ({
  address,
  chains,
}: {
  address: string;
  chains: ChainName[];
}) => {
  try {
    let cursor: string | null = 'none';
    let collections: SimpleHashCollectionDetails[] = [];
    while (cursor) {
      const response: {
        data: SimpleHashCollectionsResponse;
        headers: Headers;
        status: number;
      } =
        // eslint-disable-next-line no-await-in-loop
        await nftApi.get('/nfts/collections_by_wallets_v2', {
          params: {
            chains: chains.join(','),
            ...(cursor && cursor !== 'none' ? { cursor } : {}),
            wallet_addresses: address,
          },
        });
      collections = [...collections, ...(response.data?.collections || [])];
      cursor = response.data?.next_cursor;
    }
    return collections;
  } catch (e) {
    logger.error(new RainbowError('Fetch NFT Collections: '), {
      message: (e as Error)?.message,
    });
    return [];
  }
};

export const fetchNfts = async ({
  address,
  chains,
  collectionIds,
}: {
  address: string;
  chains: ChainName[];
  collectionIds: string[];
}) => {
  try {
    let cursor: string | null = 'none';
    let nfts: SimpleHashNFT[] = [];
    while (cursor) {
      const response: {
        data: SimpleHashNftsResponse;
        headers: Headers;
        status: number;
      } =
        // eslint-disable-next-line no-await-in-loop
        await nftApi.get('/nfts/owners', {
          params: {
            chains: chains.join(','),
            collection_ids: collectionIds.join(','),
            ...(cursor && cursor !== 'none' ? { cursor } : {}),
            wallet_addresses: address,
          },
        });
      nfts = [...nfts, ...(response.data?.nfts || [])];
      cursor = response.data?.next_cursor;
    }
    return nfts;
  } catch (e) {
    logger.error(new RainbowError('Fetch NFTs: '), {
      message: (e as Error)?.message,
    });
    return [];
  }
};

export const fetchNftHistory = async ({
  address,
  chains,
}: {
  address: string;
  chains: ChainName[];
}) => {
  const { data } = await nftApi.get<{ transfers: { collection_id: string }[] }>(
    '/nfts/transfers/wallets',
    {
      params: {
        wallet_addresses: address,
        chains: chains.join(','),
      },
    },
  );
  const isUnique = (value: string, index: number, array: string[]) => {
    return array.indexOf(value) === index;
  };
  return (data?.transfers || []).map((t) => t.collection_id).filter(isUnique);
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
