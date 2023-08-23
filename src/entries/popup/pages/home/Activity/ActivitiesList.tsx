import { motion } from 'framer-motion';
import React from 'react';

import {
  RainbowTransaction,
  TransactionStatus,
} from '~/core/types/transactions';
import { Box, Inline, Inset, Text } from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { TextColor } from '~/design-system/styles/designTokens';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';

import { Spinner } from '../../../components/Spinner/Spinner';
import { useActivityShortcuts } from '../../../hooks/useActivityShortcuts';
import useInfiniteTransactionList from '../../../hooks/useInfiniteTransactionList';
import { useRainbowNavigate } from '../../../hooks/useRainbowNavigate';
import { ROUTES } from '../../../urls';
import { ActivitySkeleton } from '../Skeletons';

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
  const amount = transaction.changes
    .filter(
      (c) => c?.asset.type === 'nft' && c.direction !== transaction.direction,
    )
    .filter(Boolean).length;

  if (!amount) return null;

  return (
    <Box
      paddingHorizontal="5px"
      paddingVertical="4px"
      marginVertical="-3px"
      borderColor="separatorSecondary"
      borderRadius="6px"
      borderWidth="1px"
    >
      <Text size="11pt" weight="semibold" align="right" color="labelTertiary">
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
  const { description } = transaction;

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
              <TextOverflow size="14pt" weight="semibold" maxWidth={200}>
                {description}
              </TextOverflow>
              <NFTAmount transaction={transaction} />
            </Inline>
          </Box>

          <ActivityValue transaction={transaction} />
        </Box>
      </Box>
    </Lens>
  );
});

const colorByStatus: Record<TransactionStatus, TextColor> = {
  pending: 'blue',
  failed: 'red',
  confirmed: 'labelTertiary',
};

const ActivityTypeLabel = ({
  transaction: { type, title, status },
}: {
  transaction: RainbowTransaction;
}) => {
  const color = colorByStatus[status] || 'labelTertiary';

  return (
    <Inline space="4px">
      <Box style={{ width: 9, height: 9 }}>
        <Inline height="full" alignHorizontal="center" alignVertical="center">
          <ActivityTypeIcon transaction={{ status, type }} />
        </Inline>
      </Box>
      <Text size="12pt" weight="semibold" align="right" color={color}>
        {truncateString(title, 20)}
      </Text>
    </Inline>
  );
};
