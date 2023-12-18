import { useMemo } from 'react';

import { selectNfts } from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { useCurrentAddressStore } from '~/core/state';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { NftSearchItem, SearchItemType } from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';

const parseNftName = (name: string, id: string) => {
  return name
    .split(' ')
    .filter((word) => !word.includes(id) && word !== '')
    .join(' ');
};

export const useSearchableNfts = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const navigate = useRainbowNavigate();

  const { data } = useNfts({ address });

  const searchableNfts = useMemo(() => {
    const nfts = selectNfts(data) || [];
    return nfts.map<NftSearchItem>((nft) => ({
      action: () =>
        navigate(
          ROUTES.NFT_DETAILS(nft.collection.collection_id || '', nft.id),
        ),
      actionLabel: actionLabels.open,
      actionPage: PAGES.NFT_TOKEN_DETAIL,
      id: nft.uniqueId,
      name: parseNftName(nft.name, nft.id),
      page: PAGES.MY_NFTS,
      selectedWalletAddress: address,
      type: SearchItemType.Nft,
      nft,
    }));
  }, [address, data, navigate]);

  return { searchableNfts };
};
