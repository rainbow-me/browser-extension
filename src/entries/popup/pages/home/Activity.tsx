import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction, TransactionType } from '~/core/types/transactions';
import { formatCurrency, formatNumber } from '~/core/utils/formatNumber';
import { Box, Inline, Inset, Symbol, Text } from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Lens } from '~/design-system/components/Lens/Lens';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { TextStyles } from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import {
  CoinIcon,
  NFTIcon,
  TwoCoinsIcon,
} from '../../components/CoinIcon/CoinIcon';
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

const activityTypeIcon: Record<TransactionType, SymbolName> = {
  airdrop: 'shippingbox',
  approve: 'checkmark.circle',
  contract_interaction: 'doc.plaintext',
  receive: 'arrow.down',
  send: 'paperplane.fill',
  swap: 'arrow.triangle.swap',
  bid: 'plus.app',
  burn: 'flame',
  mint: 'sparkle',
  purchase: 'bag',
  sale: 'tag',
  wrap: 'gift',
  unwrap: 'gift',
  cancel: 'xmark.circle',
  repay: 'arrow.turn.up.right',
  bridge: 'arrow.turn.up.right',
  stake: 'arrow.turn.left.down',
  unstake: 'arrow.turn.right.up',
  withdraw: 'arrow.turn.right.up',
  deposit: 'arrow.turn.left.down',
  //
  revoke: 'minus.circle',
  speed_up: 'hare',
  claim: 'arrow.down',
  borrow: 'arrow.down',
  deployment: 'arrow.down',
};

const ActivityTypeIcon = ({
  transaction: { status, type },
}: {
  transaction: Pick<RainbowTransaction, 'status' | 'type'>;
}) => {
  let symbol = activityTypeIcon[type];
  let color: SymbolProps['color'] = 'labelTertiary';

  if (status === 'pending') return <Spinner size={9} color="accent" />;
  if (status === 'failed') {
    symbol = 'xmark.circle';
    color = 'red';
  }

  if (!symbol) return null;

  return <Symbol symbol={symbol} color={color} size={9} weight="semibold" />;
};

const ActivityIcon = ({ transaction }: { transaction: RainbowTransaction }) => {
  const changes = transaction.changes || [];
  if (transaction.type === 'swap' && !!changes[0] && !!changes[1])
    return <TwoCoinsIcon under={changes[0].asset} over={changes[1].asset} />;

  if (transaction.asset?.type === 'nft')
    return <NFTIcon asset={transaction.asset} size={36} badge />;

  const asset = transaction.asset;
  if (asset) return <CoinIcon asset={asset} fallbackText={asset.symbol} />;

  return (
    <Box position="relative">
      <ContractInteractionIcon />
      {transaction.chainId !== ChainId.mainnet && (
        <Box position="absolute" bottom="0" style={{ zIndex: 2, left: '-6px' }}>
          <ChainBadge chainId={transaction.chainId} shadow size="16" />
        </Box>
      )}
    </Box>
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

  const description = transaction.description;

  const titleColor = useMemo((): TextStyles['color'] => {
    if (status === 'pending') return 'blue';
    return type === 'swap' ? 'purple' : 'labelTertiary';
  }, [status, type]);

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
            <Inline space="4px">
              <Box style={{ width: 9, height: 9 }}>
                <Inline
                  height="full"
                  alignHorizontal="center"
                  alignVertical="center"
                >
                  <ActivityTypeIcon transaction={transaction} />
                </Inline>
              </Box>
              <Text
                size="12pt"
                weight="semibold"
                align="right"
                color="labelTertiary"
              >
                {truncateString(title, 20)}
              </Text>
            </Inline>

            <TextOverflow size="14pt" weight="semibold" width={220}>
              {description}
            </TextOverflow>
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            justifyContent="center"
            gap="8px"
          >
            <Text color={titleColor} size="12pt" weight="semibold">
              {formatNumber(transaction.value)}
            </Text>
            <TextOverflow
              size="14pt"
              weight="semibold"
              align="right"
              color={nativeDisplayColor}
            >
              {formatCurrency(transaction.native?.amount || 0)}
            </TextOverflow>
          </Box>
        </Box>
      </Box>
    </Lens>
  );
});

ActivityRow.displayName = 'ActivityRow';

const ContractInteractionIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
    >
      <g clipPath="url(#clip0_13282_489340)">
        <path
          d="M30 23.6C30 25.8402 30 26.9603 29.564 27.816C29.1805 28.5686 28.5686 29.1805 27.816 29.564C26.9603 30 25.8402 30 23.6 30H12.4C10.1598 30 9.03969 30 8.18404 29.564C7.43139 29.1805 6.81947 28.5686 6.43597 27.816C6 26.9603 6 25.8402 6 23.6V12.4C6 10.1598 6 9.03969 6.43597 8.18404C6.81947 7.43139 7.43139 6.81947 8.18404 6.43597C9.03969 6 10.1598 6 12.4 6H23.6C25.8402 6 26.9603 6 27.816 6.43597C28.5686 6.81947 29.1805 7.43139 29.564 8.18404C30 9.03969 30 10.1598 30 12.4V23.6Z"
          fill="#F5F8FF"
          fillOpacity="0.12"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.5 0C12.6716 0 12 0.671573 12 1.5C12 2.32843 12.6716 3 13.5 3H22.5C23.3284 3 24 2.32843 24 1.5C24 0.671573 23.3284 0 22.5 0H13.5ZM3 13.5C3 12.6716 2.32843 12 1.5 12C0.671573 12 0 12.6716 0 13.5V22.5C0 23.3284 0.671573 24 1.5 24C2.32843 24 3 23.3284 3 22.5L3 13.5ZM0 8.5C0 3.80558 3.80558 0 8.5 0C9.32843 0 10 0.671573 10 1.5C10 2.32843 9.32843 3 8.5 3C5.46243 3 3 5.46243 3 8.5C3 9.32843 2.32843 10 1.5 10C0.671573 10 0 9.32843 0 8.5ZM27.5 0C32.1944 0 36 3.80558 36 8.5C36 9.32843 35.3284 10 34.5 10C33.6716 10 33 9.32843 33 8.5C33 5.46243 30.5376 3 27.5 3C26.6716 3 26 2.32843 26 1.5C26 0.671573 26.6716 0 27.5 0ZM8.5 36C3.80558 36 0 32.1944 0 27.5C0 26.6716 0.671573 26 1.5 26C2.32843 26 3 26.6716 3 27.5C3 30.5376 5.46243 33 8.5 33C9.32843 33 10 33.6716 10 34.5C10 35.3284 9.32843 36 8.5 36ZM36 27.5C36 32.1944 32.1944 36 27.5 36C26.6716 36 26 35.3284 26 34.5C26 33.6716 26.6716 33 27.5 33C30.5376 33 33 30.5376 33 27.5C33 26.6716 33.6716 26 34.5 26C35.3284 26 36 26.6716 36 27.5ZM34.5 12C35.3284 12 36 12.6716 36 13.5V22.5C36 23.3284 35.3284 24 34.5 24C33.6716 24 33 23.3284 33 22.5V13.5C33 12.6716 33.6716 12 34.5 12ZM13.5 33C12.6716 33 12 33.6716 12 34.5C12 35.3284 12.6716 36 13.5 36H22.5C23.3284 36 24 35.3284 24 34.5C24 33.6716 23.3284 33 22.5 33H13.5Z"
          fill="#F5F8FF"
          fillOpacity="0.12"
        />
      </g>
      <defs>
        <clipPath id="clip0_13282_489340">
          <rect width="36" height="36" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
