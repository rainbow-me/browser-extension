import React, { ReactNode } from 'react';
import { Space, spaceToNegativeSpace } from '../../styles/designTokens';
import { Box } from '../Box/Box';

interface BleedProps {
  space?: Space;
  children?: ReactNode;
}

export function Bleed({ children, space }: BleedProps) {
  return <Box margin={space && spaceToNegativeSpace[space]}>{children}</Box>;
}
