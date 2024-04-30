import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { useApprovals } from '~/core/resources/approvals/approvals';
import { useTransaction } from '~/core/resources/transactions/transaction';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import {
  PendingTransaction,
  RainbowTransaction,
  TxHash,
} from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { findRainbowChainForChainId } from '~/core/utils/chains';
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
import { ExplainerSheet } from '~/entries/popup/components/ExplainerSheet/ExplainerSheet';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { SheetMode, SpeedUpAndCancelSheet } from '../../speedUpAndCancelSheet';
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

const formatFee = (transaction: RainbowTransaction) => {
  if (
    transaction.native !== undefined &&
    transaction.native.fee !== undefined
  ) {
    // if the fee is less than $0.01, the provider returns 0 so we display it as <$0.01
    const feeInNative =
      +transaction.native.fee <= 0.01 ? 0.01 : transaction.native.fee;
    return `${+feeInNative <= 0.01 ? '<' : ''}${formatCurrency(feeInNative)}`;
  }

  const nativeCurrencySymbol = findRainbowChainForChainId(transaction.chainId)
    ?.nativeCurrency.symbol;

  if (!transaction.fee || !nativeCurrencySymbol) return;

  return `${formatNumber(transaction.fee)} ${nativeCurrencySymbol}`;
};
function FeeData({ transaction: tx }: { transaction: RainbowTransaction }) {
  const { feeType } = tx;

  // if baseFee is undefined (like in pending txs or custom networks the api wont have data about it)
  // so we try to calculate with the data we may have locally
  const baseFee =
    tx.baseFee ||
    (tx.maxFeePerGas &&
      tx.maxPriorityFeePerGas &&
      BigNumber.from(tx.maxFeePerGas).sub(tx.maxPriorityFeePerGas).toString());

  const fee = formatFee(tx);

  if ((!baseFee || !tx.maxPriorityFeePerGas) && !tx.gasPrice) return null;

  return (
    <>
      {fee && (
        <InfoRow
          symbol="fuelpump.fill"
          label={i18n.t('activity_details.fee')}
          value={fee}
        />
      )}
      {feeType === 'legacy' ? (
        <>
          {tx.gasPrice && (
            <InfoRow
              symbol="barometer"
              label={i18n.t('activity_details.gas_price')}
              value={`${formatNumber(formatUnits(tx.gasPrice, 'gwei'))} Gwei`}
            />
          )}
        </>
      ) : (
        <>
          <InfoRow
            symbol="barometer"
            label={i18n.t('activity_details.base_fee')}
            value={
              baseFee ? (
                `${formatNumber(formatUnits(baseFee, 'gwei'))} Gwei`
              ) : (
                <InfoValueSkeleton />
              )
            }
          />
          <InfoRow
            symbol="barometer"
            label={i18n.t('activity_details.max_priority_fee')}
            value={
              tx.maxPriorityFeePerGas ? (
                `${formatNumber(
                  formatUnits(tx.maxPriorityFeePerGas, 'gwei'),
                )} Gwei`
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

const formatValue = (transaction: RainbowTransaction) => {
  const formattedValueInNative =
    transaction.native &&
    transaction.native.value &&
    Number(transaction.native.value) > 0 &&
    formatCurrency(transaction.native.value);

  if (formattedValueInNative) return formattedValueInNative;

  const nativeCurrencySymbol = findRainbowChainForChainId(transaction.chainId)
    ?.nativeCurrency.symbol;

  if (!nativeCurrencySymbol) return;

  const formattedValue =
    Number(transaction.value) > 0 &&
    `${formatNumber(transaction.value)} ${nativeCurrencySymbol}`;

  return formattedValue;
};
function NetworkData({ transaction: tx }: { transaction: RainbowTransaction }) {
  const chain = findRainbowChainForChainId(tx.chainId);
  const value = formatValue(tx);

  return (
    <Stack space="24px">
      {value && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.value')}
          value={value}
        />
      )}
      <InfoRow
        symbol="point.3.filled.connected.trianglepath.dotted"
        label={i18n.t('activity_details.network')}
        value={
          <Inline alignVertical="center" space="4px">
            <ChainBadge chainId={tx.chainId} size={12} />
            {ChainNameDisplay[tx.chainId] || chain?.name}
          </Inline>
        }
      />
      <FeeData transaction={tx} />
      {tx.nonce >= 0 && (
        <InfoRow
          symbol="number"
          label={i18n.t('activity_details.nonce')}
          value={tx.nonce}
        />
      )}
    </Stack>
  );
}

function SpeedUpErrorExplainer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const explainer = searchParams.get('explainer');

  return (
    <ExplainerSheet
      show={explainer === 'speed_up_error'}
      onClickOutside={() => setSearchParams({})}
      header={{
        icon: <Symbol symbol="xmark.circle.fill" color="red" size={32} />,
      }}
      title={i18n.t('speed_up_and_cancel.speed_up_failed.title')}
      description={[i18n.t('speed_up_and_cancel.speed_up_failed.description')]}
      actionButton={{
        action: () => setSearchParams({ sheet: 'cancel' }),
        symbol: 'trash.fill',
        symbolSide: 'left',
        label: i18n.t('speed_up_and_cancel.cancel_title'),
        labelColor: 'label',
      }}
    />
  );
}

const SpeedUpOrCancel = ({
  transaction,
}: {
  transaction: PendingTransaction;
}) => {
  const navigate = useRainbowNavigate();
  const [searchParams] = useSearchParams();

  const sheetParam = searchParams.get('sheet');
  const sheet =
    sheetParam === 'speedUp' || sheetParam === 'cancel' ? sheetParam : 'none';
  const setSheet = (mode: SheetMode) => {
    navigate(`?sheet=${mode}`, {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap="8px">
        <Button
          onClick={() => setSheet('speedUp')}
          symbol="bolt.fill"
          height="32px"
          width="full"
          variant="plain"
          color="blue"
        >
          {i18n.t('speed_up_and_cancel.speed_up')}
        </Button>
        <Button
          onClick={() => setSheet('cancel')}
          symbol="trash.fill"
          height="32px"
          width="full"
          variant="plain"
          color="fillSecondary"
        >
          {i18n.t('speed_up_and_cancel.cancel')}
        </Button>
      </Box>
      <SpeedUpAndCancelSheet
        currentSheet={sheet}
        transaction={transaction}
        onClose={() => setSheet('none')}
      />
      <SpeedUpErrorExplainer />
    </>
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

  const { data: transaction } = useTransaction({
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
      state: { skipTransitionOnRoute: ROUTES.HOME, tab: 'activity' },
    });

  const onRevoke = () => {
    triggerRevokeApproval({ show: true, approval: approvalToRevoke });
  };

  if (!transaction) {
    return <Navigate to={ROUTES.HOME} state={{ tab: 'activity' }} />;
  }

  return (
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show>
      <Navbar
        leftComponent={<Navbar.CloseButton onClick={backToHome} withinModal />}
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
        {additionalDetails && <AdditionalDetails details={additionalDetails} />}
        <ConfirmationData transaction={transaction} />
        <NetworkData transaction={transaction} />
        {transaction.status === 'pending' && (
          <SpeedUpOrCancel transaction={transaction} />
        )}
      </Stack>
    </BottomSheet>
  );
}
