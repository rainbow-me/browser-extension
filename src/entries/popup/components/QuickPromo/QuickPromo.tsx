import React from 'react';

import { Box, Inline, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

export const QuickPromo = ({
  textBold,
  text,
  symbol,
}: {
  textBold: string;
  text: string;
  symbol: SymbolProps['symbol'];
}) => {
  return (
    <Box background="fillSecondary" padding="12px" borderRadius="20px">
      <Inline alignVertical="center" space="6px">
        <Inline alignVertical="center" space="4px">
          <Symbol size={12} weight="bold" color="label" symbol={symbol} />
          <Text color="label" size="12pt" weight="semibold">
            {textBold}
          </Text>
        </Inline>
        <Text color="labelSecondary" size="12pt" weight="semibold">
          {text}
        </Text>
      </Inline>
    </Box>
  );
};
