import React, { ReactNode } from 'react';

import { ParsedAddressAsset, ParsedAsset } from '~/core/types/assets';
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
  asset,
  symbol,
  topRow,
  bottomRow,
}: {
  asset?: ParsedAsset | ParsedAddressAsset;
  symbol?: string;
  topRow: ReactNode;
  bottomRow: ReactNode;
}) {
  return (
    <Box style={{ height: '52px' }}>
      <RowHighlightWrapper>
        <Inset horizontal="12px" vertical="8px">
          <Rows>
            <Row>
              <Columns alignVertical="center">
                <Column width="content">
                  <CoinIcon asset={asset} symbol={symbol} />
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
