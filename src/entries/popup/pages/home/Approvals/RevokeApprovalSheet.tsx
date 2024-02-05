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
import { truncateAddress } from '~/core/utils/address';
import { parseUserAsset } from '~/core/utils/assets';
import { getChain } from '~/core/utils/chains';
import { convertRawAmountToDecimalFormat } from '~/core/utils/numbers';
import { addNewTransaction } from '~/core/utils/transactions';
import {
  AccentColorProvider,
  Box,
  Button,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { AddressMoreOptions } from '~/entries/popup/components/AddressDisplay';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { ApprovalFee } from '~/entries/popup/components/TransactionFee/TransactionFee';
import { isLedgerConnectionError } from '~/entries/popup/handlers/ledger';
import { getWallet, sendTransaction } from '~/entries/popup/handlers/wallet';
import usePrevious from '~/entries/popup/hooks/usePrevious';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';
import { RainbowError, logger } from '~/logger';

import { Spinner } from '../../../components/Spinner/Spinner';
import playSound from '../../../utils/playSound';
import { ReviewDetailsRow } from '../../swap/SwapReviewSheet/SwapReviewSheet';

export const RevokeApprovalSheet = ({
  show,
  approval,
  spender,
  onCancel,
}: {
  show: boolean;
  approval?: Approval | null;
  spender?: ApprovalSpender | null;
  onCancel: () => void;
}) => {
  console.log('in rvoke approval sheet', show, approval, spender);
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
    <BottomSheet
      show={show}
      onClickOutside={onCancel}
      zIndex={zIndexes.REVOKE_APPROVAL_SHEET}
    >
      <Box
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        paddingBottom="20px"
      >
        <Stack space="20px">
          <Navbar
            title={i18n.t(`approvals.revoke.title`)}
            titleTestId="swap-review-title-text"
            leftComponent={
              <Navbar.CloseButton testId="swap-review" onClick={onCancel} />
            }
          />

          <Box paddingHorizontal="20px">
            <ReviewDetailsRow testId="revoke-allowance">
              <Inline
                alignHorizontal="left"
                space="12px"
                alignVertical="center"
              >
                <Symbol
                  weight="semibold"
                  size={16}
                  symbol="dollarsign.circle"
                  color="labelTertiary"
                />
                <Text weight="semibold" size="12pt" color="labelTertiary">
                  {i18n.t('approvals.revoke.allowance')}
                </Text>
              </Inline>

              <Inline space="6px" alignVertical="center">
                {approval?.asset && (
                  <CoinIcon
                    size={14}
                    asset={parseUserAsset({
                      asset: approval?.asset,
                      currency: currentCurrency,
                      balance: '0',
                    })}
                    badge={false}
                  />
                )}
                <Inline space="4px" alignVertical="center">
                  <Box style={{ maxWidth: 150 }}>
                    <TextOverflow
                      weight="semibold"
                      size="12pt"
                      color="labelSecondary"
                    >
                      {spender?.quantity_allowed.toLowerCase() === 'unlimited'
                        ? spender?.quantity_allowed
                        : convertRawAmountToDecimalFormat(
                            spender?.quantity_allowed || '0',
                            approval?.asset.decimals,
                          )}
                    </TextOverflow>
                  </Box>

                  <TextOverflow
                    weight="semibold"
                    size="12pt"
                    color="labelSecondary"
                  >
                    {approval?.asset.symbol}
                  </TextOverflow>
                </Inline>
              </Inline>
            </ReviewDetailsRow>

            <ReviewDetailsRow testId="revoke-spender">
              <Inline
                alignHorizontal="left"
                space="12px"
                alignVertical="center"
              >
                <Symbol
                  weight="semibold"
                  size={16}
                  symbol="doc.plaintext"
                  color="labelTertiary"
                />
                <Text weight="semibold" size="12pt" color="labelTertiary">
                  {i18n.t('approvals.revoke.spender')}
                </Text>
              </Inline>

              <Inline space="4px" alignVertical="center">
                <TextOverflow
                  weight="semibold"
                  size="12pt"
                  color="labelSecondary"
                >
                  {spender?.contract_name ||
                    truncateAddress(
                      (spender?.contract_address || '') as Address,
                    )}
                </TextOverflow>

                {spender?.contract_address && (
                  <AddressMoreOptions
                    address={spender?.contract_address || ''}
                    chainId={approval?.chain_id}
                  />
                )}
              </Inline>
            </ReviewDetailsRow>

            <ReviewDetailsRow testId="revoke-spender">
              <Inline
                alignHorizontal="left"
                space="12px"
                alignVertical="center"
              >
                <Symbol
                  weight="semibold"
                  size={16}
                  symbol="network"
                  color="labelTertiary"
                />
                <Text weight="semibold" size="12pt" color="labelTertiary">
                  {i18n.t('approvals.revoke.chain')}
                </Text>
              </Inline>

              <Inline space="4px" alignVertical="center">
                <ChainBadge
                  size={14}
                  chainId={approval?.chain_id || ChainId.mainnet}
                />
                <TextOverflow
                  weight="semibold"
                  size="12pt"
                  color="labelSecondary"
                >
                  {
                    getChain({ chainId: approval?.chain_id || ChainId.mainnet })
                      .name
                  }
                </TextOverflow>
              </Inline>
            </ReviewDetailsRow>
          </Box>
        </Stack>
      </Box>

      <Separator color="separatorSecondary" />

      <AccentColorProvider
        color={
          approval?.asset.colors?.primary || approval?.asset.colors?.fallback
        }
      >
        <Stack space="20px" padding="20px">
          <Box>
            <ApprovalFee
              chainId={approvalChainId}
              address={currentAddress}
              spenderAddress={spenderAddress}
              assetAddress={assetAddress}
              assetType={assetType}
              transactionRequest={
                revokeApproveTransactionRequest || transactionRequestForGas
              }
              accentColor={
                approval?.asset.colors?.primary ||
                approval?.asset.colors?.fallback
              }
              flashbotsEnabled={flashbotsEnabledGlobally}
            />
          </Box>

          <Inline space="12px" wrap={false}>
            <Button
              color="separatorSecondary"
              height="44px"
              variant={'flat'}
              width="full"
              onClick={onCancel}
              tabIndex={0}
            >
              <Text weight="bold" size="16pt" color="label">
                {i18n.t('approvals.revoke.cancel')}
              </Text>
            </Button>
            <Button
              color={'accent'}
              height="44px"
              variant={'flat'}
              width="full"
              onClick={handleRevoke}
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
                  <Text weight="bold" size="16pt" color="label">
                    {waitingForDevice
                      ? `👀 ${i18n.t('send.review.confirm_hw')}`
                      : i18n.t('approvals.revoke.action')}
                  </Text>
                )}
              </Box>
            </Button>
          </Inline>
        </Stack>
      </AccentColorProvider>
    </BottomSheet>
  );
};
