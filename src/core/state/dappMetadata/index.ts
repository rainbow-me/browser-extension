import create from 'zustand';

import { DappMetadata } from '~/core/resources/metadata/dapp';

import { createStore } from '../internal/createStore';

export interface DappMetadataState {
  dappMetadata: Record<string, DappMetadata>;
  setDappMetadata: ({
    host,
    dappMetadata,
  }: {
    host: string;
    dappMetadata: DappMetadata;
  }) => void;
  getDappMetadata: ({ host }: { host: string }) => DappMetadata | null;
}

export const dappMetadataStore = createStore<DappMetadataState>(
  (set, get) => ({
    dappMetadata: {},
    setDappMetadata: ({ host, dappMetadata }) => {
      const { dappMetadata: oldDappMetadata } = get();
      set({
        dappMetadata: {
          ...oldDappMetadata,
          [host]: dappMetadata,
        },
      });
    },
    getDappMetadata: ({ host }) => {
      const { dappMetadata } = get();
      return dappMetadata[host] || null;
    },
  }),
  {
    persist: {
      name: 'dappMetadata',
      version: 0,
    },
  },
);

export const useDappMetadataStore = create(dappMetadataStore);
