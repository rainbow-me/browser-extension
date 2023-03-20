import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { formatEther } from '@ethersproject/units';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { NATIVE_ASSETS_PER_CHAIN } from '~/core/references';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { Row, Rows } from '~/design-system';
import { useSendAsset } from '~/entries/popup/hooks/send/useSendAsset';
import { useAlert } from '~/entries/popup/hooks/useAlert';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useWallets } from '~/entries/popup/hooks/useWallets';

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
  const { appHost, appName } = useAppMetadata({
    url: request?.meta?.sender?.url,
  });
  const { appSession } = useAppSession({ host: appHost });
  const selectedWallet = appSession.address;
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const { asset, selectAssetAddress } = useSendAsset();
  const { watchedWallets } = useWallets();
  const { triggerAlert } = useAlert();

  const onAcceptRequest = useCallback(async () => {
    if (!config.tx_requests_enabled) return;
    try {
      const txRequest = request?.params?.[0] as TransactionRequest;
      const { type } = await wallet.getWallet(selectedWallet);

      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
      }
      const txData = {
        from: selectedWallet,
        to: getAddress(txRequest?.to ?? ''),
        value: txRequest.value,
        data: txRequest.data ?? '0x',
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

      approveRequest(result.hash);
      setWaitingForDevice(false);

      analytics.track(event.dappPromptSendTransactionApproved, {
        chainId: txData.chainId,
        dappURL: appHost,
        dappName: appName,
      });
    } finally {
      setWaitingForDevice(false);
    }
  }, [
    appHost,
    appName,
    appSession.chainId,
    approveRequest,
    asset,
    connectedToHardhat,
    request?.params,
    selectedWallet,
  ]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    analytics.track(event.dappPromptSendTransactionRejected, {
      chainId: appSession.chainId,
      dappURL: appHost,
      dappName: appName,
    });
  }, [appHost, appName, appSession.chainId, rejectRequest]);

  const isWatchingWallet = useMemo(() => {
    const watchedAddresses = watchedWallets?.map(({ address }) => address);
    return selectedWallet && watchedAddresses?.includes(selectedWallet);
  }, [selectedWallet, watchedWallets]);

  useEffect(() => {
    if (isWatchingWallet) {
      triggerAlert({
        text: i18n.t('alert.wallet_watching_mode'),
        callback: rejectRequest,
      });
    }
  }, [isWatchingWallet, rejectRequest, triggerAlert]);

  useEffect(() => {
    selectAssetAddress(
      NATIVE_ASSETS_PER_CHAIN[
        connectedToHardhat ? ChainId.hardhat : appSession.chainId
      ] as Address,
    );
  }, [appSession.chainId, connectedToHardhat, selectAssetAddress]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <SendTransactionInfo request={request} />
      </Row>
      <Row height="content">
        <SendTransactionActions
          chainId={appSession.chainId}
          waitingForDevice={waitingForDevice}
          appHost={appHost}
          selectedWallet={selectedWallet}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
        />
      </Row>
    </Rows>
  );
}
