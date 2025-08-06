import { InfiniteData } from '@tanstack/react-query';

import { i18n } from '~/core/languages';
import { SimpleHashCollectionDetails, UniqueAsset } from '~/core/types/nfts';
type NFTInfiniteData = InfiniteData<{
  nfts: UniqueAsset[];
  nextPage?: string | null;
}>;
type NFTCollectionInfiniteData = InfiniteData<{
  collections: SimpleHashCollectionDetails[];
  nextPage?: string | null;
}>;

export const selectNfts = (data?: NFTInfiniteData) =>
  data?.pages?.map((page) => page.nfts).flat();

export const selectNftCollections = (
  data?: NFTCollectionInfiniteData,
  hiddenNfts?: Record<string, boolean>,
) => {
  let idsOfCollectionsWithHiddenNfts: string[] = [];
  return data?.pages
    ?.map((page) => page.collections)
    .flat()
    .filter((c) => {
      const collectionNftIds = c.nft_ids
        .map((s) => s.split('.'))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, id, num]) => !hiddenNfts?.[`${id}_${num}`]);
      if (c.nft_ids.length !== collectionNftIds.length) {
        idsOfCollectionsWithHiddenNfts = [
          ...idsOfCollectionsWithHiddenNfts,
          c.collection_id,
        ];
      }
      return Boolean(
        c.collection_details.name &&
          c.collection_details.image_url &&
          collectionNftIds?.length,
      );
    })
    .concat({
      collection_id: idsOfCollectionsWithHiddenNfts.join(','),
      distinct_nfts_owned: Object.values(hiddenNfts || {}).filter((v) => v)
        .length,
      distinct_nfts_owned_string: '0',
      nft_ids: [],
      collection_details: {
        banner_image_url: '',
        category: null,
        chains: [],
        description: '_hidden',
        discord_url: '',
        distinct_nft_count: 0,
        distinct_owner_count: 0,
        external_url: '',
        floor_prices: [],
        instagram_username: null,
        is_nsfw: false,
        marketplace_pages: [],
        medium_username: null,
        metaplex_first_verified_creator: null,
        metaplex_mint: null,
        total_quantity: 0,
        featured_image_url: '',
        image_url: '',
        name: i18n.t('nfts.hidden_section_title'),
        short_description: null,
        slug: '',
        twitter_username: '',
        wiki_link: '',
        spam_score: 0,
        telegram_url: null,
        top_contracts: [],
      },
    } as SimpleHashCollectionDetails);
};
