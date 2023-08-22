import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import {
  RainbowTransaction,
  TransactionInTypes,
  TransactionOutTypes,
} from '~/core/types/transactions';
import { formatCurrency, formatNumber } from '~/core/utils/formatNumber';
import { Box, Inline, Inset, Text } from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { TextStyles } from '~/design-system/styles/core.css';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';

import { Spinner } from '../../../components/Spinner/Spinner';
import { useActivityShortcuts } from '../../../hooks/useActivityShortcuts';
import useInfiniteTransactionList from '../../../hooks/useInfiniteTransactionList';
import { useRainbowNavigate } from '../../../hooks/useRainbowNavigate';
import { ROUTES } from '../../../urls';
import { ActivitySkeleton } from '../Skeletons';

import { ActivityIcon } from './ActivityIcon';
import { ActivityTypeIcon } from './ActivityTypeIcon';
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
  const containerRef = useContainerRef();

  useActivityShortcuts();

  const navigate = useRainbowNavigate();

  if (isInitialLoading || isRefetching) return <ActivitySkeleton />;
  if (!transactions.length) return <NoActivity />;

  const rows = activityRowVirtualizer.getVirtualItems();
  return (
    <>
      <Box
        marginTop={'-20px'}
        width="full"
        style={{
          overflow: 'auto',
          // prevent coin icon shadow from clipping in empty space when list is small
          paddingBottom: transactions.length > 6 ? 8 : 60,
        }}
      >
        <Box
          width="full"
          style={{
            height: activityRowVirtualizer.getTotalSize(),
            minHeight: '436px',
            position: 'relative',
          }}
        >
          {rows.map((virtualItem) => {
            const { index, key, start, size } = virtualItem;
            const rowData = transactions[index];
            const isLabel = typeof rowData === 'string';
            return (
              <Box
                key={key}
                data-index={index}
                as={motion.div}
                layoutId={`list-${index}`}
                layoutScroll
                layout="position"
                initial={{ opacity: isLabel ? 0 : 1 }}
                animate={{ opacity: 1 }}
                position="absolute"
                width="full"
                style={{ height: size, y: start }}
                onClick={() =>
                  !isLabel && navigate(ROUTES.ACTIVITY_DETAILS(rowData.hash))
                }
                paddingHorizontal="20px"
              >
                {isLabel ? (
                  <Inset top="16px" bottom="8px">
                    <Box>
                      <Text
                        size="14pt"
                        weight={'semibold'}
                        color={'labelTertiary'}
                      >
                        {rowData}
                      </Text>
                    </Box>
                  </Inset>
                ) : (
                  // <TransactionDetailsMenu transaction={rowData}>
                  <Box paddingVertical="4px">
                    <ActivityRow transaction={rowData} />
                  </Box>
                  // </TransactionDetailsMenu>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
      {isFetchingNextPage && (
        <Box
          as={motion.div}
          alignItems="center"
          display="flex"
          justifyContent="center"
          style={{ height: 72 }}
          initial={{ opacity: 0.5, height: 0 }}
          animate={{ opacity: 1, height: 72 }}
          key="page-loader"
        >
          <Spinner size={32} />
        </Box>
      )}
    </>
  );
}

const truncateString = (txt = '', maxLength = 22) => {
  return `${txt?.slice(0, maxLength)}${txt.length > maxLength ? '...' : ''}`;
};

const NFTAmount = ({ transaction }: { transaction: RainbowTransaction }) => {
  const nftChanges = transaction.changes
    .filter((c) => c?.asset.type === 'nft')
    .filter(Boolean);

  if (!nftChanges.length) return null;

  let amount: number | undefined;
  if (TransactionInTypes.includes(transaction.type)) {
    amount = nftChanges.filter((c) => c.direction === 'in').length;
  }
  if (TransactionOutTypes.includes(transaction.type)) {
    amount = nftChanges.filter((c) => c.direction === 'out').length;
  }

  if (!amount) return null;

  return (
    <Box
      paddingHorizontal="6px"
      paddingVertical="5px"
      borderColor="separatorSecondary"
      borderRadius="6px"
      borderWidth="1px"
    >
      <Text size="12pt" weight="semibold" align="right" color="labelTertiary">
        {amount}
      </Text>
    </Box>
  );
};

const ActivityRow = React.memo(function ActivityRow({
  transaction,
}: {
  transaction: RainbowTransaction;
}) {
  const { status, title, type } = transaction;

  // const nativeDisplay = useMemo(() => {
  //   const isDebit = transaction.direction === 'out';
  //   return `${isDebit ? '- ' : ''}${native?.display}`;
  // }, [native?.display, transaction.direction]);

  const nativeDisplayColor = useMemo(() => {
    if (type === 'receive') return 'green';
    return type === 'swap' ? 'purple' : 'labelTertiary';
  }, [type]);

  const titleColor = useMemo((): TextStyles['color'] => {
    if (status === 'pending') return 'blue';
    return type === 'swap' ? 'purple' : 'labelTertiary';
  }, [status, type]);

  const description = transaction.description;
  const firstChangedAsset = transaction.changes[0]?.asset;

  return (
    <Lens borderRadius="12px" forceAvatarColor>
      <Box
        style={{ height: '52px' }}
        display="flex"
        alignItems="center"
        gap="8px"
        paddingHorizontal="12px"
        paddingVertical="8px"
        marginHorizontal="-12px"
        borderRadius="12px"
        className={rowTransparentAccentHighlight}
      >
        <ActivityIcon transaction={transaction} />

        <Box display="flex" justifyContent="space-between" width="full">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            gap="8px"
          >
            <ActivityTypeLabel transaction={transaction} />

            <Inline space="4px" alignVertical="center">
              <TextOverflow size="14pt" weight="semibold" maxWidth={220}>
                {description}
              </TextOverflow>
              <NFTAmount transaction={transaction} />
            </Inline>
          </Box>

          {firstChangedAsset && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              justifyContent="center"
              gap="8px"
            >
              <Text color={titleColor} size="12pt" weight="semibold">
                {formatNumber(firstChangedAsset.balance.amount)}
              </Text>
              <TextOverflow
                size="14pt"
                weight="semibold"
                align="right"
                color={nativeDisplayColor}
              >
                {formatCurrency(firstChangedAsset.native.balance.amount || 0)}
              </TextOverflow>
            </Box>
          )}
        </Box>
      </Box>
    </Lens>
  );
});

const ActivityTypeLabel = ({
  transaction: { type, title, status },
}: {
  transaction: RainbowTransaction;
}) => {
  return (
    <Inline space="4px">
      <Box style={{ width: 9, height: 9 }}>
        <Inline height="full" alignHorizontal="center" alignVertical="center">
          <ActivityTypeIcon transaction={{ status, type }} />
        </Inline>
      </Box>
      <Text size="12pt" weight="semibold" align="right" color="labelTertiary">
        {truncateString(title, 20)}
      </Text>
    </Inline>
  );
};
