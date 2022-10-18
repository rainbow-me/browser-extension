import React, { ReactNode } from 'react';
import { Space } from '../../styles/designTokens';
import { Box } from '../Box/Box';

const alignHorizontalToAlignItems = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end',
  stretch: 'stretch',
} as const;
type AlignHorizontal = keyof typeof alignHorizontalToAlignItems;

interface StackProps {
  space?: Space;
  alignHorizontal?: AlignHorizontal;
  children?: ReactNode;
}

export function Stack({ children, alignHorizontal, space }: StackProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={
        alignHorizontal && alignHorizontalToAlignItems[alignHorizontal]
      }
      gap={space}
    >
      {children}
    </Box>
  );
}
