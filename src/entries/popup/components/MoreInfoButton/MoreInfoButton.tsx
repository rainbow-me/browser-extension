import React from 'react';

import { Box, Inline, Row, Rows, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { TextStyles } from '~/design-system/styles/core.css';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';

export interface MoreInfoOption {
  label: string;
  subLabel?: string;
  symbol: SymbolProps['symbol'];
  separator?: boolean;
  onSelect: (e: Event) => void;
  color?: TextStyles['color'];
}

const MoreInfoButton = ({ options }: { options: MoreInfoOption[] }) => {
  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Box
            style={{ cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Symbol
              symbol="ellipsis.circle"
              weight="bold"
              size={14}
              color="labelTertiary"
            />
          </Box>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((option) => (
            <>
              <DropdownMenuItem onSelect={option.onSelect} key={option.symbol}>
                <Inline alignVertical="center" space="10px" wrap={false}>
                  <Symbol
                    size={18}
                    symbol={option.symbol}
                    weight="semibold"
                    color={option.color}
                  />
                  <Rows space="6px">
                    <Row>
                      <Text size="14pt" weight="semibold" color={option.color}>
                        {option.label}
                      </Text>
                    </Row>

                    {option.subLabel && (
                      <Row>
                        <Text
                          size="12pt"
                          color="labelTertiary"
                          weight="regular"
                        >
                          {option.subLabel}
                        </Text>
                      </Row>
                    )}
                  </Rows>
                </Inline>
              </DropdownMenuItem>
              {option.separator && <DropdownMenuSeparator />}
            </>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Box>
  );
};

export { MoreInfoButton };
