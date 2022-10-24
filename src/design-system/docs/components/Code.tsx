import React, { ReactNode } from 'react';
import { Box } from '../../components/Box/Box';
import { fontStyle } from './Code.css';

export const Code = ({ children }: { children: ReactNode }) => (
  <Box
    as="code"
    className={fontStyle}
    background="fillSecondary"
    borderRadius="6px"
    paddingX="4px"
  >
    {children}
  </Box>
);
