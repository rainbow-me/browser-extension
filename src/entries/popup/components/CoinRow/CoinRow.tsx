import React, { ReactNode } from 'react';

import { UniqueId } from '~/core/types/assets';
import { Box, Column, Columns, Inset, Row, Rows } from '~/design-system';
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
  topRow,
  bottomRow,
  symbol,
  uniqueId,
}: {
  topRow: ReactNode;
  bottomRow: ReactNode;
  symbol?: string;
  uniqueId: UniqueId;
}) {
  return (
    <Box style={{ height: '52px' }}>
      <RowHighlightWrapper>
        <Inset horizontal="20px" vertical="8px">
          <Rows>
            <Row>
              <Columns alignVertical="center">
                <Column width="content">
                  <CoinIcon symbol={symbol} uniqueId={uniqueId} />
                </Column>
                <Column>
                  <Rows>
                    <Row>{topRow}</Row>
                    <Row>{bottomRow}</Row>
                  </Rows>
                </Column>
              </Columns>
            </Row>
          </Rows>
        </Inset>
      </RowHighlightWrapper>
    </Box>
  );
}
