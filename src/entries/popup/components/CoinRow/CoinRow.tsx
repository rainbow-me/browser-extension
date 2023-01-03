import React, { ReactNode } from 'react';

import { ParsedAddressAsset, ParsedAsset } from '~/core/types/assets';
import { Box, Column, Columns, Inset, Row, Rows } from '~/design-system';

import { CoinIcon } from '../CoinIcon/CoinIcon';

import { rowHighlightWrapperStyle } from './CoinRow.css';

function RowHighlightWrapper({ children }: { children: ReactNode }) {
  return (
    <Inset horizontal="8px">
      <Box borderRadius="12px" className={rowHighlightWrapperStyle}>
        {children}
      </Box>
    </Inset>
  );
}

export function CoinRow({
  asset,
  fallbackText,
  topRow,
  bottomRow,
}: {
  asset?: ParsedAsset | ParsedAddressAsset | null;
  fallbackText?: string;
  topRow: ReactNode;
  bottomRow: ReactNode;
}) {
  return (
    <Box style={{ height: '52px' }}>
      <RowHighlightWrapper>
        <Inset horizontal="12px" vertical="8px">
          <Rows>
            <Row>
              <Columns alignVertical="center" space="8px">
                <Column width="content">
                  <CoinIcon asset={asset} fallbackText={fallbackText} />
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
