/* eslint-disable react/jsx-props-no-spreading */
import { CSSProperties, useState } from 'react';

import { RainbowTransaction } from '~/core/types/transactions';
import { Box, Text } from '~/design-system';
import { backgroundColorsVars } from '~/design-system/styles/core.css';
import { TextColor } from '~/design-system/styles/designTokens';

import { ActivityIcon } from './ActivityIcon';
import { pendingDashLenght, pendingStyle } from './ActivityPill.css';

type Size = { width: number; height: number };
const PendingIndicator = ({
  width,
  height,
  padding,
}: Size & { padding: number }) => {
  const borderWidth = 2;
  const borders = borderWidth * 2;
  const paddings = padding * 2;
  const adjustedHeight = height + borders + paddings;
  const adjustedWidth = width + paddings;
  const radius = adjustedHeight / 2;
  const props = {
    rx: radius,
    strokeWidth: borderWidth,
    x: borderWidth,
    y: borderWidth,
    width: adjustedWidth,
    height: adjustedHeight,
    fill: 'transparent',
  };
  const [totalLength, setTotalLength] = useState<number>();
  return (
    <svg
      height={adjustedHeight + borders}
      width={adjustedWidth + borders}
      opacity={totalLength ? 1 : 0}
      style={
        totalLength
          ? ({
              ['--activity-pill-pending-dashArray-gap']:
                totalLength - pendingDashLenght,
            } as CSSProperties)
          : undefined
      }
    >
      <rect
        ref={(n) => setTotalLength(n?.getTotalLength())}
        stroke={backgroundColorsVars.fillSecondary}
        {...props}
      />
      <rect
        stroke={backgroundColorsVars.blue}
        className={pendingStyle}
        {...props}
      />
    </svg>
  );
};

const statusColor = {
  pending: 'blue',
  failed: 'red',
  confirmed: 'label',
} satisfies Record<RainbowTransaction['status'], TextColor>;

export function ActivityPill({
  transaction,
}: {
  transaction: RainbowTransaction;
}) {
  const { status, title } = transaction;
  const color = statusColor[status];

  const [size, setSize] = useState<Size | null>(null);

  return (
    <Box position="relative">
      {status === 'pending' && size && (
        <Box position="absolute" style={{ top: -5, left: -5 }}>
          <PendingIndicator
            width={size.width}
            height={size.height}
            padding={2}
          />
        </Box>
      )}
      <Box
        ref={(n) => {
          if (!n || !!size) return;
          setSize({ width: n.clientWidth, height: n.clientHeight });
        }}
        display="flex"
        alignItems="center"
        gap="6px"
        paddingHorizontal="10px"
        paddingVertical="5px"
        borderRadius="round"
        background="fillHorizontal"
        borderColor={status === 'failed' ? 'red' : 'buttonStroke'}
        borderWidth="1px"
      >
        <ActivityIcon transaction={transaction} size={20} badge={false} />
        <Text weight="bold" color={color} size="12pt">
          {title}
        </Text>
      </Box>
    </Box>
  );
}
