import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

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

export const useNftsStore = createBaseStore<NftsState>(
  (set) => ({
    displayMode: 'grouped',
    hidden: {},
    sections: {},
    sort: 'recent',
    setNftSort: (sort) => set({ sort }),
    setNftDisplayMode: (displayMode) => set({ displayMode }),
    toggleGallerySectionOpen({ address, collectionId }) {
      set((state) => {
        const sectionsByAddress = state.sections[address] || {};
        const isSectionCurrentlyOpen = sectionsByAddress[collectionId];
        return {
          sections: {
            ...state.sections,
            [address]: {
              ...(sectionsByAddress || {}),
              [collectionId]: !isSectionCurrentlyOpen,
            },
          },
        };
      });
    },
    toggleHideNFT(address: Address, uniqueId: string) {
      set((state) => ({
        hidden: {
          ...state.hidden,
          [address]: {
            ...state.hidden[address],
            [uniqueId]: !state.hidden[address]?.[uniqueId],
          },
        },
      }));
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'nfts',
    version: 1,
  }),
);
