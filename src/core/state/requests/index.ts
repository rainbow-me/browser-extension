import mitt from 'mitt';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { onlyBackground } from '~/core/utils/onlyBackground';

import { ProviderRequestPayload } from '../../transports/providerRequestTransport';

// Throw an error if this file is loaded in the popup or inpage script
onlyBackground('usePendingRequestStore');

type Responses =
  | { status: 'APPROVED'; payload: unknown }
  | { status: 'REJECTED'; payload: null };

// New Events type: event name is the request id (number), value is 'APPROVED' | 'REJECTED'
type Events = {
  [id: number]: Responses;
};

export interface PendingRequestsStore {
  pendingRequests: ProviderRequestPayload[];
  addPendingRequest: (request: ProviderRequestPayload) => void;
  approvePendingRequest: (id: number, payload: unknown) => void;
  rejectPendingRequest: (id: number) => void;
  waitForPendingRequest: (id: number) => Promise<Responses>;
}

const eventEmitter = mitt<Events>();

export const usePendingRequestStore = createRainbowStore<PendingRequestsStore>(
  (set, get) => ({
    pendingRequests: [],
    addPendingRequest: (newRequest) => {
      const pendingRequests = get().pendingRequests;
      set({ pendingRequests: [...pendingRequests, newRequest] });
    },
    approvePendingRequest: (id, payload) => {
      const pendingRequests = get().pendingRequests;
      set({
        pendingRequests: pendingRequests.filter((request) => request.id !== id),
      });
      eventEmitter.emit(id, { status: 'APPROVED', payload });
    },
    rejectPendingRequest: (id) => {
      const pendingRequests = get().pendingRequests;
      set({
        pendingRequests: pendingRequests.filter((request) => request.id !== id),
      });
      eventEmitter.emit(id, { status: 'REJECTED', payload: null });
    },
    waitForPendingRequest: (id: number): Promise<Responses> => {
      return new Promise((resolve) => {
        const handler = (status: Responses) => {
          eventEmitter.off(id, handler);
          resolve(status);
        };
        eventEmitter.on(id, handler);
      });
    },
  }),
  {
    storageKey: 'pendingRequestStore',
    version: 0,
  },
);
