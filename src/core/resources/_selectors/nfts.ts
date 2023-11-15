import { InfiniteData } from '@tanstack/react-query';

import { UniqueAsset } from '~/core/types/nfts';

type NFTInfiniteData = InfiniteData<{
  nfts: UniqueAsset[];
  nextPage?: string | null;
}>;

export const selectNfts = (data?: NFTInfiniteData) =>
  data?.pages?.map((page) => page.nfts).flat();

export const selectNftCollections = (data?: NFTInfiniteData) => {
  const nfts = selectNfts(data);
  const collections =
    nfts?.reduce(
      (collections, nft) => {
        const currentCollectionId = nft.collection.collection_id;
        if (currentCollectionId) {
          const existingCollection = collections[currentCollectionId];
          if (existingCollection) {
            existingCollection.assets.push(nft);
          } else {
            collections[currentCollectionId] = {
              assets: [nft],
              collection: nft.collection,
              lastCollectionAcquisition: nft.last_collection_acquisition,
            };
          }
        }
        return collections;
      },
      {} as Record<
        string,
        {
          assets: UniqueAsset[];
          collection: UniqueAsset['collection'];
          lastCollectionAcquisition?: string;
        }
      >,
    ) || {};
  return collections;
};
