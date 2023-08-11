import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { RainbowTransaction } from '~/core/types/transactions';
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
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  Space,
  SymbolName,
  TextColor,
} from '~/design-system/styles/designTokens';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';

import { Spinner } from '../../components/Spinner/Spinner';
import { useActivityShortcuts } from '../../hooks/useActivityShortcuts';
import useInfiniteTransactionList from '../../hooks/useInfiniteTransactionList';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { ActivitySkeleton } from './Skeletons';

const NoActivity = () => {
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
};

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
                  // <TransactionDetailsMenu transaction={rowData}>
                  <ActivityRow transaction={rowData} />
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

const titleIcons: {
  [k in SymbolName | 'spinner' | 'robot']?: {
    color: TextColor;
    space: Space;
    type: string;
    size?: number;
    element?: React.ReactNode;
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
} as const;

const truncateString = (txt = '', maxLength = 22) => {
  return `${txt?.slice(0, maxLength)}${txt.length > maxLength ? '...' : ''}`;
};

const getActivityIcon = (tx: Pick<RainbowTransaction, 'status' | 'type'>) => {
  let iconSymbol: keyof typeof titleIcons | null = null;

  if (tx.status === 'pending') iconSymbol = 'spinner';
  if (tx.status === 'failed') iconSymbol = 'xmark.circle';
  if (tx.type === 'contract interaction') iconSymbol = 'robot';
  if (tx.type === 'send') iconSymbol = 'paperplane.fill';
  if (tx.type === 'swap') iconSymbol = 'arrow.triangle.swap';
  if (tx.type === 'receive') iconSymbol = 'arrow.down';
  if (tx.type === 'approve') iconSymbol = 'circle.fill';

  if (!iconSymbol) return null;

  const iconConfig = titleIcons[iconSymbol];
  if (!iconConfig) return null;

  return {
    ...iconConfig,
    icon: iconConfig.element ? (
      iconConfig?.element
    ) : (
      <Symbol
        symbol={iconSymbol as SymbolName}
        color={iconConfig.color}
        size={iconConfig.size || 9}
        weight="semibold"
      />
    ),
  };
};

const ActivityTopRow = ({
  type,
  status,
  title,
}: Pick<RainbowTransaction, 'status' | 'type' | 'title'>) => {
  const titleColor = useMemo((): TextStyles['color'] => {
    if (status === 'pending') return 'blue';
    return type === 'swap' ? 'purple' : 'labelTertiary';
  }, [status, type]);

  const titleIconConfig = getActivityIcon({ status, type });

  return (
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
            aa
          </Text>
        </Box>
      </Column>
    </Columns>
  );
};

const ActivityRow = React.memo(function ({
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

  const bottomRow = useMemo(() => {
    return (
      <Columns>
        <Column>
          <Box paddingVertical="4px">
            <TextOverflow size="14pt" weight="semibold">
              {title}
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
              aa
            </TextOverflow>
          </Box>
        </Column>
      </Columns>
    );
  }, [nativeDisplayColor, title]);

  return asset ? (
    <CoinRow
      asset={asset}
      fallbackText={symbol}
      topRow={<ActivityTopRow type={type} status={status} title={title} />}
      bottomRow={bottomRow}
    />
  ) : (
    <CoinRow
      fallbackText={symbol}
      topRow={<ActivityTopRow type={type} status={status} title={title} />}
      bottomRow={bottomRow}
    />
  );
});

ActivityRow.displayName = 'ActivityRow';
