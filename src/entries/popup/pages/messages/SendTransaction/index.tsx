import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { getWalletContext } from '~/analytics/util';
import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useGasStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { networkStore } from '~/core/state/networks/networks';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { chainIdToUse } from '~/core/utils/chains';
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

import * as wallet from '../../../handlers/wallet';
import { AccountSigningWith } from '../AccountSigningWith';

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
  const selectedGas = useGasStore.use.selectedGas();
  const chainsNativeAsset = networkStore((state) =>
    state.getChainsNativeAsset(),
  );
  const selectedWallet = activeSession?.address || '';
  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore();
  const { asset, selectAssetAddressAndChain } = useSendAsset();
  const { allWallets, watchedWallets } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();

  const onAcceptRequest = useCallback(async () => {
    if (!config.tx_requests_enabled) return;
    if (!selectedWallet || !activeSession) return;
    setLoading(true);
    try {
      const txRequest = request?.params?.[0] as TransactionRequest;
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
    selectedWallet,
    activeSession,
    request?.params,
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
          transactionRequest={request?.params?.[0] as TransactionRequest}
          plainTriggerBorder
        />
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
