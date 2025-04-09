import { useCallback, useEffect, useMemo } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { selectNfts } from '~/core/resources/_selectors/nfts';
import { useGalleryNfts } from '~/core/resources/nfts/galleryNfts';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNftsStore } from '~/core/state/nfts';
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';

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

  const hiddenNfts = useNftsStore((state) => state.hidden);
  const hiddenNftsForAddress = useMemo(
    () => hiddenNfts[address] || {},
    [address, hiddenNfts],
  );

  const isNftHidden = useCallback(
    (nft: UniqueAsset) => {
      return !!hiddenNftsForAddress[nft.uniqueId || ''];
    },
    [hiddenNftsForAddress],
  );

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
      action: () => {
        const [chainName, contractAddress, tokenId] = nft.fullUniqueId.split(
          '_',
        ) as [ChainName, Address, string];
        const chainId = chainNameToIdMapping[chainName];
        if (!chainId) return;
        return navigate(
          ROUTES.NFT_DETAILS(`${contractAddress}_${chainId}`, tokenId),
          { state: { nft } },
        );
      },
      actionLabel: actionLabels.open,
      actionPage: PAGES.NFT_TOKEN_DETAIL,
      id: nft.uniqueId,
      name: parseNftName(nft.name, nft.id),
      searchTags: [
        ...(isNftHidden(nft)
          ? [i18n.t('command_k.commands.search_tags.hide_token')]
          : []),
        nft.name,
        nft.collection.name,
      ],
      page: PAGES.MY_NFTS,
      selectedWalletAddress: address,
      type: SearchItemType.NFT,
      downrank: true,
      nft,
    }));
  }, [address, isNftHidden, navigate, nfts]);

  return { searchableNFTs };
};
