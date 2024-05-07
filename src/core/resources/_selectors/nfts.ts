import { InfiniteData } from '@tanstack/react-query';

import { NftSort } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';

export type NFTInfiniteData = InfiniteData<{
  nfts: UniqueAsset[];
  nextPage?: string | null;
}>;
export type NFTCollectionSectionData = {
  assets: UniqueAsset[];
  collection: UniqueAsset['collection'];
  lastCollectionAcquisition?: string;
};

export const selectNfts = (data?: NFTInfiniteData) =>
  data?.pages?.map((page) => page.nfts).flat();

export const sortSectionsAlphabetically = (
  sections: NFTCollectionSectionData[],
) => {
  return sections.sort((a, b) => {
    const aName = a.collection.name.toLowerCase();
    const bName = b.collection.name.toLowerCase();
    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
  });
};

export const sortSectionsByRecent = (sections: NFTCollectionSectionData[]) => {
  return sections.sort((a, b) => {
    const earliestDate = new Date(-8640000000000000);
    const aCollectionAcquisition = a.lastCollectionAcquisition;
    const bCollectionAcquisition = b.lastCollectionAcquisition;
    const dateA = aCollectionAcquisition
      ? new Date(aCollectionAcquisition)
      : earliestDate;
    const dateB = bCollectionAcquisition
      ? new Date(bCollectionAcquisition)
      : earliestDate;
    return dateB.getTime() - dateA.getTime();
  });
};

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

export const selectSortedNftCollections = (
  sort: NftSort,
  data?: NFTInfiniteData,
) => {
  const collections = selectNftCollections(data);
  const sections = Object.values(collections);
  return sort === 'alphabetical'
    ? sortSectionsAlphabetically(sections)
    : sortSectionsByRecent(sections);
};
