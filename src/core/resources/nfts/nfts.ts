import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import {
  fetchNftCollections,
  fetchNfts,
  fetchPolygonAllowList,
} from '~/core/network/nfts';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ChainName } from '~/core/types/chains';
import { PolygonAllowListDictionary } from '~/core/types/nfts';
import { chunkArray } from '~/core/utils/assets';
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

type NftsQueryKey = ReturnType<typeof nftsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function nftsQueryFunction({
  queryKey: [{ address }],
}: QueryFunctionArgs<typeof nftsQueryKey>) {
  const chains = getSupportedChains().map((chain) => chain.name as ChainName);
  const polygonAllowList = await polygonAllowListFetcher();
  const acquisitionMap: Record<string, string> = {};
  const collections = (await fetchNftCollections({ address, chains })).filter(
    (collection) => {
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
  const collectionsBatches = chunkArray(
    collections
      .filter((collection) => collection.collection_id)
      .map((collection) => collection.collection_id),
    40,
  );
  const nftRequests = collectionsBatches.map((collectionIds) =>
    fetchNfts({
      address,
      chains,
      collectionIds,
    }),
  );
  const nftsResponse = (await Promise.allSettled(nftRequests))
    .filter((resData) => resData.status === 'fulfilled')
    .map((resData) => {
      // ts forcing the type guard despite filter above
      if (resData.status === 'fulfilled') {
        return resData.value;
      } else {
        return [];
      }
    })
    .flat();
  const nfts = filterSimpleHashNFTs(nftsResponse, polygonAllowList).map((nft) =>
    simpleHashNFTToUniqueAsset(nft),
  );
  return nfts.map((nft) => {
    if (nft.collection.collection_id) {
      nft.last_collection_acquisition =
        acquisitionMap[nft.collection.collection_id];
    }
    return nft;
  });
}

type NftsResult = QueryFunctionResult<typeof nftsQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useNfts<TSelectResult = NftsResult>(
  { address }: NftsArgs,
  config: QueryConfig<NftsResult, Error, TSelectResult, NftsQueryKey> = {},
) {
  return useQuery(nftsQueryKey({ address }), nftsQueryFunction, config);
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
