import type { Revoke } from '@rainbow-me/delegation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { queryClient } from '~/core/react-query';
import { shortcuts } from '~/core/references/shortcuts';
import { useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { RevokeReason } from '~/core/types/delegations';
import { type TransactionGasParams } from '~/core/types/gas';
import { type NewTransaction } from '~/core/types/transactions';
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
import { useDelegationAddress } from './useDelegationAddress';

interface RevokeDelegationLocationState {
  address?: Address;
  delegationsToRevoke: Revoke[];
  initialIndex?: number;
  backTo?: string;
  isDisabling?: boolean;
  revokeReason?: RevokeReason | string;
}

type RevokeStatus = 'ready' | 'revoking' | 'failed';

const REVOKE_REASON_I18N_KEYS: Record<
  RevokeReason,
  { title: string; subtitle: string }
> = {
  [RevokeReason.DISABLE_SMART_WALLET]: {
    title: 'delegations.revoke.reason.disable_smart_wallet.title',
    subtitle: 'delegations.revoke.reason.disable_smart_wallet.subtitle',
  },
  [RevokeReason.DISABLE_SINGLE_NETWORK]: {
    title: 'delegations.revoke.reason.disable_single_network.title',
    subtitle: 'delegations.revoke.reason.disable_single_network.subtitle',
  },
  [RevokeReason.DISABLE_THIRD_PARTY]: {
    title: 'delegations.revoke.reason.disable_third_party.title',
    subtitle: 'delegations.revoke.reason.disable_third_party.subtitle',
  },
  [RevokeReason.ALERT_VULNERABILITY]: {
    title: 'delegations.revoke.reason.alert_vulnerability.title',
    subtitle: 'delegations.revoke.reason.alert_vulnerability.subtitle',
  },
  [RevokeReason.ALERT_BUG]: {
    title: 'delegations.revoke.reason.alert_bug.title',
    subtitle: 'delegations.revoke.reason.alert_bug.subtitle',
  },
  [RevokeReason.ALERT_UNRECOGNIZED]: {
    title: 'delegations.revoke.reason.alert_unrecognized.title',
    subtitle: 'delegations.revoke.reason.alert_unrecognized.subtitle',
  },
  [RevokeReason.ALERT_UNSPECIFIED]: {
    title: 'delegations.revoke.reason.alert_unspecified.title',
    subtitle: 'delegations.revoke.reason.alert_unspecified.subtitle',
  },
};

// Legacy string reasons for backward compatibility
const LEGACY_REASON_MAP: Record<string, RevokeReason> = {
  settings: RevokeReason.DISABLE_SINGLE_NETWORK,
  security_alert: RevokeReason.ALERT_UNSPECIFIED,
};

function isEip1559GasParams(
  gasParams: unknown,
): gasParams is TransactionGasParams {
  if (!gasParams || typeof gasParams !== 'object') return false;

  const maxFeePerGas = Reflect.get(gasParams, 'maxFeePerGas');
  const maxPriorityFeePerGas = Reflect.get(gasParams, 'maxPriorityFeePerGas');

  return (
    typeof maxFeePerGas === 'string' &&
    maxFeePerGas.length > 0 &&
    typeof maxPriorityFeePerGas === 'string' &&
    maxPriorityFeePerGas.length > 0
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function resolveRevokeReason(rawRevokeReason: unknown): RevokeReason {
  if (
    typeof rawRevokeReason === 'string' &&
    rawRevokeReason in LEGACY_REASON_MAP
  ) {
    return LEGACY_REASON_MAP[rawRevokeReason];
  }

  switch (rawRevokeReason) {
    case RevokeReason.DISABLE_SMART_WALLET:
    case RevokeReason.DISABLE_SINGLE_NETWORK:
    case RevokeReason.DISABLE_THIRD_PARTY:
    case RevokeReason.ALERT_VULNERABILITY:
    case RevokeReason.ALERT_BUG:
    case RevokeReason.ALERT_UNRECOGNIZED:
    case RevokeReason.ALERT_UNSPECIFIED:
      return rawRevokeReason;
    default:
      return RevokeReason.DISABLE_SINGLE_NETWORK;
  }
}

export const RevokeDelegationPage = () => {
  const location = useLocation();
  const navigate = useRainbowNavigate();
  const storeAddress = useDelegationAddress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revokeStatus, setRevokeStatus] = useState<RevokeStatus>('ready');
  const [sending, setSending] = useState(false);
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const selectedGas = useGasStore((state) => state.selectedGas);
  const clearCustomGasModified = useGasStore(
    (state) => state.clearCustomGasModified,
  );

  const locationState = location.state as RevokeDelegationLocationState | null;
  const revokeAddress = locationState?.address ?? storeAddress;

  const delegationsToRevoke = useMemo(
    () => locationState?.delegationsToRevoke ?? [],
    [locationState],
  );
  const revokeReason = resolveRevokeReason(locationState?.revokeReason);
  const isSecurityAlert = [
    RevokeReason.ALERT_VULNERABILITY,
    RevokeReason.ALERT_BUG,
    RevokeReason.ALERT_UNRECOGNIZED,
    RevokeReason.ALERT_UNSPECIFIED,
  ].includes(revokeReason);
  const { title: revokeTitleKey, subtitle: revokeSubtitleKey } =
    REVOKE_REASON_I18N_KEYS[revokeReason] ??
    REVOKE_REASON_I18N_KEYS[RevokeReason.DISABLE_SINGLE_NETWORK];

  const currentDelegation = delegationsToRevoke[currentIndex];
  const isLastDelegation = currentIndex === delegationsToRevoke.length - 1;

  useEffect(() => {
    if (delegationsToRevoke.length === 0) {
      const backTo = locationState?.backTo ?? ROUTES.SETTINGS__DELEGATIONS;
      navigate(backTo, {
        replace: true,
        state: locationState?.address
          ? { address: locationState.address }
          : undefined,
      });
      return;
    }
    const initialIndex = locationState?.initialIndex ?? 0;
    setCurrentIndex(initialIndex);
    setRevokeStatus('ready');
    setSending(false);
    setWaitingForDevice(false);
    clearCustomGasModified();
  }, [
    clearCustomGasModified,
    delegationsToRevoke.length,
    locationState,
    navigate,
  ]);

  // Track start event
  useEffect(() => {
    if (currentDelegation) {
      analytics.track(event.delegationRevokeStarted, {
        chainId: currentDelegation.chainId,
        contractAddress: currentDelegation.address,
        totalDelegations: delegationsToRevoke.length,
      });
    }
  }, [currentDelegation, delegationsToRevoke.length]);

  const handleRevoke = useCallback(async () => {
    if (!currentDelegation || !revokeAddress) return;

    setSending(true);
    setRevokeStatus('revoking');

    try {
      const { type } = await getWallet(revokeAddress);
      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
      }

      // Build gas params
      const gasParams = selectedGas.transactionGasParams;
      if (!isEip1559GasParams(gasParams)) {
        throw new Error('Revoke requires EIP-1559 gas params');
      }

      const result = await popupClient.wallet.revokeDelegation({
        chainId: currentDelegation.chainId,
        userAddress: revokeAddress,
        transactionOptions: {
          maxFeePerGas: toHex(gasParams.maxFeePerGas),
          maxPriorityFeePerGas: toHex(gasParams.maxPriorityFeePerGas),
          gasLimit: null,
        },
      });

      if (result.error) {
        logger.error(
          new RainbowError('delegation: error revoking delegation'),
          {
            message: result.error,
            chainId: currentDelegation.chainId,
            contractAddress: currentDelegation.address,
          },
        );

        analytics.track(event.delegationRevokeFailed, {
          chainId: currentDelegation.chainId,
          contractAddress: currentDelegation.address,
          error: result.error,
        });

        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: result.error,
        });

        setRevokeStatus('failed');
        return;
      }

      if (result.txHash) {
        if (result.nonce === undefined) {
          throw new Error('Revoke transaction returned no nonce');
        }

        const transaction: NewTransaction = {
          changes: [],
          data: '0x',
          value: '0',
          from: revokeAddress,
          to: currentDelegation.address ?? revokeAddress,
          hash: result.txHash,
          chainId: currentDelegation.chainId,
          status: 'pending',
          type: 'revoke_delegation',
          nonce: result.nonce,
          maxFeePerGas: gasParams.maxFeePerGas,
          maxPriorityFeePerGas: gasParams.maxPriorityFeePerGas,
        };

        await addNewTransaction({
          address: revokeAddress,
          chainId: currentDelegation.chainId,
          transaction,
        });

        analytics.track(event.delegationRevokeSubmitted, {
          chainId: currentDelegation.chainId,
          contractAddress: currentDelegation.address,
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
          // If disabling smart wallet, navigate to confirm disable page
          if (locationState?.isDisabling) {
            navigate(ROUTES.SETTINGS__DELEGATIONS__CONFIRM_DISABLE, {
              replace: true,
              state: { address: revokeAddress },
            });
          } else {
            const backTo =
              locationState?.backTo || ROUTES.SETTINGS__DELEGATIONS;
            navigate(backTo, {
              replace: true,
              state: { address: revokeAddress },
            });
          }
        } else {
          const nextIndex = currentIndex + 1;
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
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const parsedError =
        error instanceof Error ? error : new Error(errorMessage);

      if (!isLedgerConnectionError(parsedError)) {
        const extractedError = errorMessage.split('[')[0] || 'Unknown error';
        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: extractedError,
        });
      }

      logger.error(new RainbowError('delegation: error executing revoke'), {
        message: errorMessage,
        chainId: currentDelegation.chainId,
        contractAddress: currentDelegation.address,
      });

      analytics.track(event.delegationRevokeFailed, {
        chainId: currentDelegation.chainId,
        contractAddress: currentDelegation.address,
        error: errorMessage,
      });

      setRevokeStatus('failed');
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
    locationState,
  ]);

  const handleButtonClick = useCallback(async () => {
    if (revokeStatus === 'ready' || revokeStatus === 'failed') {
      handleRevoke();
    }
    // No need to handle 'success' state - navigation happens automatically in handleRevoke
  }, [revokeStatus, handleRevoke]);

  const handleCancel = useCallback(() => {
    // If there are more delegations, proceed to the next one
    if (!isLastDelegation) {
      const nextIndex = currentIndex + 1;
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
      return;
    }

    // If it's the last delegation and we're disabling, navigate to confirm disable page
    if (locationState?.isDisabling) {
      navigate(ROUTES.SETTINGS__DELEGATIONS__CONFIRM_DISABLE, {
        replace: true,
        state: { address: revokeAddress },
      });
      return;
    }

    // Navigate back to delegations list
    const backTo = locationState?.backTo || ROUTES.SETTINGS__DELEGATIONS;
    navigate(backTo, { replace: true, state: { address: revokeAddress } });
  }, [
    navigate,
    locationState,
    isLastDelegation,
    currentIndex,
    delegationsToRevoke,
    revokeAddress,
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
      case 'revoking':
        return i18n.t('delegations.revoke.revoking');
      case 'failed':
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
        title={i18n.t(revokeTitleKey)}
        titleTestId="revoke-delegation-title"
        leftComponent={<Navbar.BackButton onClick={handleCancel} />}
      />

      <Box
        paddingHorizontal="20px"
        paddingTop="40px"
        paddingBottom="20px"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
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
            {i18n.t(revokeSubtitleKey)}
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

              {/* Contract address - hide when we used user address as fallback */}
              {currentDelegation.address &&
                revokeAddress &&
                currentDelegation.address.toLowerCase() !==
                  revokeAddress.toLowerCase() && (
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
                      {truncateAddress(currentDelegation.address)}
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
                disabled={sending || revokeStatus === 'revoking'}
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
