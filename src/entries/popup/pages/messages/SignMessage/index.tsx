import React, { useCallback } from 'react';
import { chain, useNetwork } from 'wagmi';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { Row, Rows } from '~/design-system';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import { SignMessageActions } from './SignMessageActions';
import { SignMessageInfo } from './SignMessageInfo';

interface ApproveRequestProps {
  approveRequest: () => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export function SignMessage({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { appHost } = useAppMetadata({
    url: request?.meta?.sender?.url || '',
  });
  const { appSession } = useAppSession({ host: appHost });
  const { chains } = useNetwork();

  const selectedNetwork =
    chains.find(({ id }) => id === appSession.chainId) ?? chain.mainnet;
  const selectedWallet = appSession.address;

  const onAcceptRequest = useCallback(() => approveRequest(), [approveRequest]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <SignMessageInfo request={request} />
      </Row>
      <Row height="content">
        <SignMessageActions
          selectedWallet={selectedWallet}
          selectedNetwork={selectedNetwork}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={rejectRequest}
        />
      </Row>
    </Rows>
  );
}
