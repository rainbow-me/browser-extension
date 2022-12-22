import { useVirtualizer } from '@tanstack/react-virtual';
import React, { ReactNode, useCallback, useMemo, useRef } from 'react';
import { useAccount } from 'wagmi';

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
import { TextStyles } from '~/design-system/styles/core.css';
import { Space, TextColor } from '~/design-system/styles/designTokens';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';

import { Spinner } from '../../components/Spinner/Spinner';
import { useAllTransactions } from '../../hooks/useAllTransactions';
import { SheetMode } from '../speedUpAndCancelSheet';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SpeedUpAndCancelMenu } from './SpeedUpAndCancelMenu';

type ActivityProps = {
  onSheetSelected: ({
    sheet,
    transaction,
  }: {
    sheet: SheetMode;
    transaction: RainbowTransaction;
  }) => void;
};

export function Activity({ onSheetSelected }: ActivityProps) {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { allTransactionsByDate } = useAllTransactions({
    address,
    currency,
  });
  const listData = useMemo(() => {
    return Object.keys(allTransactionsByDate).reduce((listData, dateKey) => {
      return [...listData, dateKey, ...allTransactionsByDate[dateKey]];
    }, [] as (string | RainbowTransaction)[]);
  }, [allTransactionsByDate]);
  const containerRef = useRef<HTMLDivElement>(null);
  const activityRowVirtualizer = useVirtualizer({
    count: listData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (i) => (typeof listData[i] === 'string' ? 34 : 52),
    enableSmoothScroll: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onTransactionSelected = ({
    sheet,
    transaction,
  }: {
    sheet: SheetMode;
    transaction: RainbowTransaction;
  }) => {
    onSheetSelected({ sheet, transaction });
  };

  return (
    <>
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
                    <Text
                      size="14pt"
                      weight={'semibold'}
                      color={'labelTertiary'}
                    >
                      {item}
                    </Text>
                  </Box>
                </Inset>
              );
            }
            // return (
            //   <SpeedUpAndCancelMenu
            //     key={index}
            //     onRowSelection={onTransactionSelected}
            //     transaction={item}
            //   >
            //     <ActivityRow transaction={item} />
            //   </SpeedUpAndCancelMenu>
            // );
            return <ActivityRow transaction={item} key={index} />;
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

function ActivityRow({ transaction }: { transaction: RainbowTransaction }) {
  const { asset, balance, name, native, status, symbol, title, type } =
    transaction;
  const isTrade = type === TransactionType.trade;
  const received = status === TransactionStatus.received;
  const receivedViaSwap = status === TransactionStatus.received && isTrade;
  const sent = status === TransactionStatus.sent;
  const sentViaSwap = status === TransactionStatus.swapped && isTrade;
  const failed = status === TransactionStatus.failed;
  const isContractInteraction =
    status === TransactionStatus.contract_interaction;
  const swapping = status === TransactionStatus.swapping;
  const sending = status === TransactionStatus.sending;

  const getNativeDisplay = useCallback(() => {
    const isDebit = sent || sentViaSwap || sending || swapping;

    return `${isDebit ? '- ' : ''}${native?.display}`;
  }, [native?.display, sent, sentViaSwap, sending, swapping]);

  const getNativeDisplayColor = useCallback(() => {
    if (received) {
      return 'green';
    }
    return receivedViaSwap ? 'purple' : 'labelTertiary';
  }, [received, receivedViaSwap]);

  const getTitleColor = useCallback((): TextStyles['color'] => {
    if (sending || swapping) {
      return 'blue';
    }
    return sentViaSwap ? 'purple' : 'labelTertiary';
  }, [sentViaSwap, sending, swapping]);

  const getTitleIcon = useCallback(() => {
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
    } else if (sending || swapping) {
      iconSymbol = 'spinner';
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
    received,
    receivedViaSwap,
    sent,
    sentViaSwap,
    sending,
    swapping,
  ]);

  const titleIconConfig = getTitleIcon();

  const topRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">
            <Inline space={titleIconConfig?.space} alignVertical="center">
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
