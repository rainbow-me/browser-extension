import React, { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';
import { RPCMethods } from '~/core/types/rpcMethods';
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
      // Wait until the message propagates to the background provider.
      setTimeout(() => {
        if (window?.id && pendingRequests.length <= 1)
          chrome.windows.remove(window?.id);
      }, 50);
    },
    [pendingRequest, pendingRequests.length, window?.id],
  );

  const rejectRequest = useCallback(() => {
    backgroundMessenger.send(`message:${pendingRequest?.id}`, false);
    // Wait until the message propagates to the background provider.
    setTimeout(() => {
      if (window?.id && pendingRequests.length <= 1)
        chrome.windows.remove(window.id);
    }, 50);
  }, [pendingRequest?.id, pendingRequests.length, window?.id]);

  switch (pendingRequest.method) {
    case RPCMethods.eth_requestAccounts:
      return (
        <RequestAccounts
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    case RPCMethods.eth_sign:
    case RPCMethods.personal_sign:
    case RPCMethods.eth_signTypedData:
    case RPCMethods.eth_signTypedData_v3:
    case RPCMethods.eth_signTypedData_v4:
      return (
        <SignMessage
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    case RPCMethods.eth_sendTransaction:
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
