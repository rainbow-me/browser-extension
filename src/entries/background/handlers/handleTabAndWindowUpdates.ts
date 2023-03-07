import { pendingRequestStore } from '~/core/state';

export const handleTabAndWindowUpdates = () => {
  // When a tab is removed, check if that was the last tab for that host
  // if that's the case then we need to remove the pending requests
  const clearPendingRequestsOnUpdate = (tabId: number) => {
    const { pendingRequests, removePendingRequest } =
      pendingRequestStore.getState();
    pendingRequests.forEach((request) => {
      if (request.meta?.sender?.tab?.id === tabId) {
        removePendingRequest(request.id);
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chrome.tabs.onRemoved.addListener(function (tabId, _) {
    clearPendingRequestsOnUpdate(tabId);
  });
};
