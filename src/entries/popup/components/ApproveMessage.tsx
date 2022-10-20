import React, { useCallback, useState } from 'react';
import { extensionMessenger } from '~/core/messengers';
import { NotificationWindow } from '~/core/state/slices/notificationWindowSlice';
import { PendingRequest } from '~/core/state/slices/pendingRequestsSlice';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';

export function ApproveMessage() {
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>();
  const [window, setWindow] = useState<NotificationWindow | null>();

  React.useEffect(() => {
    (async () => {
      const pendingRequest = await Storage.get('pendingRequest');
      setPendingRequest(pendingRequest);

      const unlisten = Storage.listen('pendingRequest', setPendingRequest);
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

  return (
    <>
      <Box padding="16px" style={{ borderRadius: 999 }}>
        <Text color="labelSecondary" size="14pt" weight="bold">
          RPC METHOD: {pendingRequest?.method} +{' '}
          {JSON.stringify(pendingRequest)}
        </Text>
      </Box>
      <Box
        as="button"
        id="accept-button"
        background="surfaceSecondary"
        onClick={approveRequest}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="14pt" weight="bold">
          ACCEPT
        </Text>
      </Box>
      <Box
        as="button"
        id="reject-button"
        background="surfaceSecondary"
        onClick={rejectRequest}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="14pt" weight="bold">
          REJECT
        </Text>
      </Box>
    </>
  );
}
