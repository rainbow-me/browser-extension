import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

type NftDisplayMode = 'byCollection' | 'grouped';
export type NftSort = 'alphabetical' | 'recent';
type IsOpenDictByCollection = Record<string, boolean>;
type SectionStateByAddress = Record<Address, IsOpenDictByCollection>;
type HiddenNftDict = Record<string, boolean>;
type HiddenNftsByAddress = Record<Address, HiddenNftDict>;
export interface NftsState {
  displayMode: NftDisplayMode;
  hidden: HiddenNftsByAddress;
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
  toggleHideNFT: (address: Address, uniqueId: string) => void;
}

export const nftsStore = createStore<NftsState>(
  (set, get) => ({
    displayMode: 'grouped',
    hidden: {},
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
    toggleHideNFT(address: Address, uniqueId: string) {
      const { hidden } = get();
      set({
        hidden: {
          ...hidden,
          [address]: {
            ...hidden[address],
            [uniqueId]: !hidden[address]?.[uniqueId],
          },
        },
      });
    },
  }),
  {
    persist: {
      name: 'nfts',
      version: 1,
    },
  },
);

export const useNftsStore = create(nftsStore);
