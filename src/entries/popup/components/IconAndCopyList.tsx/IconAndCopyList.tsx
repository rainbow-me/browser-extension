import React from 'react';

import { Box, Inline, Rows, Symbol, Text } from '~/design-system';
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
    <Box paddingHorizontal="8px">
      <Rows alignVertical="top" space="40px">
        {iconAndCopyList?.map(({ icon, copy }) => (
          <Inline
            key={icon?.symbol}
            space="16px"
            wrap={false}
            alignVertical="center"
          >
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
        ))}
      </Rows>
    </Box>
  );
}
