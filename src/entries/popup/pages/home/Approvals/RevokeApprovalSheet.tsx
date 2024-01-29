import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useQuery } from '@tanstack/react-query';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { populateRevokeApproval } from '~/core/raps/actions/unlock';
import {
  Approval,
  ApprovalSpender,
} from '~/core/resources/approvals/approvals';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  useFlashbotsEnabledStore,
  useGasStore,
} from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { parseUserAsset } from '~/core/utils/assets';
import { addNewTransaction } from '~/core/utils/transactions';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { ApprovalFee } from '~/entries/popup/components/TransactionFee/TransactionFee';
import { isLedgerConnectionError } from '~/entries/popup/handlers/ledger';
import { getWallet, sendTransaction } from '~/entries/popup/handlers/wallet';
import usePrevious from '~/entries/popup/hooks/usePrevious';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';
import { RainbowError, logger } from '~/logger';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { Spinner } from '../../../components/Spinner/Spinner';
import { WalletAvatar } from '../../../components/WalletAvatar/WalletAvatar';
import { useWalletInfo } from '../../../hooks/useWalletInfo';
import playSound from '../../../utils/playSound';

export const RevokeApprovalSheet = ({
  show,
  approval,
  spender,
  onCancel,
}: {
  show: boolean;
  approval: Approval | null;
  spender: ApprovalSpender | null;
  onCancel: () => void;
}) => {
  const { currentAddress } = useCurrentAddressStore();
  const [sending, setSending] = useState(false);
  const confirmSendButtonRef = useRef<HTMLButtonElement>(null);
  const { flashbotsEnabled } = useFlashbotsEnabledStore();
  const previousShow = usePrevious(show);
  const flashbotsEnabledGlobally =
    config.flashbots_enabled &&
    flashbotsEnabled &&
    approval?.chain_id === ChainId.mainnet;

  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const { clearCustomGasModified, selectedGas } = useGasStore();
  const navigate = useRainbowNavigate();
  const { currentCurrency } = useCurrentCurrencyStore();

  const { approvalChainId, assetAddress, spenderAddress, assetType } =
    useMemo(() => {
      const assetType: 'erc20' | 'erc721' =
        approval?.asset.type === 'nft' ? 'erc721' : 'erc20';
      const approvalChainId = approval?.chain_id as ChainId;
      return {
        approvalChainId,
        assetAddress: approval?.asset.asset_code as Address,
        spenderAddress: spender?.contract_address,
        assetType,
      };
    }, [
      approval?.asset.asset_code,
      approval?.asset.type,
      approval?.chain_id,
      spender?.contract_address,
    ]);

  const { displayName: walletDisplayName } = useWalletInfo({
    address: currentAddress,
  });

  const transactionRequestForGas: TransactionRequest = useMemo(() => {
    return {
      to: currentAddress,
      from: currentAddress,
      value: '0x0',
      chainId: approval?.chain_id || ChainId.mainnet,
      data: '0x',
    };
  }, [currentAddress, approval?.chain_id]);

  const { data: revokeApproveTransaction } = useQuery(
    ['populateRevokeApproval', assetAddress, spenderAddress, approvalChainId],
    async () =>
      await populateRevokeApproval({
        tokenAddress: assetAddress,
        spenderAddress: spenderAddress,
        chainId: approvalChainId,
        type: assetType,
      }),
    {
      enabled: !!approval && !!spender,
    },
  );

  const revokeApproveTransactionRequest: TransactionRequest | null =
    useMemo(() => {
      return {
        to: assetAddress,
        from: currentAddress,
        chainId: approvalChainId,
        data: revokeApproveTransaction?.data || '0x',
      };
    }, [
      approvalChainId,
      assetAddress,
      currentAddress,
      revokeApproveTransaction?.data,
    ]);

  const handleRevoke = useCallback(async () => {
    if (!config.send_enabled || !approval?.asset) return;
    setSending(true);
    try {
      const { type } = await getWallet(currentAddress);
      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
      }
      const result = await sendTransaction({
        from: currentAddress,
        to: assetAddress,
        value: '0x0',
        chainId: approvalChainId,
        data: revokeApproveTransaction?.data || '0x',
      });
      if (result) {
        const transaction: NewTransaction = {
          changes: [
            {
              direction: 'out',
              asset: parseUserAsset({
                asset: approval.asset,
                currency: currentCurrency,
                balance: '0',
              }),
            },
          ],
          data: result.data,
          flashbots: flashbotsEnabledGlobally,
          value: result.value.toString(),
          from: currentAddress,
          to: assetAddress,
          hash: result.hash as TxHash,
          chainId: approvalChainId,
          status: 'pending',
          type: 'revoke',
          nonce: result.nonce,
          gasPrice: (
            selectedGas.transactionGasParams as TransactionLegacyGasParams
          )?.gasPrice,
          maxFeePerGas: (
            selectedGas.transactionGasParams as TransactionGasParams
          )?.maxFeePerGas,
          maxPriorityFeePerGas: (
            selectedGas.transactionGasParams as TransactionGasParams
          )?.maxPriorityFeePerGas,
        };
        await addNewTransaction({
          address: currentAddress,
          chainId: approvalChainId,
          transaction,
        });
        playSound('SendSound');
        navigate(ROUTES.HOME, {
          state: { tab: 'activity' },
        });
        analytics.track(event.revokeSubmitted, {
          assetSymbol: approval?.asset?.symbol,
          assetName: approval?.asset?.name,
          assetAddress: assetAddress,
          chainId: approvalChainId,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (!isLedgerConnectionError(e)) {
        const extractedError = (e as Error).message.split('[')[0];
        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: extractedError,
        });
      }
      logger.error(new RainbowError('send: error executing revoke approval'), {
        message: (e as Error)?.message,
      });
    } finally {
      setWaitingForDevice(false);
      setSending(false);
    }
  }, [
    approval?.asset,
    currentAddress,
    assetAddress,
    approvalChainId,
    revokeApproveTransaction?.data,
    currentCurrency,
    flashbotsEnabledGlobally,
    selectedGas.transactionGasParams,
    navigate,
  ]);

  useEffect(() => {
    if (previousShow && !show) {
      clearCustomGasModified();
    }
  }, [clearCustomGasModified, previousShow, show]);

  return (
    <BottomSheet show={show} onClickOutside={onCancel}>
      <Box
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        background="surfacePrimaryElevatedSecondary"
      >
        <Stack space="20px">
          <Box paddingVertical="26px">
            <Inline alignHorizontal="center" alignVertical="center">
              <Text size="14pt" weight="heavy" color="label">
                {i18n.t('approvals.revoke.title')}
              </Text>
            </Inline>
          </Box>
          <Box paddingHorizontal="24px" paddingVertical="20px">
            <Stack space="20px">
              <Rows space="10px">
                <Row>
                  <Columns alignHorizontal="justify">
                    <Column>
                      <Box paddingVertical="6px" height="full">
                        <Rows space="10px" alignVertical="center">
                          <Row>
                            <TextOverflow
                              size="20pt"
                              weight="bold"
                              color="label"
                            >
                              {'Revoke'}
                            </TextOverflow>
                          </Row>
                        </Rows>
                      </Box>
                    </Column>
                    <Column>
                      <Inline alignVertical="center" alignHorizontal="right">
                        <Box>
                          {approval?.asset ? (
                            <CoinIcon
                              asset={parseUserAsset({
                                asset: approval.asset,
                                currency: currentCurrency,
                                balance: '0',
                              })}
                              size={44}
                            />
                          ) : null}
                        </Box>
                      </Inline>
                    </Column>
                  </Columns>
                </Row>
                <Row>
                  <Columns alignHorizontal="justify">
                    <Column>
                      <Box paddingVertical="6px" height="full">
                        <TextOverflow size="14pt" weight="bold" color="label">
                          {spender?.quantity_allowed}
                        </TextOverflow>
                      </Box>
                    </Column>
                    <Column>
                      <Box>
                        <TextOverflow size="14pt" weight="bold" color="label">
                          {spender?.contract_name}
                        </TextOverflow>
                      </Box>
                    </Column>
                  </Columns>
                </Row>
                <Row>
                  <Columns alignHorizontal="justify">
                    <Column width="4/5">
                      <Box paddingVertical="6px" height="full">
                        <TextOverflow size="14pt" weight="bold" color="label">
                          {walletDisplayName}
                        </TextOverflow>
                      </Box>
                    </Column>
                    <Column>
                      <Inline alignHorizontal="right">
                        <WalletAvatar
                          addressOrName={currentAddress}
                          size={44}
                        />
                      </Inline>
                    </Column>
                  </Columns>
                </Row>
              </Rows>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Separator color="separatorSecondary" />

      <Box padding="20px">
        <ApprovalFee
          chainId={approvalChainId}
          address={currentAddress}
          spenderAddress={spenderAddress}
          assetAddress={assetAddress}
          assetType={assetType}
          transactionRequest={
            revokeApproveTransactionRequest || transactionRequestForGas
          }
          plainTriggerBorder
          flashbotsEnabled={flashbotsEnabledGlobally}
        />
      </Box>

      <Box width="full" padding="20px">
        <Rows space="8px" alignVertical="center">
          <Row>
            <Button
              color={'accent'}
              height="44px"
              variant={'flat'}
              width="full"
              onClick={handleRevoke}
              testId="review-confirm-button"
              tabIndex={0}
              ref={confirmSendButtonRef}
              disabled={sending}
            >
              <Box>
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
                      ? `👀 ${i18n.t('send.review.confirm_hw')}`
                      : i18n.t('approvals.revoke.action', {
                          tokenSymbol: approval?.asset.symbol,
                        })}
                  </TextOverflow>
                )}
              </Box>
            </Button>
          </Row>
          <Row>
            <Inline alignHorizontal="center">
              <Button
                color="transparent"
                height="44px"
                variant="tinted"
                onClick={onCancel}
                tabIndex={0}
                width="full"
              >
                <Text weight="bold" size="16pt" color="labelSecondary">
                  {i18n.t('send.review.cancel')}
                </Text>
              </Button>
            </Inline>
          </Row>
        </Rows>
      </Box>
    </BottomSheet>
  );
};
