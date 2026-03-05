import { executeBatchedTransaction } from '@rainbow-me/delegation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address, getAddress } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { getWalletContext } from '~/analytics/util';
import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useBatchStore, useGasStore, useNonceStore } from '~/core/state';
import { BatchStatus } from '~/core/state/batches';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useFeatureFlagLocalOverwriteStore } from '~/core/state/currentSettings/featureFlags';
import { useNetworkStore } from '~/core/state/networks/networks';
import { type ApproveRequestPayload } from '~/core/state/requests';
import { toBatchCall } from '~/core/transactions/batchSimulation';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { chainIdToUse } from '~/core/utils/chains';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { addNewTransaction } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import { getViemWalletClient } from '~/core/viem/walletClient';
import { Bleed, Box, Separator, Stack } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { TransactionFee } from '~/entries/popup/components/TransactionFee/TransactionFee';
import { showLedgerDisconnectedAlertIfNeeded } from '~/entries/popup/handlers/ledger';
import { useSendAsset } from '~/entries/popup/hooks/send/useSendAsset';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { RainbowError, logger } from '~/logger';

import * as wallet from '../../../handlers/wallet';
import { AccountSigningWith } from '../AccountSigningWith';

import { SendTransactionActions } from './SendTransactionActions';
import { SendTransactionInfo } from './SendTransactionsInfo';
import {
  getSendCallsParams,
  getTransactionRequestFromRequest,
  isWalletSendCallsRequest,
} from './normalizeRequest';

interface ApproveRequestProps {
  approveRequest: (payload?: ApproveRequestPayload) => void;
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
  const selectedGas = useGasStore((state) => state.selectedGas);
  const chainsNativeAsset = useNetworkStore((state) =>
    state.getChainsNativeAsset(),
  );
  const selectedWallet = activeSession?.address || '';
  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore();
  const { asset, selectAssetAddressAndChain } = useSendAsset();
  const { allWallets, watchedWallets } = useWallets();
  const { featureFlags } = useFeatureFlagLocalOverwriteStore();

  const onAcceptRequest = useCallback(async () => {
    if (!config.tx_requests_enabled) return;
    if (!selectedWallet || !activeSession) return;

    if (isWalletSendCallsRequest(request)) {
      const sendParams = getSendCallsParams(request);
      if (!sendParams?.calls?.length) return;

      const from = getAddress(sendParams.from || activeSession.address);
      const chainId = chainIdToUse(
        connectedToHardhat,
        connectedToHardhatOp,
        Number(sendParams.chainId) || activeSession.chainId,
      );
      const app = new URL(request?.meta?.sender?.url || '').host || '';

      const walletClient = await getViemWalletClient({
        address: from,
        chainId,
      });
      if (!walletClient) {
        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: i18n.t(
            'approve_request.batch_hardware_wallet_unsupported',
          ),
        });
        return;
      }

      const publicClient = getViemClient({ chainId });
      const nonce =
        useNonceStore.getState().getNonce({ address: from, chainId })
          ?.currentNonce ??
        (await publicClient.getTransactionCount({
          address: from,
          blockTag: 'pending',
        }));

      const gasParams = selectedGas.transactionGasParams as
        | TransactionGasParams
        | TransactionLegacyGasParams;
      const maxFeePerGas =
        'maxFeePerGas' in gasParams && gasParams.maxFeePerGas
          ? BigInt(gasParams.maxFeePerGas)
          : 'gasPrice' in gasParams && gasParams.gasPrice
          ? BigInt(gasParams.gasPrice)
          : BigInt(0);
      const maxPriorityFeePerGas =
        'maxPriorityFeePerGas' in gasParams && gasParams.maxPriorityFeePerGas
          ? BigInt(gasParams.maxPriorityFeePerGas)
          : 'gasPrice' in gasParams && gasParams.gasPrice
          ? BigInt(gasParams.gasPrice)
          : BigInt(0);

      setLoading(true);
      try {
        const calls = sendParams.calls.map(toBatchCall);
        const result = await executeBatchedTransaction({
          calls,
          walletClient,
          publicClient,
          chainId,
          transactionOptions: {
            maxFeePerGas,
            maxPriorityFeePerGas,
            gasLimit: null,
          },
          nonce,
        });

        if (!result.hash) {
          throw new Error('Transaction failed - no hash returned');
        }

        const { setBatch } = useBatchStore.getState();
        const batchId = sendParams.id;
        if (!batchId) {
          throw new Error('Missing batch id');
        }
        setBatch({
          id: batchId,
          sender: from,
          app,
          chainId,
          status: BatchStatus.Pending,
          atomic: !!sendParams.atomicRequired,
          txHashes: [result.hash],
        });

        const transaction: NewTransaction = {
          from,
          to: sendParams.calls[0]?.to || (from as Address),
          value: '0',
          data: sendParams.calls[0]?.data || '0x',
          hash: result.hash as TxHash,
          chainId,
          nonce,
          status: 'pending',
          type: 'send',
          batch: true,
          delegation: result.type === 'eip7702',
        };

        addNewTransaction({
          address: from,
          chainId,
          transaction,
        });
        approveRequest({ id: batchId });

        analytics.track(
          event.dappPromptSendTransactionApproved,
          {
            chainId,
            dappURL: dappMetadata?.url || '',
            dappDomain: dappMetadata?.appHost || '',
            dappName: dappMetadata?.appName,
            hardwareWallet: false,
            hardwareWalletVendor: undefined,
          },
          await getWalletContext(activeSession?.address),
        );
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e));
        showLedgerDisconnectedAlertIfNeeded(err);
        logger.error(new RainbowError('send: batch execution error'), {
          message: err.message,
        });
        const extractedError = err.message.split('[')[0];
        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: extractedError,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const txRequest = getTransactionRequestFromRequest(request);
      if (!txRequest) return;
      const { type, vendor } = await wallet.getWallet(selectedWallet);

      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
      }
      const activeChainId = chainIdToUse(
        connectedToHardhat,
        connectedToHardhatOp,
        activeSession.chainId,
      );
      const txData = {
        from: selectedWallet,
        to: txRequest?.to ? (getAddress(txRequest?.to) as Address) : undefined,
        value: txRequest.value || '0x0',
        data: txRequest.data ?? '0x',
        chainId: activeChainId,
      };
      const result = await wallet.sendTransaction(txData);
      if (result) {
        const transaction = {
          asset: asset || undefined,
          value: result.value.toString(),
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
          address: txData.from,
          chainId: txData.chainId,
          transaction,
        });
        approveRequest(result.hash as TxHash);
        setWaitingForDevice(false);

        analytics.track(
          event.dappPromptSendTransactionApproved,
          {
            chainId: txData.chainId,
            dappURL: dappMetadata?.url || '',
            dappDomain: dappMetadata?.appHost || '',
            dappName: dappMetadata?.appName,
            hardwareWallet: !!vendor,
            hardwareWalletVendor: vendor,
          },
          await getWalletContext(activeSession?.address),
        );
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      showLedgerDisconnectedAlertIfNeeded(err);
      logger.error(
        new RainbowError('send: error executing send dapp approval'),
        { message: err.message },
      );
      const extractedError = err.message.split('[')[0];
      triggerAlert({
        text: i18n.t('errors.sending_transaction'),
        description: extractedError,
      });
    } finally {
      setWaitingForDevice(false);
      setLoading(false);
    }
  }, [
    request,
    selectedWallet,
    activeSession,
    connectedToHardhat,
    connectedToHardhatOp,
    asset,
    selectedGas.transactionGasParams,
    approveRequest,
    dappMetadata?.url,
    dappMetadata?.appHost,
    dappMetadata?.appName,
  ]);

  const onRejectRequest = useCallback(async () => {
    rejectRequest();
    if (activeSession) {
      const { vendor } = await wallet.getWallet(activeSession.address);
      analytics.track(
        event.dappPromptSendTransactionRejected,
        {
          chainId: activeSession?.chainId,
          dappURL: dappMetadata?.url || '',
          dappDomain: dappMetadata?.appHost || '',
          dappName: dappMetadata?.appName,
          hardwareWallet: !!vendor,
          hardwareWalletVendor: vendor,
        },
        await getWalletContext(activeSession?.address),
      );
    }
  }, [
    rejectRequest,
    activeSession,
    dappMetadata?.url,
    dappMetadata?.appHost,
    dappMetadata?.appName,
  ]);

  const isWatchingWallet = useMemo(() => {
    const watchedAddresses = watchedWallets?.map(({ address }) => address);
    return selectedWallet && watchedAddresses?.includes(selectedWallet);
  }, [selectedWallet, watchedWallets]);

  const isSigningWithDevice = useMemo(() => {
    const signingWithDevice =
      allWallets.find((w) => isLowerCaseMatch(w.address, selectedWallet))
        ?.type === 'HardwareWalletKeychain';
    return signingWithDevice;
  }, [allWallets, selectedWallet]);

  const txRequest = useMemo(
    () => getTransactionRequestFromRequest(request),
    [request],
  );

  useEffect(() => {
    if (!featureFlags.full_watching_wallets && isWatchingWallet) {
      triggerAlert({
        text: i18n.t('alert.wallet_watching_mode'),
        callback: rejectRequest,
      });
    }
  }, [featureFlags.full_watching_wallets, isWatchingWallet, rejectRequest]);

  useEffect(() => {
    if (activeSession) {
      const activeChainId = chainIdToUse(
        connectedToHardhat,
        connectedToHardhatOp,
        activeSession?.chainId,
      );
      selectAssetAddressAndChain(
        chainsNativeAsset[activeChainId]?.address as AddressOrEth,
        activeChainId,
      );
    }
  }, [
    activeSession,
    connectedToHardhat,
    selectAssetAddressAndChain,
    connectedToHardhatOp,
    chainsNativeAsset,
  ]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: POPUP_DIMENSIONS.height, overflow: 'hidden' }}
    >
      <SendTransactionInfo request={request} onRejectRequest={rejectRequest} />
      <Stack space="20px" padding="20px">
        <Bleed vertical="4px">
          <AccountSigningWith session={activeSession} />
        </Bleed>
        <Separator color="separatorTertiary" />
        {txRequest && (
          <TransactionFee
            analyticsEvents={{
              customGasClicked: event.dappPromptSendTransactionCustomGasClicked,
              transactionSpeedSwitched:
                event.dappPromptSendTransactionSpeedSwitched,
              transactionSpeedClicked:
                event.dappPromptSendTransactionSpeedClicked,
            }}
            chainId={activeSession?.chainId || ChainId.mainnet}
            address={activeSession?.address}
            transactionRequest={txRequest}
            plainTriggerBorder
          />
        )}
        <SendTransactionActions
          session={activeSession}
          waitingForDevice={waitingForDevice}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
          signingWithDevice={isSigningWithDevice}
        />
      </Stack>
    </Box>
  );
}
