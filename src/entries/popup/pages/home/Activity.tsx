import React, { Fragment, ReactNode, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';

import { useTransactions } from '~/core/resources/transactions/transactions';
import { useCurrentCurrencyStore } from '~/core/state';
import { UniqueId } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import {
  RainbowTransaction,
  TransactionStatus,
  TransactionType,
} from '~/core/types/transactions';
import { Box, Inline, Row, Rows, Text } from '~/design-system';
import { ForegroundColor } from '~/design-system/styles/designTokens';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';
import {
  Symbols as IconSymbol,
  SFSymbol,
} from '~/entries/popup/components/SFSymbol/SFSymbol';

export function Activity() {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: transactions = [] } = useTransactions({ address, currency });
  console.log('TRANSACTION: ', transactions);
  return (
    <Box marginTop="-20px">
      {transactions.map((tx, i) => (
        <ActivityRow key={`${tx?.hash}-${i}`} transaction={tx} />
      ))}
    </Box>
  );
}

const titleIcons: {
  [key: string]: {
    color: ForegroundColor;
    emoji?: ReactNode;
    space?: '2px';
    type: 'icon' | 'emoji';
  };
} = {
  closeCircled: {
    color: 'labelTertiary',
    space: '2px',
    type: 'icon',
  },
  send: {
    color: 'labelTertiary',
    space: '2px',
    type: 'icon',
  },
  swap: {
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
  receive: {
    color: 'labelTertiary',
    type: 'icon',
  },
};

function ActivityRow({ transaction }: { transaction: RainbowTransaction }) {
  const { address, balance, name, native, status, symbol, title, type } =
    transaction;
  const isTrade = type === TransactionType.trade;
  const receiving = type === TransactionType.receive;
  const receivingViaSwap = status === TransactionStatus.received && isTrade;
  const sending = type === TransactionType.send;
  const sendingViaSwap = status === TransactionStatus.swapped && isTrade;
  const failed = status === TransactionStatus.failed;
  const isContractInteraction =
    status === TransactionStatus.contract_interaction;
  const symbolToDisplay = isContractInteraction ? 'contract' : symbol;
  const uniqueId = `${isContractInteraction ? '' : address}_${
    ChainName.mainnet
  }`;

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
      iconSymbol = 'closeCircled';
    } else if (sending) {
      iconSymbol = 'send';
    } else if (sendingViaSwap) {
      iconSymbol = 'swap';
    } else if (receiving || receivingViaSwap) {
      iconSymbol = 'receive';
    }

    if (iconSymbol) {
      const iconConfig = titleIcons[iconSymbol];
      return {
        ...iconConfig,
        icon: iconConfig?.emoji ? (
          iconConfig?.emoji
        ) : (
          <SFSymbol
            symbol={iconSymbol as IconSymbol}
            color={iconConfig.color}
            size={9}
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

  const leftColumn = useMemo(
    () => (
      <Fragment>
        <Rows>
          <Row>
            <Inline space={titleIconConfig?.space}>
              {titleIconConfig?.icon}
              <Text color={getTitleColor()} size="12pt" weight="semibold">
                {title}
              </Text>
            </Inline>
          </Row>
        </Rows>
        <Text size="14pt" weight="semibold">
          {name}
        </Text>
      </Fragment>
    ),
    [getTitleColor, name, title, titleIconConfig?.icon, titleIconConfig?.space],
  );

  const rightColumn = useMemo(
    () => (
      <Fragment>
        <Text size="12pt" weight="semibold" align="right" color="labelTertiary">
          {/* TODO: create truncation component to handle all cases */}
          {`${balance?.display?.slice(0, 22)}${
            (balance?.display?.length || 0) > 22 ? '...' : ''
          }`}
        </Text>
        <Text
          size="14pt"
          weight="semibold"
          align="right"
          color={getNativeDisplayColor()}
        >
          {getNativeDisplay()}
        </Text>
      </Fragment>
    ),
    [balance?.display, getNativeDisplay, getNativeDisplayColor],
  );

  return (
    <CoinRow
      uniqueId={uniqueId as UniqueId}
      symbol={symbolToDisplay}
      leftColumn={leftColumn}
      rightColumn={rightColumn}
    />
  );
}
