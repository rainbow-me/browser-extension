import React, { ReactNode } from 'react';

import { Space, spaceToNegativeSpace } from '../../styles/designTokens';
import { Box } from '../Box/Box';

interface BleedProps {
  space?: Space;
  horizontal?: Space;
  vertical?: Space;
  top?: Space;
  bottom?: Space;
  left?: Space;
  right?: Space;
  children?: ReactNode;
}

export function Bleed({
  children,
  space,
  horizontal,
  vertical,
  top,
  bottom,
  right,
  left,
}: BleedProps) {
  const topSpace = top ?? vertical ?? space;
  const bottomSpace = bottom ?? vertical ?? space;
  const leftSpace = left ?? horizontal ?? space;
  const rightSpace = right ?? horizontal ?? space;

  return (
    <Box
      marginTop={topSpace && spaceToNegativeSpace[topSpace]}
      marginBottom={bottomSpace && spaceToNegativeSpace[bottomSpace]}
      marginLeft={leftSpace && spaceToNegativeSpace[leftSpace]}
      marginRight={rightSpace && spaceToNegativeSpace[rightSpace]}
    >
      {children}
    </Box>
  );
}
