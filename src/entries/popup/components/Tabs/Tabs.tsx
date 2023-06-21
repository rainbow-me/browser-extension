import * as React from 'react';

import { Box, Inline, Inset, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

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
  tabIndex,
}: {
  active?: boolean;
  onClick?: () => void;
  symbol?: SymbolProps['symbol'];
  text: string;
  tabIndex?: number;
}) {
  return (
    /* TODO: Convert to <Rows> */
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      onClick={onClick}
      style={{ cursor: 'default' }}
    >
      {/* TODO: Convert to <Row> */}
      <Box
        as="button"
        display="flex"
        alignItems="center"
        style={{ flex: 1, outlineColor: accentColorAsHsl, borderRadius: 6 }}
        className="home-tab-wrapper"
        tabIndex={tabIndex}
      >
        <Inset horizontal="2px">
          <Inline alignVertical="center" space="4px">
            {symbol && (
              <Symbol
                color={active ? 'label' : 'labelTertiary'}
                symbol={symbol}
                size={14}
                weight="semibold"
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
      <Box
        display="flex"
        alignItems="flex-end"
        style={{ height: '12px', width: '100%' }}
      >
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
