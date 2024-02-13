import { useCallback, useMemo, useState } from 'react';

import {
  selectNftCollections,
  sortSectionsAlphabetically,
  sortSectionsByRecent,
} from '~/core/resources/_selectors/nfts';
import { useNfts } from '~/core/resources/nfts';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { NftSort } from '~/core/state/nfts';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useUserChains } from '../useUserChains';

export const useSendUniqueAsset = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const [sortMethod, setSortMethod] = useState<NftSort>('recent');
  const { testnetMode } = useTestnetModeStore();

  const [selectedNftUniqueId, setSelectedNftUniqueId] = useState<string>('');
  const [selectedNftCollectionId, setSelectedNftCollectionId] =
    useState<string>('');
  const { chains: userChains } = useUserChains();
  const { data } = useNfts({ address, testnetMode, userChains });
  const sectionsDictionary = useMemo(() => {
    return selectNftCollections(data);
  }, [data]);
  const sortedSections = useMemo(() => {
    const sections = Object.values(sectionsDictionary);
    return sortMethod === 'alphabetical'
      ? sortSectionsAlphabetically(sections)
      : sortSectionsByRecent(sections);
  }, [sectionsDictionary, sortMethod]);

  const selectNft = useCallback((collectionId: string, uniqueId: string) => {
    setSelectedNftCollectionId(collectionId);
    setSelectedNftUniqueId(uniqueId);
  }, []);

  const nft = useMemo(() => {
    const collectionAssets =
      sectionsDictionary?.[selectedNftCollectionId]?.assets || [];
    return collectionAssets.find((nft) =>
      isLowerCaseMatch(nft?.fullUniqueId, selectedNftUniqueId),
    );
  }, [sectionsDictionary, selectedNftCollectionId, selectedNftUniqueId]);

  return {
    selectNft,
    nft,
    nfts: sortedSections,
    nftSortMethod: sortMethod,
    setNftSortMethod: setSortMethod,
  };
};
