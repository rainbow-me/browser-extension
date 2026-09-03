import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address, type Hex, getAddress } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { getWalletContext } from '~/analytics/util';
import config from '~/core/firebase/remoteConfig';
import {
  DAppStatus,
  type Transaction as SimulateTransactionInput,
  TransactionScanResultType,
} from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { envelopeToTransactionRequest } from '~/core/sendCalls/prepareEnvelope';
import { useGasStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useFeatureFlagLocalOverwriteStore } from '~/core/state/currentSettings/featureFlags';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { AddressOrEth } from '~/core/types/assets';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { chainIdToUse } from '~/core/utils/chains';
import { getDappHost } from '~/core/utils/connectedApps';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { addNewTransaction } from '~/core/utils/transactions';
import { Bleed, Box, Separator, Stack } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { TransactionFee } from '~/entries/popup/components/TransactionFee/TransactionFee';
import { showLedgerDisconnectedAlertIfNeeded } from '~/entries/popup/handlers/ledger';
import { useSendAsset } from '~/entries/popup/hooks/send/useSendAsset';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { RainbowError, logger } from '~/logger';

import { popupClient } from '../../../handlers/background';
import * as wallet from '../../../handlers/wallet';
import { AccountSigningWith } from '../AccountSigningWith';
import { useSimulateTransaction } from '../useSimulateTransaction';

import { SendTransactionActions } from './SendTransactionActions';
import { SendTransactionInfo } from './SendTransactionsInfo';
import {
  getChainIdForRequest,
  getSendCallsParams,
  getTransactionRequestFromRequest,
  isWalletSendCallsRequest,
} from './normalizeRequest';
import { usePrepareSendCallsEnvelope } from './usePrepareSendCallsEnvelope';

interface ApproveRequestProps {
  approveRequest: (payload: unknown) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
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
  const { activeSession } = useAppSession({
    host: dappMetadata?.appHost,
  });
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

  const isSendCalls = isWalletSendCallsRequest(request);
  const sendParams = useMemo(() => getSendCallsParams(request), [request]);

  const chainId = useMemo(
    () =>
      chainIdToUse(
        connectedToHardhat,
        connectedToHardhatOp,
        getChainIdForRequest(request, activeSession?.chainId),
      ),
    [request, activeSession?.chainId, connectedToHardhat, connectedToHardhatOp],
  );
  const sendCallsFlowReady = !isSendCalls || !!selectedWallet;

  const { data: preparedEnvelope, isPending: envelopePending } =
    usePrepareSendCallsEnvelope({
      sendParams,
      from: selectedWallet as Address | undefined,
      enabled: isSendCalls && sendCallsFlowReady,
    });

  /** Gas + simulation use one request: the prepared envelope for `wallet_sendCalls`, else the dapp tx. */
  const transactionRequest = useMemo((): TransactionRequest | null => {
    if (isSendCalls) {
      if (!preparedEnvelope || !sendParams) return null;
      return envelopeToTransactionRequest(
        preparedEnvelope,
        chainId,
        (sendParams.from ?? selectedWallet) as Address,
      );
    }
    return getTransactionRequestFromRequest(request);
  }, [
    isSendCalls,
    preparedEnvelope,
    sendParams,
    request,
    chainId,
    selectedWallet,
  ]);

  /** Hex wei for tx `value` — included in `useHasEnoughGas` so balance covers value + gas. */
  const nativeValueHexForBalanceCheck = useMemo((): Hex | undefined => {
    if (isSendCalls || !transactionRequest) return undefined;
    const raw = transactionRequest.value;
    if (raw === undefined || raw === null) return '0x0';
    try {
      return BigNumber.from(raw).toHexString() as Hex;
    } catch (e) {
      logger.info('SendTransaction: invalid tx value for balance check', {
        message: (e as Error)?.message,
      });
      return '0x0';
    }
  }, [isSendCalls, transactionRequest]);

  const simulationTransaction = useMemo((): SimulateTransactionInput | null => {
    if (!sendCallsFlowReady || !transactionRequest) return null;
    const to = transactionRequest.to?.toString() ?? '';
    if (!to) return null;
    const row: SimulateTransactionInput = {
      from: transactionRequest.from?.toString() ?? '',
      to,
      value: transactionRequest.value?.toString() ?? '0',
      data: transactionRequest.data?.toString() ?? '0x',
    };
    const auth = preparedEnvelope?.authorization_list;
    if (isSendCalls && auth?.length) {
      row.authorization_list = auth.map((a) => ({
        address: a.address,
        chainId: String(a.chainId),
        nonce: String(a.nonce),
      }));
    }
    return row;
  }, [transactionRequest, preparedEnvelope, isSendCalls, sendCallsFlowReady]);

  const simulationResult = useSimulateTransaction({
    chainId,
    transaction: simulationTransaction,
    domain: request?.meta?.sender?.url || '',
  });

  const effectiveDappStatus = useMemo(() => {
    const meta = dappMetadata?.status;
    if (simulationResult.status !== 'success' || !simulationResult.data) {
      return meta;
    }
    const scan = simulationResult.data.scanning.result;
    if (scan === TransactionScanResultType.Malicious) return DAppStatus.Scam;
    if (scan === TransactionScanResultType.Warning)
      return meta ?? DAppStatus.Unverified;
    return meta;
  }, [dappMetadata?.status, simulationResult.status, simulationResult.data]);

  const isSigningWithDevice = useMemo(() => {
    const signingWithDevice =
      allWallets.find((w) => isLowerCaseMatch(w.address, selectedWallet))
        ?.type === 'HardwareWalletKeychain';
    return signingWithDevice;
  }, [allWallets, selectedWallet]);

  const onAcceptRequest = useCallback(async () => {
    if (!config.tx_requests_enabled) return;
    if (!selectedWallet || !activeSession) return;

    if (isSendCalls) {
      if (isSigningWithDevice) {
        triggerAlert({
          text: i18n.t('approve_request.batch_hardware_unsupported'),
        });
        return;
      }
      const sp = sendParams;
      if (!sp?.calls?.length || !preparedEnvelope) return;
      const senderUrl = request?.meta?.sender?.url;
      const app =
        dappMetadata?.appHost ??
        (typeof senderUrl === 'string' ? getDappHost(senderUrl) : '') ??
        '';
      if (!app) {
        logger.error(new RainbowError('send: batch approval missing app host'));
        return;
      }
      setLoading(true);
      try {
        const { vendor } = await wallet.getWallet(selectedWallet);
        await popupClient.wallet.executeSendCallsBatch({
          sendParams: {
            version: sp.version,
            chainId: sp.chainId,
            from: sp.from,
            calls: sp.calls,
            id: sp.id,
            atomicRequired: sp.atomicRequired,
          },
          sender: selectedWallet,
          app,
        });
        approveRequest({ id: sp.id });

        analytics.track(
          event.dappPromptSendTransactionApproved,
          {
            chainId,
            dappURL: dappMetadata?.url || '',
            dappDomain: dappMetadata?.appHost || '',
            dappName: dappMetadata?.appName,
            hardwareWallet: false,
            hardwareWalletVendor: vendor,
          },
          await getWalletContext(activeSession?.address),
        );
      } catch (e) {
        if (e instanceof Error) showLedgerDisconnectedAlertIfNeeded(e);
        logger.error(new RainbowError('send: batch approval error'), {
          message: (e as Error)?.message,
        });
        const extractedError =
          e instanceof Error ? e.message.split('[')[0] : String(e);
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
        const hasNativeValue = result.value?.gt(0);
        const transaction = {
          ...(hasNativeValue && asset
            ? {
                type: 'send' as const,
                changes: [
                  {
                    direction: 'out' as const,
                    asset,
                    value: result.value.toString(),
                  },
                ],
              }
            : {
                type: 'contract_interaction' as const,
                changes: [],
              }),
          asset: asset || undefined,
          value: result.value.toString(),
          data: result.data,
          from: txData.from,
          to: txData.to,
          hash: result.hash as TxHash,
          chainId: txData.chainId,
          nonce: result.nonce,
          status: 'pending',
          ...selectedGas.transactionGasParams,
        } satisfies NewTransaction;

        addNewTransaction({
          address: txData.from,
          chainId: txData.chainId,
          transaction,
        });
        approveRequest(result.hash);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showLedgerDisconnectedAlertIfNeeded(e);
      logger.error(
        new RainbowError('send: error executing send dapp approval'),
        {
          message: (e as Error)?.message,
        },
      );
      const extractedError = (e as Error).message.split('[')[0];
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
    sendParams,
    preparedEnvelope,
    isSendCalls,
    isSigningWithDevice,
    connectedToHardhat,
    connectedToHardhatOp,
    asset,
    selectedGas.transactionGasParams,
    approveRequest,
    dappMetadata?.url,
    dappMetadata?.appHost,
    dappMetadata?.appName,
    chainId,
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
      <SendTransactionInfo
        request={request}
        chainId={chainId}
        dappStatusForUi={effectiveDappStatus}
        simulationResult={simulationResult}
        onRejectRequest={rejectRequest}
        nativeValueHex={nativeValueHexForBalanceCheck}
      />
      <Stack space="20px" padding="20px">
        <Bleed vertical="4px">
          <AccountSigningWith session={activeSession} />
        </Bleed>
        <Separator color="separatorTertiary" />
        {transactionRequest ? (
          <TransactionFee
            analyticsEvents={{
              customGasClicked: event.dappPromptSendTransactionCustomGasClicked,
              transactionSpeedSwitched:
                event.dappPromptSendTransactionSpeedSwitched,
              transactionSpeedClicked:
                event.dappPromptSendTransactionSpeedClicked,
            }}
            chainId={chainId}
            address={activeSession?.address}
            transactionRequest={transactionRequest}
            simulatedGasLimit={
              isSendCalls ? simulationResult.data?.gasEstimate : undefined
            }
            plainTriggerBorder
            feeInfoButton={
              isSendCalls
                ? {
                    onClick: () => {
                      triggerAlert({
                        text: i18n.t('approve_request.batch_fee_note'),
                      });
                    },
                  }
                : undefined
            }
          />
        ) : null}
        <SendTransactionActions
          session={activeSession}
          waitingForDevice={waitingForDevice}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading || (isSendCalls && envelopePending)}
          dappStatus={effectiveDappStatus}
          signingWithDevice={isSigningWithDevice}
          nativeValueHex={nativeValueHexForBalanceCheck}
        />
      </Stack>
    </Box>
  );
}
