import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

import { ProviderRequestPayload } from '../../transports/providerRequestTransport';

export interface PendingRequestsStore {
  pendingRequests: ProviderRequestPayload[];
  addPendingRequest: (request: ProviderRequestPayload) => void;
  removePendingRequest: (id: number) => void;
}

export const pendingRequestStore = createRainbowStore<PendingRequestsStore>(
  (set, get) => ({
    pendingRequests: [],
    addPendingRequest: (newRequest) => {
      const pendingRequests = get().pendingRequests;
      set({ pendingRequests: pendingRequests.concat([newRequest]) });
    },
    removePendingRequest: (id) => {
      const pendingRequests = get().pendingRequests;
      set({
        pendingRequests: pendingRequests.filter((request) => request.id !== id),
      });
    },
  }),
  {
    storageKey: 'pendingRequestStore',
    version: 0,
  },
);

export const usePendingRequestStore = pendingRequestStore;
