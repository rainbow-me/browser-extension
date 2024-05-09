import { useState } from 'react';

import { selectNftCollections } from '~/core/resources/_selectors/nfts';
import { useNftCollections } from '~/core/resources/nfts/collections';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { NftSort } from '~/core/state/nfts';
import { UniqueAsset } from '~/core/types/nfts';

import { useUserChains } from '../useUserChains';

export const useSendUniqueAsset = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const [sortMethod, setSortMethod] = useState<NftSort>('recent');
  const { testnetMode } = useTestnetModeStore();

  const [selectedNft, setSelectedNft] = useState<UniqueAsset>();
  const { chains: userChains } = useUserChains();
  const { data } = useNftCollections({
    address,
    sort: sortMethod,
    testnetMode,
    userChains,
  });
  const nftCollections = selectNftCollections(data);

  return {
    selectNft: setSelectedNft,
    nft: selectedNft,
    collections: nftCollections,
    nftSortMethod: sortMethod,
    setNftSortMethod: setSortMethod,
  };
};
