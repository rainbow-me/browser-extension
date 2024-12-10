import { useState } from 'react';

import { selectNftCollections } from '~/core/resources/_selectors/nfts';
import {
  MOCK_NFT_COLLECTION,
  useNftCollections,
} from '~/core/resources/nfts/collections';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { NftSort } from '~/core/state/nfts';
import { SimpleHashCollectionDetails, UniqueAsset } from '~/core/types/nfts';

import { useUserChains } from '../useUserChains';

export const useSendUniqueAsset = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const [sortMethod, setSortMethod] = useState<NftSort>('recent');
  const { testnetMode } = useTestnetModeStore();

  const [selectedNft, setSelectedNft] = useState<UniqueAsset>();
  const { chains: userChains } = useUserChains();
  const { data } = useNftCollections(
    {
      address,
      sort: sortMethod,
      testnetMode,
      userChains,
    },
    {
      select: (data) => selectNftCollections(data),
    },
  );
  const nftCollections: SimpleHashCollectionDetails[] =
    process.env.IS_TESTING === 'true' ? MOCK_NFT_COLLECTION : data || [];

  return {
    selectNft: setSelectedNft,
    nft: selectedNft,
    collections: nftCollections,
    nftSortMethod: sortMethod,
    setNftSortMethod: setSortMethod,
  };
};
