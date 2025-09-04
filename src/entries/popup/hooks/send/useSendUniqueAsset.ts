import { useState } from 'react';

import { selectNftCollections } from '~/core/resources/_selectors/nfts';
import {
  MOCK_NFT_COLLECTION,
  useNftCollections,
} from '~/core/resources/nfts/collections';
import { useSettingsStore } from '~/core/state/currentSettings/store';
import { NftSort } from '~/core/state/nfts';
import { SimpleHashCollectionDetails, UniqueAsset } from '~/core/types/nfts';

import { useUserChains } from '../useUserChains';

export const useSendUniqueAsset = () => {
  const [address] = useSettingsStore('currentAddress');
  const [sortMethod, setSortMethod] = useState<NftSort>('recent');
  const [testnetMode] = useSettingsStore('isTestnetMode');

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
