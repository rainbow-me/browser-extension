import { createBaseStore } from '@storesjs/stores';
import mitt from 'mitt';
import { Hex } from 'viem';

import { HWSigningRequest, HWSigningResponse } from '~/core/types/hw';
import { onlyBackground } from '~/core/utils/onlyBackground';

import { createExtensionStoreOptions } from '../_internal';

// Unique ID counter for HW requests
let nextHWRequestId = 0;

export type PendingHWRequest = HWSigningRequest & { id: number };

type HWResponseEvent = {
  [id: number]: HWSigningResponse;
};

export interface HWRequestsStore {
  pendingHWRequests: PendingHWRequest[];
  addHWRequest: (request: HWSigningRequest) => number;
  respondToHWRequest: (id: number, response: HWSigningResponse) => void;
  waitForHWResponse: (id: number) => Promise<Hex>;
}

const hwEventEmitter = mitt<HWResponseEvent>();

export const useHWRequestsStore = createBaseStore<HWRequestsStore>(
  (set, get) => ({
    pendingHWRequests: [],

    addHWRequest: (request) => {
      onlyBackground('useHWRequestsStore.addHWRequest()');

      const id = nextHWRequestId + 1;
      nextHWRequestId = id;
      const pendingRequest: PendingHWRequest = { ...request, id };
      const pendingHWRequests = get().pendingHWRequests;
      set({ pendingHWRequests: [...pendingHWRequests, pendingRequest] });
      return id;
    },

    respondToHWRequest: (id, response) => {
      onlyBackground('useHWRequestsStore.respondToHWRequest()');

      const pendingHWRequests = get().pendingHWRequests;
      set({
        pendingHWRequests: pendingHWRequests.filter((req) => req.id !== id),
      });
      hwEventEmitter.emit(id, response);
    },

    waitForHWResponse: (id: number): Promise<Hex> => {
      onlyBackground('useHWRequestsStore.waitForHWResponse()');

      return new Promise((resolve, reject) => {
        const handler = (response: HWSigningResponse) => {
          hwEventEmitter.off(id, handler);
          if (typeof response === 'string') {
            resolve(response);
          } else if ('error' in response) {
            reject(
              new Error(response.error || 'Hardware wallet signing failed'),
            );
          } else {
            resolve(response.signature);
          }
        };
        hwEventEmitter.on(id, handler);
      });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'hwRequestsStore',
    version: 0,
  }),
);
