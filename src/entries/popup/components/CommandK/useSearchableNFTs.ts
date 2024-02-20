import { useMemo } from 'react';

import { selectNfts } from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useUserChains } from '../../hooks/useUserChains';
import { ROUTES } from '../../urls';

import { NFTSearchItem, SearchItemType } from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';

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

  const { data } = useNfts({ address, testnetMode, userChains });

  const searchableNFTs = useMemo(() => {
    const nfts = selectNfts(data) || [];
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
  }, [address, data, navigate]);

  return { searchableNFTs };
};
