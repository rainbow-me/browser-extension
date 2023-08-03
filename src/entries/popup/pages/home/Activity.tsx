import { motion } from 'framer-motion';
import React, { ReactNode, useMemo } from 'react';

import { i18n } from '~/core/languages';
import {
  RainbowTransaction,
  TransactionStatus,
  TransactionType,
} from '~/core/types/transactions';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Symbol,
  Text,
} from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { TextStyles } from '~/design-system/styles/core.css';
import { Space, TextColor } from '~/design-system/styles/designTokens';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';

import { ActivitySkeleton } from '../../components/ActivitySkeleton/ActivitySkeleton';
import { Spinner } from '../../components/Spinner/Spinner';
import { useActivityShortcuts } from '../../hooks/useActivityShortcuts';
import useInfiniteTransactionList from '../../hooks/useInfiniteTransactionList';

import { TransactionDetailsMenu } from './TransactionDetailsMenu';

export function Activity() {
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

  if (isInitialLoading || isRefetching) {
    return <ActivitySkeleton />;
  }

  if (!transactions.length) {
    return (
      <Box
        width="full"
        height="full"
        justifyContent="center"
        alignItems="center"
        paddingTop="104px"
      >
        <Box paddingBottom="14px">
          <Text
            align="center"
            size="20pt"
            weight="semibold"
            color="labelTertiary"
          >
            {i18n.t('activity.empty_header')}
          </Text>
        </Box>
        <Inset horizontal="40px">
          <Text
            align="center"
            size="12pt"
            weight="medium"
            color="labelQuaternary"
          >
            {i18n.t('activity.empty_description')}
          </Text>
        </Inset>
      </Box>
    );
  }

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
              >
                {isLabel ? (
                  <Inset horizontal="20px" top="16px" bottom="8px">
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
                  <TransactionDetailsMenu transaction={rowData}>
                    <ActivityRow transaction={rowData} />
                  </TransactionDetailsMenu>
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

const titleIcons: {
  [key: string]: {
    color: 'accent' | TextColor;
    element?: ReactNode;
    space?: Space;
    type: 'icon' | 'emoji' | 'spinner';
    size?: number;
  };
} = {
  'xmark.circle': {
    color: 'labelTertiary',
    space: '2px',
    type: 'icon',
    size: 9,
  },
  'paperplane.fill': {
    color: 'labelTertiary',
    space: '2px',
    type: 'icon',
    size: 9,
  },
  'arrow.triangle.swap': {
    color: 'purple',
    space: '2px',
    type: 'icon',
    size: 9,
  },
  'circle.fill': {
    color: 'labelTertiary',
    space: '2px',
    type: 'icon',
    size: 6,
  },
  robot: {
    color: 'labelTertiary',
    // TODO: Create Emoji Component to handle all cases
    element: (
      <Text size="12pt" weight="regular">
        {'🤖'}
      </Text>
    ),
    space: '2px',
    type: 'emoji',
  },
  'arrow.down': {
    color: 'labelTertiary',
    type: 'icon',
    space: '2px',
    size: 9,
  },
  spinner: {
    color: 'blue',
    element: <Spinner />,
    space: '3px',
    type: 'spinner',
  },
};

const truncateString = (txt = '', maxLength = 22) => {
  return `${txt?.slice(0, maxLength)}${txt.length > maxLength ? '...' : ''}`;
};

const ActivityRow = React.memo(function ({
  transaction,
}: {
  transaction: RainbowTransaction;
}) {
  const { asset, balance, name, native, status, symbol, title, type } =
    transaction;
  const isTrade = type === TransactionType.trade;
  const received = status === TransactionStatus.received;
  const receivedViaSwap = status === TransactionStatus.received && isTrade;
  const sent = status === TransactionStatus.sent;
  const approved = status === TransactionStatus.approved;
  const approving = status === TransactionStatus.approving;
  const sentViaSwap = status === TransactionStatus.swapped && isTrade;
  const failed = status === TransactionStatus.failed;
  const isContractInteraction =
    status === TransactionStatus.contract_interaction;
  const swapping = status === TransactionStatus.swapping;
  const sending = status === TransactionStatus.sending;
  const speedingUp = status === TransactionStatus.speeding_up;
  const cancelling = status === TransactionStatus.cancelling;

  const nativeDisplay = useMemo(() => {
    const isDebit = sent || sentViaSwap || sending || swapping;

    return `${isDebit ? '- ' : ''}${native?.display}`;
  }, [native?.display, sent, sentViaSwap, sending, swapping]);

  const nativeDisplayColor = useMemo(() => {
    if (received) {
      return 'green';
    }
    return receivedViaSwap ? 'purple' : 'labelTertiary';
  }, [received, receivedViaSwap]);

  const titleColor = useMemo((): TextStyles['color'] => {
    if (cancelling || sending || speedingUp || swapping || approving) {
      return 'blue';
    }
    return sentViaSwap ? 'purple' : 'labelTertiary';
  }, [cancelling, sentViaSwap, sending, speedingUp, swapping, approving]);

  const titleIconConfig = useMemo(() => {
    let iconSymbol: keyof typeof titleIcons | undefined;

    if (isContractInteraction) {
      iconSymbol = 'robot';
    } else if (failed) {
      iconSymbol = 'xmark.circle';
    } else if (sent) {
      iconSymbol = 'paperplane.fill';
    } else if (sentViaSwap) {
      iconSymbol = 'arrow.triangle.swap';
    } else if (received || receivedViaSwap) {
      iconSymbol = 'arrow.down';
    } else if (cancelling || sending || speedingUp || swapping || approving) {
      iconSymbol = 'spinner';
    } else if (approved) {
      iconSymbol = 'circle.fill';
    }

    if (iconSymbol) {
      const iconConfig = titleIcons[iconSymbol];
      return {
        ...iconConfig,
        icon: iconConfig?.element ? (
          iconConfig?.element
        ) : (
          <Symbol
            symbol={iconSymbol as SymbolProps['symbol']}
            color={iconConfig.color}
            size={iconConfig.size || 9}
            weight="semibold"
          />
        ),
      };
    }

    return null;
  }, [
    isContractInteraction,
    failed,
    sent,
    sentViaSwap,
    received,
    receivedViaSwap,
    cancelling,
    sending,
    speedingUp,
    swapping,
    approved,
    approving,
  ]);

  const topRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">
            <Inline space={titleIconConfig?.space} alignVertical="center">
              <Box style={{ width: 9, height: 9 }}>
                <Inline
                  height="full"
                  alignHorizontal="center"
                  alignVertical="center"
                >
                  {titleIconConfig?.icon}
                </Inline>
              </Box>

              <Text color={titleColor} size="12pt" weight="semibold">
                {truncateString(title, 20)}
              </Text>
            </Inline>
          </Box>
        </Column>
        <Column>
          <Box paddingVertical="4px">
            <Text
              size="12pt"
              weight="semibold"
              align="right"
              color="labelTertiary"
            >
              {truncateString(balance?.display, 20)}
            </Text>
          </Box>
        </Column>
      </Columns>
    ),
    [
      balance?.display,
      title,
      titleColor,
      titleIconConfig?.icon,
      titleIconConfig?.space,
    ],
  );

  const bottomRow = useMemo(() => {
    return (
      <Columns>
        <Column>
          <Box paddingVertical="4px">
            <TextOverflow size="14pt" weight="semibold">
              {name}
            </TextOverflow>
          </Box>
        </Column>
        <Column>
          <Box paddingVertical="4px">
            <TextOverflow
              size="14pt"
              weight="semibold"
              align="right"
              color={nativeDisplayColor}
            >
              {nativeDisplay}
            </TextOverflow>
          </Box>
        </Column>
      </Columns>
    );
  }, [nativeDisplay, nativeDisplayColor, name]);

  return asset ? (
    <CoinRow
      asset={asset}
      fallbackText={symbol}
      topRow={topRow}
      bottomRow={bottomRow}
    />
  ) : (
    <CoinRow fallbackText={symbol} topRow={topRow} bottomRow={bottomRow} />
  );
});

ActivityRow.displayName = 'ActivityRow';
