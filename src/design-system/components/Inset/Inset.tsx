import React, { ReactNode } from 'react';

import { Space } from '../../styles/designTokens';
import { Box } from '../Box/Box';

interface InsetProps {
  space?: Space;
  horizontal?: Space;
  vertical?: Space;
  top?: Space;
  bottom?: Space;
  left?: Space;
  right?: Space;
  children?: ReactNode;
}

export function Inset({
  children,
  space,
  horizontal,
  vertical,
  top,
  bottom,
  left,
  right,
}: InsetProps) {
  return (
    <Box
      paddingTop={top ?? vertical ?? space}
      paddingBottom={bottom ?? vertical ?? space}
      paddingLeft={left ?? horizontal ?? space}
      paddingRight={right ?? horizontal ?? space}
    >
      {children}
    </Box>
  );
}
