import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { queryClient } from '~/core/react-query';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore, useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { DelegationToRevoke, RevokeStatus } from '~/core/types/delegations';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { getChain } from '~/core/utils/chains';
import { toHex } from '~/core/utils/hex';
import { addNewTransaction } from '~/core/utils/transactions';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { TransactionFee } from '~/entries/popup/components/TransactionFee/TransactionFee';
import { popupClient } from '~/entries/popup/handlers/background';
import { isLedgerConnectionError } from '~/entries/popup/handlers/ledger';
import { getWallet } from '~/entries/popup/handlers/wallet';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';
import { RainbowError, logger } from '~/logger';

import { Spinner } from '../../../components/Spinner/Spinner';
import playSound from '../../../utils/playSound';
import { ReviewDetailsRow } from '../../swap/SwapReviewSheet/SwapReviewSheet';

import { SmartWalletLockIcon } from './SmartWalletLockIcon';

// Default gas limit for delegation revoke transactions
const DEFAULT_GAS_LIMIT = 100000n;

type RevokeReason = 'settings' | 'security_alert';

interface LocationState {
  address?: Address;
  delegationsToRevoke: DelegationToRevoke[];
  initialIndex?: number;
  backTo?: string;
  isDisabling?: boolean;
  revokeReason?: RevokeReason;
}

export const RevokeDelegationPage = () => {
  const location = useLocation();
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revokeStatus, setRevokeStatus] = useState<RevokeStatus>('ready');
  const [sending, setSending] = useState(false);
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const selectedGas = useGasStore((state) => state.selectedGas);
  const clearCustomGasModified = useGasStore(
    (state) => state.clearCustomGasModified,
  );

  const revokeAddress =
    (location.state as LocationState)?.address ?? currentAddress;

  // Supports both single and multiple delegations:
  // - Single: array with one delegation, processes once and returns
  // - Multiple: array with all delegations, processes sequentially
  const delegationsToRevoke = useMemo(
    () => (location.state as LocationState)?.delegationsToRevoke || [],
    [location.state],
  );
  const revokeReason: RevokeReason =
    (location.state as LocationState)?.revokeReason ?? 'settings';
  const isSecurityAlert = revokeReason === 'security_alert';

  const currentDelegation = delegationsToRevoke[currentIndex];
  const isLastDelegation = currentIndex === delegationsToRevoke.length - 1;

  // Reset state when component mounts or delegations change
  useEffect(() => {
    if (delegationsToRevoke.length === 0) {
      const backTo =
        (location.state as LocationState)?.backTo ||
        ROUTES.SETTINGS__DELEGATIONS;
      navigate(backTo, { replace: true });
      return;
    }
    // Reset to first delegation if we're starting fresh
    const initialIndex = (location.state as LocationState)?.initialIndex ?? 0;
    setCurrentIndex(initialIndex);
    setRevokeStatus('ready');
    setSending(false);
    setWaitingForDevice(false);
    clearCustomGasModified();
  }, [
    clearCustomGasModified,
    delegationsToRevoke.length,
    navigate,
    location.state,
  ]);

  // Track start event
  useEffect(() => {
    if (currentDelegation) {
      analytics.track(event.delegationRevokeStarted, {
        chainId: currentDelegation.chainId,
        contractAddress: currentDelegation.contractAddress,
        totalDelegations: delegationsToRevoke.length,
      });
    }
  }, [currentDelegation, delegationsToRevoke.length]);

  const handleRevoke = useCallback(async () => {
    if (!currentDelegation || !revokeAddress) return;

    setSending(true);
    setRevokeStatus('claiming');

    try {
      const { type } = await getWallet(revokeAddress);
      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
      }

      // Build gas params
      const gasParams = selectedGas.transactionGasParams;
      // Gas params are strings (hex) from TransactionGasParams, or we fallback to legacy gasPrice
      const maxFeePerGas =
        (gasParams as TransactionGasParams)?.maxFeePerGas ??
        (gasParams as TransactionLegacyGasParams)?.gasPrice ??
        '0x0';
      const maxPriorityFeePerGas =
        (gasParams as TransactionGasParams)?.maxPriorityFeePerGas ?? '0x0';

      const result = await popupClient.wallet.revokeDelegation({
        chainId: currentDelegation.chainId,
        userAddress: revokeAddress as Address,
        transactionOptions: {
          maxFeePerGas: toHex(maxFeePerGas),
          maxPriorityFeePerGas: toHex(maxPriorityFeePerGas),
          gasLimit: toHex(DEFAULT_GAS_LIMIT),
        },
      });

      if (result.error) {
        logger.error(
          new RainbowError('delegation: error revoking delegation'),
          {
            message: result.error,
            chainId: currentDelegation.chainId,
            contractAddress: currentDelegation.contractAddress,
          },
        );

        analytics.track(event.delegationRevokeFailed, {
          chainId: currentDelegation.chainId,
          contractAddress: currentDelegation.contractAddress,
          error: result.error,
        });

        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: result.error,
        });

        setRevokeStatus('recoverableError');
        return;
      }

      if (result.txHash) {
        const transaction: NewTransaction = {
          changes: [],
          data: '0x',
          value: '0',
          from: revokeAddress,
          to: revokeAddress,
          hash: result.txHash as TxHash,
          chainId: currentDelegation.chainId,
          status: 'pending',
          type: 'revoke',
          nonce: result.nonce ?? 0,
          gasPrice: (gasParams as TransactionLegacyGasParams)?.gasPrice,
          maxFeePerGas: (gasParams as TransactionGasParams)?.maxFeePerGas,
          maxPriorityFeePerGas: (gasParams as TransactionGasParams)
            ?.maxPriorityFeePerGas,
        };

        await addNewTransaction({
          address: revokeAddress,
          chainId: currentDelegation.chainId,
          transaction,
        });

        analytics.track(event.delegationRevokeSubmitted, {
          chainId: currentDelegation.chainId,
          contractAddress: currentDelegation.contractAddress,
          txHash: result.txHash,
        });

        playSound('SendSound');

        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[1] === 'shouldRevokeDelegation',
        });

        // Automatically move to next delegation or finish without showing "done"
        if (isLastDelegation) {
          const locationState = location.state as LocationState;
          // If disabling smart wallet, navigate to confirm disable page
          if (locationState?.isDisabling) {
            navigate(ROUTES.SETTINGS__DELEGATIONS__CONFIRM_DISABLE, {
              replace: true,
            });
          } else {
            const backTo =
              locationState?.backTo || ROUTES.SETTINGS__DELEGATIONS;
            navigate(backTo, { replace: true });
          }
        } else {
          // Move to next delegation using replace to avoid route stack buildup
          const nextIndex = currentIndex + 1;
          const locationState = location.state as LocationState;
          navigate(ROUTES.SETTINGS__DELEGATIONS__REVOKE, {
            replace: true,
            state: {
              address: revokeAddress,
              delegationsToRevoke,
              initialIndex: nextIndex,
              backTo: locationState?.backTo || ROUTES.SETTINGS__DELEGATIONS,
              isDisabling: locationState?.isDisabling,
              revokeReason: locationState?.revokeReason,
            },
          });
          // State will be reset by useEffect above
        }
      }
    } catch (e: unknown) {
      const error = e as Error;
      if (!isLedgerConnectionError(error)) {
        const extractedError = error.message?.split('[')[0] || 'Unknown error';
        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: extractedError,
        });
      }

      logger.error(new RainbowError('delegation: error executing revoke'), {
        message: error.message,
        chainId: currentDelegation.chainId,
        contractAddress: currentDelegation.contractAddress,
      });

      analytics.track(event.delegationRevokeFailed, {
        chainId: currentDelegation.chainId,
        contractAddress: currentDelegation.contractAddress,
        error: error.message,
      });

      setRevokeStatus('recoverableError');
    } finally {
      setWaitingForDevice(false);
      setSending(false);
    }
  }, [
    currentDelegation,
    revokeAddress,
    selectedGas.transactionGasParams,
    isLastDelegation,
    navigate,
    currentIndex,
    delegationsToRevoke,
    location.state,
  ]);

  const handleButtonClick = useCallback(async () => {
    if (revokeStatus === 'ready' || revokeStatus === 'recoverableError') {
      handleRevoke();
    }
    // No need to handle 'success' state - navigation happens automatically in handleRevoke
  }, [revokeStatus, handleRevoke]);

  const handleCancel = useCallback(() => {
    const locationState = location.state as LocationState;

    // If there are more delegations, proceed to the next one
    if (!isLastDelegation) {
      const nextIndex = currentIndex + 1;
      navigate(ROUTES.SETTINGS__DELEGATIONS__REVOKE, {
        replace: true,
        state: {
          delegationsToRevoke,
          initialIndex: nextIndex,
          backTo: locationState?.backTo || ROUTES.SETTINGS__DELEGATIONS,
          isDisabling: locationState?.isDisabling,
          revokeReason: locationState?.revokeReason,
        },
      });
      return;
    }

    // If it's the last delegation and we're disabling, navigate to confirm disable page
    if (locationState?.isDisabling) {
      navigate(ROUTES.SETTINGS__DELEGATIONS__CONFIRM_DISABLE, {
        replace: true,
      });
      return;
    }

    // Navigate back to delegations list
    const backTo = locationState?.backTo || ROUTES.SETTINGS__DELEGATIONS;
    navigate(backTo, { replace: true });
  }, [
    navigate,
    location.state,
    isLastDelegation,
    currentIndex,
    delegationsToRevoke,
  ]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === shortcuts.global.CLOSE.key) {
        handleCancel();
      }
    },
  });

  const getButtonLabel = () => {
    if (waitingForDevice) {
      return i18n.t('delegations.revoke.confirm_hw');
    }
    switch (revokeStatus) {
      case 'ready':
        return i18n.t('delegations.revoke.action');
      case 'claiming':
        return i18n.t('delegations.revoke.revoking');
      case 'recoverableError':
        return i18n.t('delegations.revoke.try_again');
      default:
        return i18n.t('delegations.revoke.action');
    }
  };

  if (!currentDelegation) {
    return null;
  }

  const chainInfo = getChain({ chainId: currentDelegation.chainId });

  return (
    <Box
      background="surfaceSecondary"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar
        title={
          isSecurityAlert
            ? i18n.t('delegations.revoke.security_title')
            : i18n.t('delegations.revoke.title')
        }
        titleTestId="revoke-delegation-title"
        leftComponent={<Navbar.BackButton onClick={handleCancel} />}
      />

      <Box
        paddingHorizontal="20px"
        paddingVertical="20px"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Stack space="24px" alignHorizontal="center">
          {/* Icon */}
          {isSecurityAlert ? (
            <Symbol
              symbol="exclamationmark.triangle.fill"
              size={40}
              weight="bold"
              color="red"
            />
          ) : (
            <SmartWalletLockIcon size={40} />
          )}

          {/* Subtitle */}
          <Text
            size="14pt"
            weight="regular"
            align="center"
            color="labelSecondary"
          >
            {isSecurityAlert
              ? i18n.t('delegations.revoke.security_subtitle')
              : i18n.t('delegations.revoke.subtitle')}
          </Text>

          {/* Details Section */}
          <Box
            width="full"
            padding="16px"
            borderRadius="12px"
            background="surfaceSecondaryElevated"
          >
            <Stack space="12px">
              {/* Chain info */}
              <ReviewDetailsRow testId="revoke-delegation-chain">
                <Inline
                  alignHorizontal="left"
                  space="4px"
                  alignVertical="center"
                >
                  <Symbol
                    weight="semibold"
                    size={16}
                    symbol="network"
                    color="labelTertiary"
                  />
                  <Text
                    align="left"
                    color="labelSecondary"
                    size="14pt"
                    weight="semibold"
                  >
                    {i18n.t('delegations.revoke.chain_label')}
                  </Text>
                </Inline>

                <Inline space="4px" alignVertical="center">
                  <ChainBadge
                    size={14}
                    chainId={currentDelegation.chainId || ChainId.mainnet}
                  />
                  <Text size="14pt" weight="semibold" color="label">
                    {chainInfo.name}
                  </Text>
                </Inline>
              </ReviewDetailsRow>

              {/* Contract address - only show for Rainbow delegations */}
              {currentDelegation.contractAddress && (
                <ReviewDetailsRow testId="revoke-delegation-contract">
                  <Inline
                    alignHorizontal="left"
                    space="4px"
                    alignVertical="center"
                  >
                    <Symbol
                      weight="semibold"
                      size={16}
                      symbol="doc.plaintext"
                      color="labelTertiary"
                    />
                    <Text
                      align="left"
                      color="labelSecondary"
                      size="14pt"
                      weight="semibold"
                    >
                      {i18n.t('delegations.revoke.contract_label')}
                    </Text>
                  </Inline>

                  <Text size="14pt" weight="semibold" color="label">
                    {truncateAddress(currentDelegation.contractAddress)}
                  </Text>
                </ReviewDetailsRow>
              )}
            </Stack>
          </Box>

          {/* Progress indicator for multiple delegations */}
          {delegationsToRevoke.length > 1 && (
            <Stack space="8px" alignHorizontal="center">
              <Box
                background="surfaceSecondary"
                borderRadius="8px"
                style={{
                  height: '4px',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '200px',
                }}
              >
                <Box
                  background="blue"
                  borderRadius="8px"
                  style={{
                    height: '100%',
                    width: `${
                      ((currentIndex + 1) / delegationsToRevoke.length) * 100
                    }%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
              <Text size="12pt" color="labelSecondary" weight="semibold">
                {i18n.t('delegations.revoke.progress', {
                  current: currentIndex + 1,
                  total: delegationsToRevoke.length,
                })}
              </Text>
            </Stack>
          )}
        </Stack>
      </Box>

      <Box
        background="surfaceSecondary"
        style={{
          position: 'sticky',
          bottom: 0,
          width: '100%',
        }}
      >
        <Separator color="separatorSecondary" />
        <Box width="full" padding="20px">
          <Rows space="20px" alignVertical="center">
            <Row>
              <TransactionFee
                chainId={currentDelegation.chainId}
                address={revokeAddress}
                transactionRequest={{
                  to: revokeAddress,
                  from: revokeAddress,
                  chainId: currentDelegation.chainId,
                  data: '0x',
                  value: '0x0',
                }}
              />
            </Row>
            <Row>
              <Button
                color={waitingForDevice ? 'label' : 'red'}
                height="44px"
                variant={waitingForDevice ? 'disabled' : 'flat'}
                width="full"
                onClick={handleButtonClick}
                testId="revoke-delegation-confirm-button"
                tabIndex={0}
                ref={confirmButtonRef}
                disabled={sending || revokeStatus === 'claiming'}
              >
                {sending ? (
                  <Box
                    width="fit"
                    alignItems="center"
                    justifyContent="center"
                    style={{ margin: 'auto' }}
                  >
                    <Spinner size={16} color="label" />
                  </Box>
                ) : (
                  <TextOverflow weight="bold" size="16pt" color="label">
                    {waitingForDevice
                      ? `👀 ${i18n.t('delegations.revoke.confirm_hw')}`
                      : getButtonLabel()}
                  </TextOverflow>
                )}
              </Button>
            </Row>
            <Row>
              <Inline alignHorizontal="center">
                <Button
                  color="transparent"
                  height="44px"
                  variant="tinted"
                  onClick={handleCancel}
                  tabIndex={0}
                  width="full"
                >
                  <Text weight="bold" size="16pt" color="labelSecondary">
                    {i18n.t('delegations.revoke.cancel')}
                  </Text>
                </Button>
              </Inline>
            </Row>
          </Rows>
        </Box>
      </Box>
    </Box>
  );
};
