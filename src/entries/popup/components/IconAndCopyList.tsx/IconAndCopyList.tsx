import React from 'react';

import {
  Box,
  Inline,
  Row,
  Rows,
  Separator,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

export interface IconAndCopyItem {
  icon: {
    symbol: SymbolProps['symbol'];
    color: SymbolProps['color'];
  };
  copy: string;
}

export function IconAndCopyList({
  iconAndCopyList,
}: {
  iconAndCopyList: IconAndCopyItem[];
}) {
  return (
    <Rows alignHorizontal="center" alignVertical="top" space="20px">
      {iconAndCopyList?.map(({ icon, copy }, i) => (
        <>
          <Row key={icon?.symbol}>
            <Inline wrap={false} space="16px" alignVertical="center">
              <Box display="flex" alignItems="center">
                <Symbol
                  symbol={icon.symbol}
                  size={18}
                  color={icon.color}
                  weight="semibold"
                />
              </Box>
              <Text size="14pt" weight="medium" color="label">
                {copy}
              </Text>
            </Inline>
          </Row>
          {i < iconAndCopyList.length - 1 && (
            <Row key={`${icon?.symbol}-sep`}>
              <Box style={{ width: '148px' }}>
                <Separator color="separatorTertiary" strokeWeight="1px" />
              </Box>
            </Row>
          )}
        </>
      ))}
    </Rows>
  );
}
