import { StateCreator } from 'zustand';
import { BackgrounStorage } from '~/entries/background/storage';

export interface PendingRequest {
  method: string;
  id: number;
  params: any;
}

export interface RequestsSliceState {
  pendingRequests: PendingRequest[];
  getPendingRequests: () => PendingRequest[];
  addPendingRequest: (request: PendingRequest) => void;
  removePendingRequest: (id: number) => void;
}

export const requestSlice: StateCreator<
  BackgrounStorage,
  [['zustand/persist', unknown]],
  [],
  RequestsSliceState
> = (set, get) => ({
  pendingRequests: [],
  getPendingRequests: () => get().pendingRequests,
  addPendingRequest: (request) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.concat([request]),
    })),
  removePendingRequest: (id: number) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter(
        (pendingRequest) => pendingRequest.id !== id,
      ),
    })),
});
