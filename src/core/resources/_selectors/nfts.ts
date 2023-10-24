import { UniqueAsset } from '~/core/types/nfts';

export const selectNftsByCollection = (nfts: UniqueAsset[]) => {
  return nfts.reduce(
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
          };
        }
      }
      return collections;
    },
    {} as Record<
      string,
      { assets: UniqueAsset[]; collection: UniqueAsset['collection'] }
    >,
  );
};
