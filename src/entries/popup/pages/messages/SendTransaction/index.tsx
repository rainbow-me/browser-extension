import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getAddress } from 'ethers/lib/utils';
import React, { useCallback } from 'react';

import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { Row, Rows } from '~/design-system';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import * as wallet from '../../../handlers/wallet';

import { SendTransactionActions } from './SendTransactionActions';
import { SendTransactionInfo } from './SendTransactionsInfo';

interface ApproveRequestProps {
  approveRequest: (payload: unknown) => void;
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
    url: request?.meta?.sender?.url,
  });
  const { appSession } = useAppSession({ host: appHost });
  const selectedWallet = appSession.address;
  const { connectedToHardhat } = useConnectedToHardhatStore();

  const onAcceptRequest = useCallback(async () => {
    const txRequest = request?.params?.[0] as TransactionRequest;
    const result = await wallet.sendTransaction({
      from: getAddress(txRequest?.from ?? ''),
      to: getAddress(txRequest?.to ?? ''),
      value: txRequest.value,
      chainId:
        appSession.chainId === ChainId.mainnet && connectedToHardhat
          ? ChainId.hardhat
          : appSession.chainId,
    });
    approveRequest(result);
  }, [appSession.chainId, approveRequest, connectedToHardhat, request?.params]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <SendTransactionInfo request={request} />
      </Row>
      <Row height="content">
        <SendTransactionActions
          appHost={appHost}
          selectedWallet={selectedWallet}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={rejectRequest}
        />
      </Row>
    </Rows>
  );
}
