import { ReactNode } from 'react';

import { Box, Text } from '~/design-system';
import { TextColor } from '~/design-system/styles/designTokens';

type StatusPillProps = {
  status: 'pending' | 'failed' | 'confirmed';
  title: string;
  icon?: ReactNode;
};

const statusColor = {
  pending: 'blue',
  failed: 'red',
  confirmed: 'label',
} satisfies Record<StatusPillProps['status'], TextColor>;

export function StatusPill({ status, title, icon }: StatusPillProps) {
  const color = statusColor[status];

  return (
    <Box
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
      {icon}
      <Text weight="bold" color={color} size="12pt">
        {title}
      </Text>
    </Box>
  );
}
