import React, { ReactNode } from 'react';

import { UniqueId } from '~/core/types/assets';
import { Box, Inline, Inset, Stack } from '~/design-system';
import { transparentAccentColorAsHsl } from '~/design-system/styles/core.css';

import { useHover } from '../../hooks/useHover';
import { CoinIcon } from '../CoinIcon/CoinIcon';

function RowHighlightWrapper({ children }: { children: ReactNode }) {
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();
  return (
    <Inset horizontal="8px">
      <Box
        ref={hoverRef}
        borderRadius="12px"
        style={{
          backgroundColor: isHovered ? transparentAccentColorAsHsl : undefined,
        }}
      >
        {children}
      </Box>
    </Inset>
  );
}

export function CoinRow({
  leftColumn,
  rightColumn,
  symbol,
  uniqueId,
}: {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
  symbol?: string;
  uniqueId: UniqueId;
}) {
  return (
    <Box style={{ height: '52px' }}>
      <RowHighlightWrapper>
        <Inset horizontal="20px" vertical="8px">
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Inline space="8px">
              <CoinIcon symbol={symbol} uniqueId={uniqueId} />
              <Box display="flex" style={{ alignItems: 'center' }}>
                <Stack space="8px">{leftColumn}</Stack>
              </Box>
            </Inline>
            <Box display="flex" style={{ alignItems: 'center' }}>
              <Stack space="8px">{rightColumn}</Stack>
            </Box>
          </Box>
        </Inset>
      </RowHighlightWrapper>
    </Box>
  );
}
