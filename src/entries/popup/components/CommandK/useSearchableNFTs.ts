import { useMemo } from 'react';

import { selectNfts } from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { userChainsStore } from '~/core/state/userChains';
import { getRainbowChains } from '~/core/utils/chains';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { NFTSearchItem, SearchItemType } from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';

const parseNftName = (name: string, id: string) => {
  return name
    .split(' ')
    .filter((word) => !word.includes(id) && word !== '')
    .join(' ');
};

export const useSearchableNFTs = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const navigate = useRainbowNavigate();
  const { testnetMode } = useTestnetModeStore();
  const { rainbowChains } = getRainbowChains();
  const { userChains } = userChainsStore.getState();

  const { data } = useNfts({ address, rainbowChains, testnetMode, userChains });

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
