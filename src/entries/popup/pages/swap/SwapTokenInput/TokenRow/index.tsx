import React, { ReactNode, useMemo } from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Inset } from '~/design-system';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';

import {
  swapTokenInputHighlightWrapperStyleDark,
  swapTokenInputHighlightWrapperStyleLight,
} from '../../SwapTokenInput.css';

import { TokenToReceiveRow, TokenToReceiveRowProps } from './TokenToReceiveRow';
import { TokenToSwapRow, TokenToSwapRowProps } from './TokenToSwapRow';

const RowHighlightWrapper = ({ children }: { children: ReactNode }) => {
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

type TokenRowProps = { type: 'toReceive' | 'toSwap' };

export function TokenRow({
  type,
  ...props
}: TokenRowProps & (TokenToReceiveRowProps | TokenToSwapRowProps)) {
  const row = useMemo(() => {
    switch (type) {
      case 'toReceive':
        return (
          <TokenToReceiveRow asset={(props as TokenToReceiveRowProps)?.asset} />
        );
      case 'toSwap':
        return (
          <TokenToSwapRow uniqueId={(props as TokenToSwapRowProps)?.uniqueId} />
        );
    }
  }, [props, type]);
  return (
    <Box
      className={rowTransparentAccentHighlight}
      borderRadius="12px"
      style={{ height: '52px' }}
    >
      <RowHighlightWrapper>{row}</RowHighlightWrapper>
    </Box>
  );
}
