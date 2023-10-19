import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { formatEther } from '@ethersproject/units';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { NATIVE_ASSETS_PER_CHAIN } from '~/core/references';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useGasStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { chainIdToUse } from '~/core/utils/chains';
import { addNewTransaction } from '~/core/utils/transactions';
import { Row, Rows } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { showLedgerDisconnectedAlertIfNeeded } from '~/entries/popup/handlers/ledger';
import { useSendAsset } from '~/entries/popup/hooks/send/useSendAsset';
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
  const [loading, setLoading] = useState(false);
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });
  const { selectedGas } = useGasStore();
  const selectedWallet = activeSession?.address || '';
  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore();
  const { asset, selectAssetAddressAndChain } = useSendAsset();
  const { watchedWallets } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();

  const onAcceptRequest = useCallback(async () => {
    if (!config.tx_requests_enabled) return;
    if (!selectedWallet || !activeSession) return;
    setLoading(true);
    try {
      const txRequest = request?.params?.[0] as TransactionRequest;
      const { type } = await wallet.getWallet(selectedWallet);

      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
      }

      const activeChainId = chainIdToUse(
        connectedToHardhat,
        connectedToHardhatOp,
        activeSession?.chainId,
      );
      const txData = {
        from: selectedWallet,
        to: txRequest?.to ? getAddress(txRequest?.to) : undefined,
        value: txRequest.value || '0x0',
        data: txRequest.data ?? '0x',
        chainId: activeChainId,
      };
      const result = await wallet.sendTransaction(txData);
      if (result) {
        const transaction = {
          asset: asset || undefined,
          value: formatEther(result?.value || ''),
          data: result.data,
          from: txData.from,
          to: txData.to,
          hash: result.hash as TxHash,
          chainId: txData.chainId,
          nonce: result.nonce,
          status: 'pending',
          type: 'send',
          ...selectedGas.transactionGasParams,
        } satisfies NewTransaction;

        addNewTransaction({
          address: txData.from as Address,
          chainId: txData.chainId as ChainId,
          transaction,
        });
        approveRequest(result.hash);
        setWaitingForDevice(false);

        analytics.track(event.dappPromptSendTransactionApproved, {
          chainId: txData.chainId,
          dappURL: dappMetadata?.appHost || '',
          dappName: dappMetadata?.appName,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showLedgerDisconnectedAlertIfNeeded(e);
    } finally {
      setWaitingForDevice(false);
      setLoading(false);
    }
  }, [
    selectedWallet,
    activeSession,
    request?.params,
    connectedToHardhat,
    connectedToHardhatOp,
    asset,
    selectedGas.transactionGasParams,
    approveRequest,
    dappMetadata?.appHost,
    dappMetadata?.appName,
  ]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    if (activeSession) {
      analytics.track(event.dappPromptSendTransactionRejected, {
        chainId: activeSession?.chainId,
        dappURL: dappMetadata?.appHost || '',
        dappName: dappMetadata?.appName,
      });
    }
  }, [
    rejectRequest,
    activeSession,
    dappMetadata?.appHost,
    dappMetadata?.appName,
  ]);

  const isWatchingWallet = useMemo(() => {
    const watchedAddresses = watchedWallets?.map(({ address }) => address);
    return selectedWallet && watchedAddresses?.includes(selectedWallet);
  }, [selectedWallet, watchedWallets]);

  useEffect(() => {
    if (!featureFlags.full_watching_wallets && isWatchingWallet) {
      triggerAlert({
        text: i18n.t('alert.wallet_watching_mode'),
        callback: rejectRequest,
      });
    }
  }, [featureFlags.full_watching_wallets, isWatchingWallet, rejectRequest]);

  const activeChainId = chainIdToUse(
    connectedToHardhat,
    connectedToHardhatOp,
    activeSession?.chainId,
  );

  useEffect(() => {
    if (activeSession) {
      selectAssetAddressAndChain(
        NATIVE_ASSETS_PER_CHAIN[activeChainId] as Address,
        activeChainId,
      );
    }
  }, [
    activeSession,
    connectedToHardhat,
    activeChainId,
    selectAssetAddressAndChain,
  ]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <SendTransactionInfo request={request} />
      </Row>
      <Row height="content">
        <SendTransactionActions
          chainId={activeSession?.chainId || ChainId.mainnet}
          waitingForDevice={waitingForDevice}
          appHost={dappMetadata?.appHost || ''}
          selectedWallet={selectedWallet || ('' as Address)}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
        />
      </Row>
    </Rows>
  );
}
