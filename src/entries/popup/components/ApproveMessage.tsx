import React, { useCallback, useState } from 'react';
import { rpcHub } from '~/core/rpc-hub';
import { Box, Text } from '~/design-system';
import { backgroundStore } from '~/entries/background/storage';

export function ApproveMessage() {
  // const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  // backgroundStore.subscribe((state) => {
  //   setPendingRequests(state.pendingRequests);
  // });
  const pendingRequests = backgroundStore.getState().pendingRequests;
  console.log('pendingRequests', pendingRequests);
  const pendingRequest = pendingRequests?.[0] || null;
  // rpcHub.on('unapprovedMessage', (message) => {
  //   console.log('POP UP unapprovedMessage', message);
  //   setMessage(message);
  // });

  const approveRequest = useCallback(() => {
    rpcHub.emit('unapprovedMessage::approved', pendingRequest);
    backgroundStore.getState().removePendingRequest(pendingRequest?.id);
  }, [pendingRequest]);

  const rejectRequest = useCallback(() => {
    rpcHub.emit('unapprovedMessage::rejected', pendingRequest);
    console.log('removing pendingRequest', pendingRequest);
    backgroundStore.getState().removePendingRequest(pendingRequest?.id);
  }, [pendingRequest]);

  if (!pendingRequests.length) return null;

  return (
    <>
      <Box padding="16px" style={{ borderRadius: 999 }}>
        <Text color="labelSecondary" size="15pt" weight="bold">
          RPC METHOD: {pendingRequest?.method} + {pendingRequests.length}
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
