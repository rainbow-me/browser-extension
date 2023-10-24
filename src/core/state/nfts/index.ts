import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

type NftDisplayMode = 'byCollection' | 'grouped';
type NftSort = 'alphabetical' | 'recent';
type IsOpenDictByCollection = Record<string, boolean>;
type SectionStateByAddress = Record<Address, IsOpenDictByCollection>;
export interface NftsState {
  displayMode: NftDisplayMode;
  sections: SectionStateByAddress;
  sort: NftSort;
  setNftSort: (sort: NftSort) => void;
  setNftDisplayMode: (mode: NftDisplayMode) => void;
  toggleGallerySectionOpen: ({
    address,
    collectionId,
  }: {
    address: Address;
    collectionId: string;
  }) => void;
}

export const nftsStore = createStore<NftsState>(
  (set, get) => ({
    displayMode: 'grouped',
    sections: {},
    sort: 'recent',
    setNftSort: (sort) => set({ sort }),
    setNftDisplayMode: (displayMode) => set({ displayMode }),
    toggleGallerySectionOpen({ address, collectionId }) {
      const { sections } = get();
      const sectionsByAddress = sections[address] || {};
      const isSectionCurrentlyOpen = sectionsByAddress[collectionId];
      set({
        sections: {
          ...sections,
          [address]: {
            ...(sectionsByAddress || {}),
            [collectionId]: !isSectionCurrentlyOpen,
          },
        },
      });
    },
  }),
  {
    persist: {
      name: 'nfts',
      version: 0,
    },
  },
);

export const useNftsStore = create(nftsStore);
