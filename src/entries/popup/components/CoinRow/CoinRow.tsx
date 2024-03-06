import { ReactNode } from 'react';

import { ParsedAsset, ParsedUserAsset } from '~/core/types/assets';
import { Box, Column, Columns, Inset, Row, Rows } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';

import { CoinIcon } from '../CoinIcon/CoinIcon';

function RowHighlightWrapper({ children }: { children: ReactNode }) {
  return (
    <Inset horizontal="8px">
      <Lens borderRadius="12px" forceAvatarColor>
        <Box borderRadius="12px" className={rowTransparentAccentHighlight}>
          {children}
        </Box>
      </Lens>
    </Inset>
  );
}

export function CoinRow({
  asset,
  fallbackText,
  topRow,
  bottomRow,
  testId,
}: {
  asset?: ParsedAsset | ParsedUserAsset;
  fallbackText?: string;
  topRow: ReactNode;
  bottomRow: ReactNode;
  testId?: string;
}) {
  return (
    <Box style={{ height: '52px', position: 'relative' }} testId={testId}>
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
