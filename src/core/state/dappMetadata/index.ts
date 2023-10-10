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
      // filtering metadata older than one week ago
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const filteredOldDappMetadata: Record<string, DappMetadata> =
        Object.entries(oldDappMetadata).reduce(
          (acc, [key, metadata]) => {
            if (metadata.timestamp && metadata.timestamp >= oneWeekAgo) {
              acc[key] = metadata;
            }
            return acc;
          },
          {} as Record<string, DappMetadata>,
        );
      set({
        dappMetadata: {
          ...filteredOldDappMetadata,
          [host]: { ...dappMetadata, timestamp: Date.now() },
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
