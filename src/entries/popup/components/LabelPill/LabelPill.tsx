import React from 'react';

import { Box, Inline, Text } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';

const LabelPill = ({
  label,
  dot,
  height = '24px',
  paddingHorizontal = '8px',
}: {
  label: string;
  dot?: boolean;
  height?: React.CSSProperties['height'];
  paddingHorizontal?: BoxStyles['paddingHorizontal'];
}) => (
  <Box
    alignItems="center"
    background="surfacePrimaryElevatedSecondary"
    borderRadius="round"
    display="flex"
    paddingHorizontal={paddingHorizontal}
    style={{ height }}
  >
    {dot ? (
      <Inline>
        <Box
          style={{
            marginRight: '4px',
            width: '7px',
            height: '7px',
            borderRadius: '7px',
            boxShadow: '0px 0px 10px rgba(62, 207, 91, 0.4)',
          }}
          background="green"
        />
        <Text size="12pt" weight="semibold" color="labelQuaternary">
          {label}
        </Text>
      </Inline>
    ) : (
      <Text size="12pt" weight="semibold" color="labelQuaternary">
        {label}
      </Text>
    )}
  </Box>
);

export { LabelPill };
