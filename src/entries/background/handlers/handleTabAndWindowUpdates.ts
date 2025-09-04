import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state';
import { settingsStorage } from '~/core/state/currentSettings/store';
import { usePendingRequestStore } from '~/core/state/requests';

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

export const handleTabAndWindowUpdates = () => {
  // When a tab is removed, check if that was the last tab for that host
  // if that's the case then we need to remove the pending requests
  const clearPendingRequestsOnUpdate = (tabId: number) => {
    const { pendingRequests, rejectPendingRequest } =
      usePendingRequestStore.getState();
    pendingRequests.forEach((request) => {
      if (request.meta?.sender?.tab?.id === tabId) {
        rejectPendingRequest(request.id);
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chrome.tabs.onRemoved.addListener(function (tabId, _) {
    clearPendingRequestsOnUpdate(tabId);
  });

  chrome.tabs.onActivated.addListener(async () => {
    const rainbowAsDefault = await settingsStorage.getItem(
      'settings:isDefaultWallet',
    );
    inpageMessenger.send('rainbow_setDefaultProvider', {
      rainbowAsDefault,
    });
  });

  chrome.windows.onRemoved.addListener((id) => {
    const { setNotificationWindow, notificationWindows } =
      useNotificationWindowStore.getState();

    for (const [tabId, notificationWindow] of Object.entries(
      notificationWindows,
    )) {
      if (id === notificationWindow?.id) {
        // The popup has been closed
        clearPendingRequestsOnUpdate(Number(tabId));
        setNotificationWindow(tabId, undefined);
      }
    }
  });
};
