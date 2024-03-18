import { formatEther, formatUnits } from '@ethersproject/units';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { useApprovals } from '~/core/resources/approvals/approvals';
import { useTransaction } from '~/core/resources/transactions/transaction';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { RainbowTransaction, TxHash } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { getChain } from '~/core/utils/chains';
import { copy } from '~/core/utils/copy';
import { formatDate } from '~/core/utils/formatDate';
import { formatCurrency, formatNumber } from '~/core/utils/formatNumber';
import { isLowerCaseMatch, truncateString } from '~/core/utils/strings';
import {
  getAdditionalDetails,
  getTransactionBlockExplorer,
} from '~/core/utils/transactions';
import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { AddressDisplay } from '~/entries/popup/components/AddressDisplay';
import { AssetContextMenu } from '~/entries/popup/components/AssetContextMenu';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  CoinIcon,
  ContractIcon,
} from '~/entries/popup/components/CoinIcon/CoinIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { useRainbowChains } from '~/entries/popup/hooks/useRainbowChains';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { SpeedUpAndCancelSheet } from '../../speedUpAndCancelSheet';
import { triggerRevokeApproval } from '../Approvals/utils';
import { CopyableValue, InfoRow } from '../TokenDetails/About';

import { ActivityPill } from './ActivityPill';

function ToFrom({ transaction }: { transaction: RainbowTransaction }) {
  const { from, to, contract, direction } = transaction;
  const isFromAContract = !!contract && direction === 'in';
  const isToAContract = !!contract && direction === 'out';

  return (
    <Stack space="24px">
      <InfoRow
        symbol="arrow.down.circle"
        label={i18n.t('activity_details.from')}
        value={
          <AddressDisplay
            address={from}
            contract={isFromAContract ? contract : undefined}
          />
        }
      />
      {to && (
        <InfoRow
          symbol="paperplane.fill"
          label={i18n.t('activity_details.to')}
          value={
            <AddressDisplay
              address={to}
              contract={isToAContract ? contract : undefined}
            />
          }
        />
      )}
    </Stack>
  );
}

function ConfirmationData({
  transaction,
}: {
  transaction: RainbowTransaction;
}) {
  const isMined = transaction.status !== 'pending';

  return (
    <Stack space="24px">
      <InfoRow
        symbol="number"
        label="TxHash"
        value={
          <CopyableValue
            title={i18n.t('activity_details.hash_copied')}
            value={transaction.hash}
          >
            {truncateString(transaction.hash, 18)}
          </CopyableValue>
        }
      />
      {isMined && (
        <>
          <InfoRow
            symbol="clock.badge.checkmark"
            label={i18n.t('activity_details.confirmed_at')}
            value={formatDate(transaction.minedAt * 1000)}
          />
          <InfoRow
            symbol="number.square"
            label={i18n.t('activity_details.block')}
            value={
              <Inline alignVertical="center" space="4px">
                {transaction.blockNumber}
                {transaction.confirmations && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                  >
                    <Text size="12pt" weight="semibold" color="labelQuaternary">
                      {formatNumber(transaction.confirmations, {
                        notation: 'compact',
                      })}{' '}
                      {i18n.t('activity_details.confirmations')}
                    </Text>
                  </motion.div>
                )}
              </Inline>
            }
          />
        </>
      )}
    </Stack>
  );
}

const InfoValueSkeleton = () => <Skeleton width="50px" height="12px" />;

function FeeData({ transaction: tx }: { transaction: RainbowTransaction }) {
  const { native, feeType } = tx;

  const maxPriorityFeePerGas =
    tx.maxPriorityFeePerGas && formatUnits(tx.maxPriorityFeePerGas, 'gwei');
  const maxFeePerGas = tx.maxFeePerGas && formatUnits(tx.maxFeePerGas, 'gwei');
  const baseFee = tx.baseFee && formatUnits(tx.baseFee, 'gwei');

  const gasPrice = tx.gasPrice && formatUnits(tx.gasPrice, 'gwei');

  return (
    <>
      {native?.fee && (
        <InfoRow
          symbol="fuelpump.fill"
          label={i18n.t('activity_details.fee')}
          value={formatCurrency(native.fee)}
        />
      )}
      {feeType === 'legacy' ? (
        <>
          {gasPrice && (
            <InfoRow
              symbol="barometer"
              label={i18n.t('activity_details.gas_price')}
              value={`${formatNumber(gasPrice)} Gwei`}
            />
          )}
        </>
      ) : (
        <>
          <InfoRow
            symbol="barometer"
            label={i18n.t('activity_details.base_fee')}
            value={
              baseFee ? `${formatNumber(baseFee)} Gwei` : <InfoValueSkeleton />
            }
          />
          <InfoRow
            symbol="barometer"
            label={i18n.t('activity_details.max_base_fee')}
            value={
              maxFeePerGas ? (
                `${formatNumber(maxFeePerGas)} Gwei`
              ) : (
                <InfoValueSkeleton />
              )
            }
          />
          <InfoRow
            symbol="barometer"
            label={i18n.t('activity_details.max_priority_fee')}
            value={
              maxPriorityFeePerGas ? (
                `${formatNumber(maxPriorityFeePerGas)} Gwei`
              ) : (
                <InfoValueSkeleton />
              )
            }
          />
        </>
      )}
    </>
  );
}

function NetworkData({ transaction: tx }: { transaction: RainbowTransaction }) {
  const { nonce, native, value } = tx;
  const { rainbowChains } = useRainbowChains();
  const chain = getChain({ chainId: tx.chainId });

  return (
    <Stack space="24px">
      {native?.value && +native?.value > 0 && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.value')}
          value={formatCurrency(native.value)}
        />
      )}
      {!(native?.value && +native?.value) && value && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.value')}
          value={`${formatEther(+value)} ${chain.nativeCurrency.symbol}`}
        />
      )}
      <InfoRow
        symbol="point.3.filled.connected.trianglepath.dotted"
        label={i18n.t('activity_details.network')}
        value={
          <Inline alignVertical="center" space="4px">
            <ChainBadge chainId={tx.chainId} size={12} />
            {ChainNameDisplay[tx.chainId] ||
              rainbowChains.find((chain) => chain.id === tx.chainId)?.name}
          </Inline>
        }
      />
      {tx.status != 'pending' && <FeeData transaction={tx} />}
      {nonce >= 0 && (
        <InfoRow
          symbol="number"
          label={i18n.t('activity_details.nonce')}
          value={nonce}
        />
      )}
    </Stack>
  );
}

const SpeedUpOrCancel = ({
  transaction,
}: {
  transaction: RainbowTransaction;
}) => {
  const { sheet, setCurrentHomeSheet } = useCurrentHomeSheetStore();
  const navigate = useRainbowNavigate();

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <Button
        onClick={() => setCurrentHomeSheet('speedUp')}
        symbol="bolt.fill"
        height="32px"
        width="full"
        variant="plain"
        color="blue"
      >
        {i18n.t('speed_up_and_cancel.speed_up')}
      </Button>
      <Button
        onClick={() => setCurrentHomeSheet('cancel')}
        symbol="trash.fill"
        height="32px"
        width="full"
        variant="plain"
        color="fillSecondary"
      >
        {i18n.t('speed_up_and_cancel.cancel')}
      </Button>
      {sheet !== 'none' && (
        <SpeedUpAndCancelSheet
          currentSheet={sheet}
          transaction={transaction}
          onClose={() => {
            setCurrentHomeSheet('none');
            navigate(ROUTES.HOME);
            console.log('naviogating to homeee');
          }}
        />
      )}
    </Box>
  );
};

type TxAdditionalDetails = ReturnType<typeof getAdditionalDetails>;

const AdditionalDetails = ({ details }: { details: TxAdditionalDetails }) => {
  const {
    asset,
    tokenAmount,
    tokenContract,
    exchangeRate,
    collection,
    standard,
    approval,
    contract,
  } = details || {};

  return (
    <Stack space="24px">
      {exchangeRate && (
        <InfoRow
          symbol="arrow.2.squarepath"
          label={i18n.t('activity_details.exchange_rate')}
          value={exchangeRate}
        />
      )}
      {contract?.name && (
        <InfoRow
          symbol="app.badge.checkmark"
          label={i18n.t('activity_details.app')}
          value={
            <Inline alignVertical="center" space="4px">
              {contract.iconUrl && (
                <ContractIcon size={16} iconUrl={contract.iconUrl} />
              )}
              {contract.name}
            </Inline>
          }
        />
      )}
      {tokenAmount && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.token')}
          value={
            <AssetContextMenu asset={asset}>
              <Inline alignVertical="center" space="4px">
                <CoinIcon asset={asset} badge={false} size={16} />
                {tokenAmount}
              </Inline>
            </AssetContextMenu>
          }
        />
      )}
      {approval && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.allowance')}
          value={
            approval.value === 'UNLIMITED' ? (
              <Inline alignVertical="center" space="4px">
                <Text color="orange" size="12pt" weight="semibold">
                  {i18n.t('activity_details.unlimited_allowance', {
                    symbol: asset?.symbol,
                  })}
                </Text>
                <Symbol
                  weight="semibold"
                  symbol="exclamationmark.triangle"
                  size={12}
                  color="orange"
                />
              </Inline>
            ) : (
              approval.label
            )
          }
        />
      )}
      {collection && (
        <InfoRow
          symbol="square.grid.2x2"
          label={i18n.t('activity_details.collection')}
          value={collection}
        />
      )}
      {tokenContract && (
        <InfoRow
          symbol="doc.plaintext"
          label={i18n.t('activity_details.token_contract')}
          value={
            <CopyableValue
              title={i18n.t('wallet_header.copy_toast')}
              value={tokenContract}
            >
              {truncateAddress(tokenContract)}
            </CopyableValue>
          }
        />
      )}
      {standard && (
        <InfoRow
          symbol="info.circle"
          label={i18n.t('activity_details.token_standard')}
          value={standard.toUpperCase()}
        />
      )}
    </Stack>
  );
};

function MoreOptions({
  transaction,
  revoke,
  onRevoke,
}: {
  transaction: RainbowTransaction;
  revoke?: boolean;
  onRevoke: () => void;
}) {
  const explorer = getTransactionBlockExplorer(transaction);
  const hash = transaction.hash;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <ButtonSymbol
            symbol="ellipsis"
            height="32px"
            variant="transparentHover"
            color="labelSecondary"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          symbolLeft="doc.on.doc.fill"
          onSelect={() =>
            copy({
              value: hash,
              title: i18n.t('activity_details.hash_copied'),
              description: truncateString(hash, 18),
            })
          }
        >
          <Text size="14pt" weight="semibold">
            {i18n.t('activity_details.copy_hash')}
          </Text>
          <TextOverflow size="11pt" color="labelTertiary" weight="medium">
            {hash}
          </TextOverflow>
        </DropdownMenuItem>
        {explorer && (
          <>
            <DropdownMenuItem
              symbolLeft="doc.on.doc.fill"
              onSelect={() => {
                copy({
                  title: i18n.t('activity_details.explorer_copied'),
                  description: truncateString(explorer.url, 18),
                  value: explorer.url,
                });
              }}
            >
              <Text size="14pt" weight="semibold">
                {i18n.t('activity_details.copy_explorer_url')}
              </Text>
              <TextOverflow size="11pt" color="labelTertiary" weight="medium">
                {explorer.url}
              </TextOverflow>
            </DropdownMenuItem>

            <Box paddingVertical="4px">
              <Separator color="separatorSecondary" />
            </Box>
            <DropdownMenuItem
              symbolLeft="binoculars.fill"
              external
              onSelect={() => window.open(explorer.url, '_blank')}
            >
              {i18n.t('token_details.view_on', { explorer: explorer.name })}
            </DropdownMenuItem>
            {revoke ? (
              <DropdownMenuItem
                color="red"
                symbolLeft="xmark.circle.fill"
                onSelect={onRevoke}
              >
                {i18n.t('activity_details.revoke_approval')}
              </DropdownMenuItem>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ActivityDetails() {
  const { currentCurrency } = useCurrentCurrencyStore();
  const { currentAddress } = useCurrentAddressStore();
  const { hash, chainId } = useParams<{ hash: TxHash; chainId: string }>();
  const { isWatchingWallet } = useWallets();

  const { data: transaction, isLoading } = useTransaction({
    hash,
    chainId: Number(chainId),
  });
  const navigate = useRainbowNavigate();

  const { data: approvals } = useApprovals(
    {
      address: currentAddress,
      chainIds: [Number(chainId) as ChainId],
      currency: currentCurrency,
    },
    {
      enabled:
        isLowerCaseMatch(transaction?.from || '', currentAddress) &&
        transaction?.type === 'approve' &&
        !!Number(chainId),
    },
  );

  const approvalToRevoke = useMemo(() => {
    const approvalToRevoke =
      approvals
        ?.map((approval) =>
          approval.spenders.map((spender) => ({
            approval,
            spender,
          })),
        )
        .flat()
        .filter((a) => a.spender.tx_hash === (transaction?.hash || ''))?.[0] ||
      null;
    return approvalToRevoke;
  }, [approvals, transaction?.hash]);

  const additionalDetails = useMemo(
    () => (transaction ? getAdditionalDetails(transaction) : null),
    [transaction],
  );

  const backToHome = () =>
    navigate(ROUTES.HOME, {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });

  const onRevoke = () => {
    triggerRevokeApproval({ show: true, approval: approvalToRevoke });
  };

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show={!!transaction}>
      {!isLoading && !!transaction && (
        <>
          <Navbar
            leftComponent={
              <Navbar.CloseButton onClick={backToHome} withinModal />
            }
            titleComponent={<ActivityPill transaction={transaction} />}
            rightComponent={
              <MoreOptions
                transaction={transaction}
                revoke={!!approvalToRevoke && !isWatchingWallet}
                onRevoke={onRevoke}
              />
            }
          />
          <Separator color="separatorTertiary" />

          <Stack
            separator={<Separator color="separatorTertiary" />}
            padding="20px"
            gap="20px"
          >
            <ToFrom transaction={transaction} />
            {additionalDetails && (
              <AdditionalDetails details={additionalDetails} />
            )}
            <ConfirmationData transaction={transaction} />
            <NetworkData transaction={transaction} />
            {transaction.status === 'pending' && (
              <SpeedUpOrCancel transaction={transaction} />
            )}
          </Stack>
        </>
      )}
    </BottomSheet>
  );
}
