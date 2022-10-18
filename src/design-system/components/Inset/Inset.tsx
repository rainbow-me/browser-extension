import React, { ReactNode } from 'react';
import { Space } from '../../styles/designTokens';
import { Box } from '../Box/Box';

interface InsetProps {
  space?: Space;
  children?: ReactNode;
}

export function Inset({ children, space }: InsetProps) {
  return <Box padding={space}>{children}</Box>;
}
