import { ReactNode } from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box } from '~/design-system';

import {
  addressToInputHighlightWrapperStyleDark,
  addressToInputHighlightWrapperStyleLight,
} from './ToAddressInput.css';

export const RowHighlightWrapper = ({ children }: { children: ReactNode }) => {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <Box
      borderRadius="12px"
      className={
        currentTheme === 'dark'
          ? addressToInputHighlightWrapperStyleDark
          : addressToInputHighlightWrapperStyleLight
      }
    >
      {children}
    </Box>
  );
};
