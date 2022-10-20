import React, { useCallback, useState } from 'react';
import { extensionMessenger } from '~/core/messengers';
import { backgroundStore } from '~/core/state';
import { NotificationWindow } from '~/core/state/slices/notificationWindowSlice';
import { PendingRequest } from '~/core/state/slices/pendingRequestsSlice';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';

export function ApproveMessage() {
  const [pendingRequest, setPendingRequests] = useState<PendingRequest | null>(
    backgroundStore.getState().pendingRequests,
  );
  const [window, setWindow] = useState<NotificationWindow | null>();

  React.useEffect(() => {
    (async () => {
      const pendingRequests = await Storage.get('pendingRequests');
      setPendingRequests(pendingRequests);

      const unlisten = Storage.listen('pendingRequests', setPendingRequests);
      return unlisten;
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      const window = await Storage.get('currentWindow');
      setWindow(window);

      const unlisten = Storage.listen('currentWindow', setWindow);
      return unlisten;
    })();
  }, []);

  const approveRequest = useCallback(() => {
    extensionMessenger.send(`message:${pendingRequest?.id}`, true);
    if (window?.id) chrome.windows.remove(window.id);
  }, [pendingRequest?.id, window?.id]);

  const rejectRequest = useCallback(() => {
    extensionMessenger.send(`message:${pendingRequest?.id}`, false);
    if (window?.id) chrome.windows.remove(window.id);
  }, [pendingRequest?.id, window?.id]);

  if (!pendingRequest) return null;

  return (
    <>
      <Box padding="16px" style={{ borderRadius: 999 }}>
        <Text color="labelSecondary" size="15pt" weight="bold">
          RPC METHOD: {pendingRequest?.method} +{' '}
          {JSON.stringify(pendingRequest)}
        </Text>
      </Box>
      <Box
        as="button"
        id="injection-button"
        background="surfaceSecondary"
        onClick={approveRequest}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="15pt" weight="bold">
          ACCEPT
        </Text>
      </Box>
      <Box
        as="button"
        id="injection-button"
        background="surfaceSecondary"
        onClick={rejectRequest}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="15pt" weight="bold">
          DECLINE
        </Text>
      </Box>
    </>
  );
}
