import { useVirtualizer } from '@tanstack/react-virtual';
import React, { ReactNode, useCallback, useMemo, useRef } from 'react';
import { useAccount } from 'wagmi';

import { selectTransactionsByDate } from '~/core/resources/_selectors';
import { useTransactions } from '~/core/resources/transactions/transactions';
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
import { TextColor } from '~/design-system/styles/designTokens';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';

export function Activity() {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: transactionsByDate = {} } = useTransactions(
    { address, currency },
    { select: selectTransactionsByDate },
  );
  const listData = useMemo(
    () =>
      Object.keys(transactionsByDate).reduce((listData, dateKey) => {
        return [...listData, dateKey, ...transactionsByDate[dateKey]];
      }, [] as (string | RainbowTransaction)[]),
    [transactionsByDate],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const activityRowVirtualizer = useVirtualizer({
    count: listData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (i) => (typeof listData[i] === 'string' ? 34 : 52),
    enableSmoothScroll: false,
  });
  return (
    <Box
      marginTop={'-20px'}
      ref={containerRef}
      width="full"
      style={{
        overflow: 'auto',
      }}
    >
      <Box
        width="full"
        style={{
          height: `${activityRowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {activityRowVirtualizer.getVirtualItems().map(({ index }) => {
          const item = listData[index];
          if (typeof item === 'string') {
            return (
              <Inset key={index} horizontal="20px" top="16px" bottom="8px">
                <Box>
                  <Text size="14pt" weight={'semibold'} color={'labelTertiary'}>
                    {item}
                  </Text>
                </Box>
              </Inset>
            );
          }
          return <ActivityRow key={index} transaction={item} />;
        })}
      </Box>
    </Box>
  );
}

const titleIcons: {
  [key: string]: {
    color: 'accent' | TextColor;
    emoji?: ReactNode;
    space?: '2px';
    type: 'icon' | 'emoji';
  };
} = {
  'xmark.circle': {
    color: 'labelTertiary',
    space: '2px',
    type: 'icon',
  },
  'paperplane.fill': {
    color: 'labelTertiary',
    space: '2px',
    type: 'icon',
  },
  'arrow.triangle.swap': {
    color: 'purple',
    space: '2px',
    type: 'icon',
  },
  robot: {
    color: 'labelTertiary',
    // TODO: Create Emoji Component to handle all cases
    emoji: (
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
  },
};

// TODO: create truncation component
const truncateString = (txt = '', maxLength = 22) => {
  return `${txt?.slice(0, maxLength)}${txt.length > maxLength ? '...' : ''}`;
};

function ActivityRow({ transaction }: { transaction: RainbowTransaction }) {
  const { asset, balance, name, native, status, symbol, title, type } =
    transaction;
  const isTrade = type === TransactionType.trade;
  const receiving = type === TransactionType.receive;
  const receivingViaSwap = status === TransactionStatus.received && isTrade;
  const sending = type === TransactionType.send;
  const sendingViaSwap = status === TransactionStatus.swapped && isTrade;
  const failed = status === TransactionStatus.failed;
  const isContractInteraction =
    status === TransactionStatus.contract_interaction;

  const getNativeDisplay = useCallback(() => {
    const isDebit = sending || sendingViaSwap;

    return `${isDebit ? '- ' : ''}${native?.display}`;
  }, [native?.display, sending, sendingViaSwap]);

  const getNativeDisplayColor = useCallback(() => {
    if (receiving) {
      return 'green';
    }
    return receivingViaSwap ? 'purple' : 'labelTertiary';
  }, [receiving, receivingViaSwap]);

  const getTitleColor = useCallback(
    () => (sendingViaSwap ? 'purple' : 'labelTertiary'),
    [sendingViaSwap],
  );

  const getTitleIcon = useCallback(() => {
    let iconSymbol: keyof typeof titleIcons | undefined;

    if (isContractInteraction) {
      iconSymbol = 'robot';
    } else if (failed) {
      iconSymbol = 'xmark.circle';
    } else if (sending) {
      iconSymbol = 'paperplane.fill';
    } else if (sendingViaSwap) {
      iconSymbol = 'arrow.triangle.swap';
    } else if (receiving || receivingViaSwap) {
      iconSymbol = 'arrow.down';
    }

    if (iconSymbol) {
      const iconConfig = titleIcons[iconSymbol];
      return {
        ...iconConfig,
        icon: iconConfig?.emoji ? (
          iconConfig?.emoji
        ) : (
          <Symbol
            symbol={iconSymbol as SymbolProps['symbol']}
            color={iconConfig.color}
            size={9}
            weight="semibold"
          />
        ),
      };
    }

    return null;
  }, [
    failed,
    isContractInteraction,
    receiving,
    receivingViaSwap,
    sending,
    sendingViaSwap,
  ]);

  const titleIconConfig = getTitleIcon();

  const topRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">
            <Inline space={titleIconConfig?.space}>
              {titleIconConfig?.icon}
              <Text color={getTitleColor()} size="12pt" weight="semibold">
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
      getTitleColor,
      title,
      titleIconConfig?.icon,
      titleIconConfig?.space,
    ],
  );

  const bottomRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">
            <Text size="14pt" weight="semibold">
              {truncateString(name, 16)}
            </Text>
          </Box>
        </Column>
        <Column>
          <Box paddingVertical="4px">
            <Text
              size="14pt"
              weight="semibold"
              align="right"
              color={getNativeDisplayColor()}
            >
              {getNativeDisplay()}
            </Text>
          </Box>
        </Column>
      </Columns>
    ),
    [getNativeDisplay, getNativeDisplayColor, name],
  );

  return (
    <CoinRow
      asset={asset}
      fallbackText={symbol}
      topRow={topRow}
      bottomRow={bottomRow}
    />
  );
}
