import { useVirtualizer } from '@tanstack/react-virtual';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAccount } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentCurrencyStore } from '~/core/state';
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
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { TextStyles } from '~/design-system/styles/core.css';
import { Space, TextColor } from '~/design-system/styles/designTokens';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';

import { ActivitySkeleton } from '../../components/ActivitySkeleton/ActivitySkeleton';
import { Spinner } from '../../components/Spinner/Spinner';
import { useActivityShortcuts } from '../../hooks/useActivityShortcuts';
import { useAllTransactions } from '../../hooks/useAllTransactions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TransactionDetailsMenu } from './TransactionDetailsMenu';

const ACTIVITY_DEFAULT_LENGTH = 100;

export function Activity() {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { allTransactionsByDate, isInitialLoading } = useAllTransactions({
    address,
    currency,
  });
  const [activityLength, setActivityLength] = useState(ACTIVITY_DEFAULT_LENGTH);
  const listData = useMemo(() => {
    return Object.keys(allTransactionsByDate).reduce((listData, dateKey) => {
      return [...listData, dateKey, ...allTransactionsByDate[dateKey]];
    }, [] as (string | RainbowTransaction)[]);
  }, [allTransactionsByDate]).slice(0, activityLength);
  const containerRef = useRef<HTMLDivElement>(null);
  const activityRowVirtualizer = useVirtualizer({
    count: listData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (i) => (typeof listData[i] === 'string' ? 34 : 52),
    overscan: 20,
  });
  const scrollEndListener = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setActivityLength(activityLength + ACTIVITY_DEFAULT_LENGTH);
    }
  }, [activityLength]);

  useEffect(() => {
    window.removeEventListener('scroll', scrollEndListener);
    window.addEventListener('scroll', scrollEndListener);
    return () => {
      window.removeEventListener('scroll', scrollEndListener);
    };
  }, [scrollEndListener]);

  useActivityShortcuts();

  if (isInitialLoading) {
    return <ActivitySkeleton />;
  }

  if (!listData.length) {
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

  return (
    <>
      <Box
        ref={containerRef}
        marginTop={'-20px'}
        width="full"
        style={{
          overflow: 'auto',
          // prevent coin icon shadow from clipping in empty space when list is small
          paddingBottom:
            activityRowVirtualizer.getVirtualItems().length > 6 ? 8 : 60,
        }}
      >
        <Box
          width="full"
          style={{
            height: activityRowVirtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          {activityRowVirtualizer.getVirtualItems().map((virtualItem) => {
            const { index, start } = virtualItem;
            const rowData = listData?.[index];
            return (
              <Box
                key={index}
                data-index={index}
                ref={activityRowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: rowData === 'string' ? 34 : 52,
                  transform: `translateY(${start}px)`,
                }}
              >
                {typeof rowData === 'string' ? (
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

// TODO: create truncation component
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
    if (cancelling || sending || speedingUp || swapping) {
      return 'blue';
    }
    return sentViaSwap ? 'purple' : 'labelTertiary';
  }, [cancelling, sentViaSwap, sending, speedingUp, swapping]);

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
    } else if (cancelling || sending || speedingUp || swapping) {
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
