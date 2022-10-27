import * as React from 'react';

import { Box, Inline, Inset, Text } from '~/design-system';

import { SFSymbol, SFSymbolProps } from '../SFSymbol/SFSymbol';

function Tabs({ children }: { children: React.ReactNode }) {
  return (
    <Inline space="20px" height="full">
      {children}
    </Inline>
  );
}

function Tab({
  active,
  onClick,
  symbol,
  text,
}: {
  active?: boolean;
  onClick?: () => void;
  symbol?: SFSymbolProps['symbol'];
  text: string;
}) {
  return (
    /* TODO: Convert to <Rows> */
    <Box
      onClick={onClick}
      style={{
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* TODO: Convert to <Row> */}
      <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Inset horizontal="2px">
          <Inline alignVertical="center" space="4px">
            {symbol && (
              <SFSymbol
                color={active ? 'label' : 'labelTertiary'}
                symbol={symbol}
                size={14}
              />
            )}
            <Text
              color={active ? 'label' : 'labelTertiary'}
              size="16pt"
              weight="semibold"
            >
              {text}
            </Text>
          </Inline>
        </Inset>
      </Box>
      {/* TODO: Convert to <Row> */}
      <Box style={{ display: 'flex', alignItems: 'flex-end', height: '12px' }}>
        {active && (
          <Box
            background="accent"
            style={{
              marginBottom: -1,
              height: 2,
              width: '100%',
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
            }}
          />
        )}
      </Box>
    </Box>
  );
}

Tabs.Tab = Tab;

export { Tabs };
