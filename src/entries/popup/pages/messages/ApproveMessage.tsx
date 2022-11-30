import React, { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';
import { Box, Text } from '~/design-system';

import { RequestAccounts } from './RequestAccounts';
import { SendTransaction } from './SendTransaction';
import { SignMessage } from './SignMessage';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export const ApproveMessage = () => {
  const { pendingRequests } = usePendingRequestStore();
  const { window } = useNotificationWindowStore();
  const pendingRequest = pendingRequests[0];

  const approveRequest = useCallback(
    async (payload?: unknown) => {
      backgroundMessenger.send(`message:${pendingRequest?.id}`, payload);
      if (window?.id && pendingRequests.length <= 1)
        chrome.windows.remove(window?.id);
    },
    [pendingRequest, pendingRequests.length, window?.id],
  );

  const rejectRequest = useCallback(() => {
    // removePendingRequest(pendingRequest?.id);
    backgroundMessenger.send(`message:${pendingRequest?.id}`, false);
    if (window?.id && pendingRequests.length <= 1)
      chrome.windows.remove(window.id);
  }, [pendingRequest?.id, pendingRequests.length, window?.id]);

  switch (pendingRequest.method) {
    case 'eth_requestAccounts':
      return (
        <RequestAccounts
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    case 'eth_sign':
    case 'personal_sign':
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return (
        <SignMessage
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    case 'eth_sendTransaction':
      return (
        <SendTransaction
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    default:
      return (
        <>
          <Box padding="16px" style={{ borderRadius: 999 }}>
            <Text color="labelSecondary" size="14pt" weight="bold">
              {`RPC METHOD ${String(pendingRequest?.method)} ${JSON.stringify(
                pendingRequest,
              )}`}
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
};
