import React from 'react';

import { Box, Symbol } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';
import { BackgroundColor, Space } from '~/design-system/styles/designTokens';

export function Checkbox({
  selected,
  onClick,
  borderRadius,
  width,
  height,
  background = 'transparent',
  backgroundSelected = 'accent',
  borderColor = 'separatorSecondary',
  borderColorSelected = 'accent',
  testId,
}: {
  selected: boolean;
  onClick?: () => void;
  borderRadius?: BoxStyles['borderRadius'];
  width?: Space;
  height?: Space;
  borderColor?: BoxStyles['borderColor'];
  borderColorSelected?: BoxStyles['borderColor'];
  background?: 'accent' | BackgroundColor;
  backgroundSelected?: 'accent' | BackgroundColor;
  testId?: string;
}) {
  return (
    <Box
      borderRadius={borderRadius || '28px'}
      background={selected ? backgroundSelected : background}
      borderColor={selected ? borderColorSelected : borderColor}
      borderWidth="1px"
      alignItems="center"
      justifyContent="center"
      display="flex"
      onClick={onClick}
      testId={testId}
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
