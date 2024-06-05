import { motion } from 'framer-motion';
import { useCallback, useMemo, useRef } from 'react';

import { useApprovals } from '~/core/resources/approvals/approvals';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import {
  RainbowTransaction,
  TransactionStatus,
} from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { isLowerCaseMatch, truncateString } from '~/core/utils/strings';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Stack,
  Text,
} from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { TextColor } from '~/design-system/styles/designTokens';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';
import { SpinnerRow } from '~/entries/popup/components/SpinnerRow/SpinnerRow';
import { Tag } from '~/entries/popup/components/Tag';
import { useInfiniteTransactionList } from '~/entries/popup/hooks/useInfiniteTransactionList';
import { useTransactionListForPendingTxs } from '~/entries/popup/hooks/useTransactionListForPendingTxs';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { simulateContextClick } from '~/entries/popup/utils/simulateClick';

import { useActivityShortcuts } from '../../../hooks/useActivityShortcuts';
import { useRainbowNavigate } from '../../../hooks/useRainbowNavigate';
import { ROUTES } from '../../../urls';
import { triggerRevokeApproval } from '../Approvals/utils';
import { ActivitySkeleton } from '../Skeletons';

import { ActivityContextMenu } from './ActivityContextMenu';
import { ActivityIcon } from './ActivityIcon';
import { ActivityTypeIcon } from './ActivityTypeIcon';
import { ActivityValue } from './ActivityValue';
import { NoActivity } from './NoActivity';

export function Activities() {
  const {
    isInitialLoading,
    isFetchingNextPage,
    isRefetching,
    transactions,
    virtualizer: activityRowVirtualizer,
  } = useInfiniteTransactionList({
    getScrollElement: () => containerRef.current,
  });
  useTransactionListForPendingTxs();
  const containerRef = useContainerRef();
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { chains } = useUserChains();
  const { isWatchingWallet } = useWallets();

  const { data: approvals } = useApprovals({
    address: currentAddress,
    chainIds: chains.map((c) => c.id),
    currency: currentCurrency,
  });

  const tokenApprovals = useMemo(
    () =>
      approvals
        ?.map((approval) =>
          approval.spenders.map((spender) => ({
            approval,
            spender,
          })),
        )
        .flat(),
    [approvals],
  );

  useActivityShortcuts();

  const isRevokableTransaction = useCallback(
    (tx: RainbowTransaction) => {
      if (tx.type !== 'approve' || isWatchingWallet) return false;
      return tokenApprovals?.some((approval) =>
        isLowerCaseMatch(approval.spender.tx_hash, tx.hash),
      );
    },
    [isWatchingWallet, tokenApprovals],
  );

  const onRevokeTransaction = useCallback(
    (tx: RainbowTransaction) => {
      if (tx.type !== 'approve' || isWatchingWallet) return null;
      const txApproval = tokenApprovals?.find((approval) =>
        isLowerCaseMatch(approval.spender.tx_hash, tx.hash),
      );
      if (txApproval) {
        triggerRevokeApproval({
          show: true,
          approval: txApproval,
        });
      }
    },
    [isWatchingWallet, tokenApprovals],
  );

  if (isInitialLoading || isRefetching) return <ActivitySkeleton />;
  if (!transactions.length) return <NoActivity />;

  const rows = activityRowVirtualizer.getVirtualItems();
  return (
    <>
      <Box
        marginTop="-20px"
        width="full"
        style={{
          // Prevent bottommost coin icon shadow from clipping
          overflow: 'visible',
        }}
        paddingBottom="12px"
        ref={containerRef}
      >
        <Box
          width="full"
          position="relative"
          style={{
            height: `${activityRowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rows.map((virtualItem) => {
            const { index, key, start, size } = virtualItem;
            const tx = transactions[index];
            const isLabel = typeof tx === 'string';
            return (
              <Box
                key={key}
                data-index={index}
                as={motion.div}
                initial={{ opacity: isLabel ? 0 : 1 }}
                animate={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.3 } }}
                position="absolute"
                width="full"
                style={{ height: size, y: start }}
                paddingHorizontal="20px"
              >
                {isLabel ? (
                  <Inset top="16px" bottom="8px">
                    <Text size="14pt" weight="semibold" color="labelTertiary">
                      {tx}
                    </Text>
                  </Inset>
                ) : (
                  <Box paddingVertical="4px">
                    <ActivityRow
                      transaction={tx}
                      onRevokeTransaction={
                        isRevokableTransaction(tx)
                          ? () => onRevokeTransaction(tx)
                          : undefined
                      }
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
      {isFetchingNextPage && <SpinnerRow />}
    </>
  );
}

const ActivityDescription = ({
  transaction,
}: {
  transaction: RainbowTransaction;
}) => {
  const { type, to, asset } = transaction;
  let description = transaction.description;
  let tag: string | undefined;
  if (type === 'contract_interaction' && to) {
    description = transaction.contract?.name || truncateAddress(to);
    tag = transaction.description;
  }

  const nftChangesAmount = transaction.changes
    ?.filter(
      (c) => asset?.address === c?.asset.address && c?.asset.type === 'nft',
    )
    .filter(Boolean).length;
  if (nftChangesAmount) tag = nftChangesAmount.toString();

  return (
    <Inline space="4px" alignVertical="center" wrap={false}>
      <TextOverflow size="14pt" weight="semibold">
        {description}
      </TextOverflow>
      {tag && <Tag>{truncateString(tag, 25)}</Tag>}
    </Inline>
  );
};

function ActivityRow({
  transaction,
  onRevokeTransaction,
}: {
  transaction: RainbowTransaction;
  onRevokeTransaction?: () => void;
}) {
  const navigate = useRainbowNavigate();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Lens
      borderRadius="12px"
      marginHorizontal="-12px"
      forceAvatarColor
      onKeyDown={() => simulateContextClick(ref.current)}
    >
      <ActivityContextMenu
        transaction={transaction}
        onRevokeTransaction={onRevokeTransaction}
      >
        <Box
          ref={ref}
          style={{ height: '52px' }}
          paddingHorizontal="12px"
          paddingVertical="8px"
          borderRadius="12px"
          className={rowTransparentAccentHighlight}
          gap="8px"
          display="flex"
          alignItems="center"
          onClick={() =>
            navigate(
              ROUTES.ACTIVITY_DETAILS(transaction.chainId, transaction.hash),
              { state: { skipTransitionOnRoute: ROUTES.HOME } },
            )
          }
        >
          <ActivityIcon transaction={transaction} />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="4px"
            width="full"
          >
            <Stack space="8px">
              <ActivityTypeLabel transaction={transaction} />
              <ActivityDescription transaction={transaction} />
            </Stack>
            <ActivityValue transaction={transaction} />
          </Box>
        </Box>
      </ActivityContextMenu>
    </Lens>
  );
}

const typeLabelColor = {
  pending: 'blue',
  failed: 'red',
  confirmed: 'labelTertiary',
} satisfies Record<TransactionStatus, TextColor>;

const ActivityTypeLabel = ({
  transaction: { type, title, status },
}: {
  transaction: RainbowTransaction;
}) => {
  const color = typeLabelColor[status];

  return (
    <Columns space="4px" alignHorizontal="left">
      <Column width="content">
        <Box style={{ width: 9, height: 9 }}>
          <Inline height="full" alignHorizontal="center" alignVertical="center">
            <ActivityTypeIcon transaction={{ status, type }} />
          </Inline>
        </Box>
      </Column>
      <Column width="content">
        <Text size="12pt" weight="semibold" align="right" color={color}>
          {truncateString(title, 20)}
        </Text>
      </Column>
    </Columns>
  );
};
