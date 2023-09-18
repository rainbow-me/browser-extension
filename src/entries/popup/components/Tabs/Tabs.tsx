import * as React from 'react';

import { Box, Inline, Inset, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

function Tabs({ children }: { children: React.ReactNode }) {
  return (
    <Inline alignVertical="center" space="16px" height="full">
      {children}
    </Inline>
  );
}

function Tab({
  active,
  onClick,
  symbol,
  symbolSize = 14,
  text,
  tabIndex,
}: {
  active?: boolean;
  onClick?: () => void;
  symbol?: SymbolProps['symbol'];
  symbolSize?: number;
  text: string;
  tabIndex?: number;
}) {
  return (
    /* TODO: Convert to <Rows> */
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      height="full"
      justifyContent="flex-start"
      onClick={onClick}
      position="relative"
      style={{ cursor: 'default' }}
    >
      {/* TODO: Convert to <Row> */}
      <Box
        as="button"
        display="flex"
        alignItems="center"
        style={{ height: 22, outlineColor: accentColorAsHsl, borderRadius: 6 }}
        className="home-tab-wrapper"
        tabIndex={tabIndex}
      >
        <Inset horizontal="2px" top="2px">
          <Inline alignVertical="center" space="6px">
            {symbol && (
              <Symbol
                color={active ? 'label' : 'labelTertiary'}
                symbol={symbol}
                size={symbolSize}
                weight="bold"
              />
            )}
            <Text
              align="center"
              color={active ? 'label' : 'labelTertiary'}
              size="14pt"
              weight="bold"
            >
              {text}
            </Text>
          </Inline>
        </Inset>
      </Box>
      {/* TODO: Convert to <Row> */}
      <Box
        bottom="0"
        display="flex"
        alignItems="flex-end"
        justifyContent="flex-end"
        position="absolute"
        style={{ height: 12 }}
        width="full"
      >
        {active && (
          <Box
            background="accent"
            style={{
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
