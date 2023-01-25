import React from 'react';

import { Box, Symbol } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';
import { Space } from '~/design-system/styles/designTokens';

export function Checkbox({
  selected,
  onClick,
  borderRadius,
  width,
  height,
}: {
  selected: boolean;
  onClick?: () => void;
  borderRadius?: BoxStyles['borderRadius'];
  width?: Space;
  height?: Space;
}) {
  return (
    <Box
      borderRadius={borderRadius || '28px'}
      background={selected ? 'accent' : 'transparent'}
      borderColor={selected ? 'accent' : 'separatorSecondary'}
      borderWidth="1px"
      alignItems="center"
      justifyContent="center"
      display="flex"
      onClick={onClick}
      style={{
        width: width || '18px',
        height: height || '18px',
      }}
    >
      {selected && (
        <Symbol symbol="checkmark" size={8} color="label" weight="bold" />
      )}
    </Box>
  );
}
