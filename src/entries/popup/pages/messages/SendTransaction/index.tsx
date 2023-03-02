import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { formatEther } from '@ethersproject/units';
import React, { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { NATIVE_ASSETS_PER_CHAIN } from '~/core/references';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { Row, Rows } from '~/design-system';
import { useSendTransactionAsset } from '~/entries/popup/hooks/send/useSendTransactionAsset';
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
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const { appHost } = useAppMetadata({
    url: request?.meta?.sender?.url,
  });
  const { appSession } = useAppSession({ host: appHost });
  const selectedWallet = appSession.address;
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const { asset, selectAssetAddress } = useSendTransactionAsset();

  useEffect(() => {
    selectAssetAddress(
      NATIVE_ASSETS_PER_CHAIN[
        connectedToHardhat ? ChainId.hardhat : appSession.chainId
      ] as Address,
    );
  }, [appSession.chainId, connectedToHardhat, selectAssetAddress]);

  const onAcceptRequest = useCallback(async () => {
    try {
      const txRequest = request?.params?.[0] as TransactionRequest;
      const { type } = await wallet.getWallet(selectedWallet);

      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
      }
      const txData = {
        from: getAddress(txRequest?.from ?? ''),
        to: getAddress(txRequest?.to ?? ''),
        value: txRequest.value,
        chainId: connectedToHardhat ? ChainId.hardhat : appSession.chainId,
      };
      const result = await wallet.sendTransaction(txData);
      if (result) {
        const transaction = {
          amount: formatEther(result.value),
          asset,
          data: result.data,
          value: result.value,
          from: txData.from,
          to: txData.to,
          hash: result.hash,
          chainId: txData.chainId,
          nonce: result.nonce,
          status: TransactionStatus.sending,
          type: TransactionType.send,
        };
        await addNewTransaction({
          address: txData.from as Address,
          chainId: txData.chainId as ChainId,
          transaction,
        });
      }

      approveRequest(result);
      setWaitingForDevice(false);
    } finally {
      setWaitingForDevice(false);
    }
  }, [
    appSession.chainId,
    approveRequest,
    asset,
    connectedToHardhat,
    request?.params,
    selectedWallet,
  ]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <SendTransactionInfo request={request} />
      </Row>
      <Row height="content">
        <SendTransactionActions
          waitingForDevice={waitingForDevice}
          appHost={appHost}
          selectedWallet={selectedWallet}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={rejectRequest}
        />
      </Row>
    </Rows>
  );
}
