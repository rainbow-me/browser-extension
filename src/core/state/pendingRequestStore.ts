import create from 'zustand';
import { createStore } from './internal/createStore';

export interface PendingRequest {
  method: string;
  id: number;
  params?: unknown[];
}

export interface PendingRequestsStore {
  pendingRequest: PendingRequest | null;
  addPendingRequest: (request: PendingRequest) => void;
  removePendingRequest: () => void;
}

export const pendingRequestStore = createStore<PendingRequestsStore>(
  (set) => ({
    pendingRequest: null,
    addPendingRequest: (newRequest) => set({ pendingRequest: newRequest }),
    removePendingRequest: () => set({ pendingRequest: null }),
  }),
  {
    persist: {
      name: 'pendingRequestStore',
      version: 0,
    },
  },
);

export const usePendingRequestStore = create(pendingRequestStore);
