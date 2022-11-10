import React from 'react';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { Row, Rows } from '~/design-system';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import { SendTransactionActions } from './SendTransactionActions';
import { SendTransactionInfo } from './SendTransactionsInfo';

interface ApproveRequestProps {
  approveRequest: () => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

export function SendTransaction({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { appHost } = useAppMetadata({
    meta: request?.meta,
  });
  const { appSession } = useAppSession({ host: appHost });
  const selectedWallet = appSession.address;

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <SendTransactionInfo request={request} />
      </Row>
      <Row height="content">
        <SendTransactionActions
          selectedWallet={selectedWallet}
          onAcceptRequest={approveRequest}
          onRejectRequest={rejectRequest}
        />
      </Row>
    </Rows>
  );
}
