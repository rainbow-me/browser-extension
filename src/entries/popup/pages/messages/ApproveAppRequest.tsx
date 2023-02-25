import React, { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';

import { RequestAccounts } from './RequestAccounts';
import { SendTransaction } from './SendTransaction';
import { SignMessage } from './SignMessage';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export const ApproveAppRequest = () => {
  const { pendingRequests, removePendingRequest } = usePendingRequestStore();
  const { window } = useNotificationWindowStore();
  const pendingRequest = pendingRequests?.[0];

  const handleRequestAction = useCallback(() => {
    removePendingRequest(pendingRequest?.id);
    if (pendingRequests.length <= 1 && window?.id) {
      setTimeout(() => {
        window?.id && chrome.windows.remove(window?.id);
      }, 50);
    }
  }, [
    pendingRequest?.id,
    pendingRequests.length,
    removePendingRequest,
    window?.id,
  ]);

  const approveRequest = useCallback(
    async (payload?: unknown) => {
      backgroundMessenger.send(`message:${pendingRequest?.id}`, payload);
      handleRequestAction();
    },
    [handleRequestAction, pendingRequest?.id],
  );

  const rejectRequest = useCallback(() => {
    backgroundMessenger.send(`message:${pendingRequest?.id}`, null);
    handleRequestAction();
  }, [handleRequestAction, pendingRequest?.id]);

  switch (pendingRequest?.method) {
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
      return null;
  }
};
