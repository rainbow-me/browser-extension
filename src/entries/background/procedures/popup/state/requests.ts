import { usePendingRequestStore } from '~/core/state/requests';

import { popupOs } from '../os';

const getAllHandler = popupOs.state.requests.getAll.handler(async () => {
  return usePendingRequestStore.getState().pendingRequests;
});

const approveHandler = popupOs.state.requests.approve.handler(
  async ({ input: { id, payload } }) => {
    usePendingRequestStore.getState().approvePendingRequest(id, payload);
  },
);

const rejectHandler = popupOs.state.requests.reject.handler(
  async ({ input: { id } }) => {
    usePendingRequestStore.getState().rejectPendingRequest(id);
  },
);

export const requestsRouter = {
  getAll: getAllHandler,
  approve: approveHandler,
  reject: rejectHandler,
};
