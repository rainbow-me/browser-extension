import create from 'zustand';

import { ProviderRequestPayload } from '../../transports/providerRequestTransport';
import { createStore } from '../internal/createStore';

export interface PendingRequestsStore {
  pendingRequests: ProviderRequestPayload[];
  addPendingRequest: (request: ProviderRequestPayload) => void;
  removePendingRequest: (id: number) => void;
  clearAllPendingRequests: () => void;
}

export const pendingRequestStore = createStore<PendingRequestsStore>(
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
    clearAllPendingRequests: () => {
      set({
        pendingRequests: [],
      });
    },
  }),
  {
    persist: {
      name: 'pendingRequestStore',
      version: 0,
    },
  },
);

export const usePendingRequestStore = create(pendingRequestStore);
