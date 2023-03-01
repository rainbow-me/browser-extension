import React, { ReactNode } from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Inset } from '~/design-system';

import {
  swapTokenInputHighlightWrapperStyleDark,
  swapTokenInputHighlightWrapperStyleLight,
} from '../../SwapTokenInput.css';

export const RowHighlightWrapper = ({ children }: { children: ReactNode }) => {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <Inset>
      <Box
        borderRadius="12px"
        className={
          currentTheme === 'dark'
            ? swapTokenInputHighlightWrapperStyleDark
            : swapTokenInputHighlightWrapperStyleLight
        }
      >
        {children}
      </Box>
    </Inset>
  );
};
