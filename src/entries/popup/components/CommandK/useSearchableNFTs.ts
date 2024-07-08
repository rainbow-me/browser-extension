import { useEffect, useMemo } from 'react';

import { selectNfts } from '~/core/resources/_selectors/nfts';
import { useGalleryNfts } from '~/core/resources/nfts/galleryNfts';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useUserChains } from '../../hooks/useUserChains';
import { ROUTES } from '../../urls';

import { NFTSearchItem, SearchItemType } from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';

const NFT_SEARCH_LIMIT = 2000;

export const parseNftName = (name: string, id: string) => {
  return name
    .split(' ')
    .filter((word) => !word.includes(id) && word !== '')
    .join(' ');
};

export const useSearchableNFTs = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const navigate = useRainbowNavigate();
  const { testnetMode } = useTestnetModeStore();
  const { chains: userChains } = useUserChains();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useGalleryNfts(
    {
      address,
      sort: 'recent',
      testnetMode,
      userChains,
    },
    { select: (data) => selectNfts(data) },
  );

  const nfts = useMemo(() => data || [], [data]);

  useEffect(() => {
    if (
      hasNextPage &&
      !isFetching &&
      !isFetchingNextPage &&
      !isLoading &&
      nfts?.length < NFT_SEARCH_LIMIT
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    nfts?.length,
  ]);

  const searchableNFTs = useMemo(() => {
    return nfts.map<NFTSearchItem>((nft) => ({
      action: () =>
        navigate(
          ROUTES.NFT_DETAILS(nft.collection.collection_id || '', nft.id),
        ),
      actionLabel: actionLabels.open,
      actionPage: PAGES.NFT_TOKEN_DETAIL,
      id: nft.uniqueId,
      name: parseNftName(nft.name, nft.id),
      searchTags: [nft.name, nft.collection.name],
      page: PAGES.MY_NFTS,
      selectedWalletAddress: address,
      type: SearchItemType.NFT,
      downrank: true,
      nft,
    }));
  }, [address, navigate, nfts]);

  return { searchableNFTs };
};
