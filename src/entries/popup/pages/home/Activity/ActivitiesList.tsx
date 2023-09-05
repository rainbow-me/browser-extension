import { motion } from 'framer-motion';

import {
  RainbowTransaction,
  TransactionStatus,
} from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { truncateString } from '~/core/utils/strings';
import { Box, Inline, Inset, Text } from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { TextColor } from '~/design-system/styles/designTokens';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';
import { SpinnerRow } from '~/entries/popup/components/SpinnerRow/SpinnerRow';

import { useActivityShortcuts } from '../../../hooks/useActivityShortcuts';
import useInfiniteTransactionList from '../../../hooks/useInfiniteTransactionList';
import { useRainbowNavigate } from '../../../hooks/useRainbowNavigate';
import { ROUTES } from '../../../urls';
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
  const containerRef = useContainerRef();

  useActivityShortcuts();

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
            const tx = transactions[index];
            const isLabel = typeof tx === 'string';
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
                paddingHorizontal="20px"
              >
                {isLabel ? (
                  <Inset top="16px" bottom="8px">
                    <Text size="14pt" weight="semibold" color="labelTertiary">
                      {tx}
                    </Text>
                  </Inset>
                ) : (
                  <ActivityContextMenu transaction={tx}>
                    <Box paddingVertical="4px">
                      <ActivityRow transaction={tx} />
                    </Box>
                  </ActivityContextMenu>
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
  const { type, to, direction } = transaction;
  let description = transaction.description;
  let tag: string | undefined;
  if (type === 'contract_interaction' && to) {
    description = truncateAddress(to);
    tag = transaction.description;
  }

  const nftChangesAmount = transaction.changes
    ?.filter((c) => c?.asset.type === 'nft' && c.direction !== direction)
    .filter(Boolean).length;
  if (nftChangesAmount) tag = nftChangesAmount.toString();

  return (
    <Inline space="4px" alignVertical="center">
      <TextOverflow size="14pt" weight="semibold" maxWidth={150}>
        {description}
      </TextOverflow>
      {tag && (
        <Box
          paddingHorizontal="5px"
          paddingVertical="4px"
          marginVertical="-3px"
          borderColor="separatorSecondary"
          borderRadius="6px"
          borderWidth="1px"
        >
          <Text
            size="11pt"
            weight="semibold"
            align="right"
            color="labelTertiary"
          >
            {truncateString(tag, 25)}
          </Text>
        </Box>
      )}
    </Inline>
  );
};

function ActivityRow({ transaction }: { transaction: RainbowTransaction }) {
  const navigate = useRainbowNavigate();

  return (
    <Lens
      borderRadius="12px"
      marginHorizontal="-12px"
      forceAvatarColor
      onClick={() =>
        navigate(
          ROUTES.ACTIVITY_DETAILS(transaction.chainId, transaction.hash),
          { state: { skipTransitionOnRoute: ROUTES.HOME } },
        )
      }
    >
      <Box
        style={{ height: '52px' }}
        display="flex"
        alignItems="center"
        gap="8px"
        paddingHorizontal="12px"
        paddingVertical="8px"
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
            <ActivityDescription transaction={transaction} />
          </Box>

          <ActivityValue transaction={transaction} />
        </Box>
      </Box>
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
