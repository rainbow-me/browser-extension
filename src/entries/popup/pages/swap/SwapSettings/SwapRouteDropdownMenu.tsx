import { Source } from '@rainbow-me/swaps';
import React, { ReactNode, useCallback } from 'react';

import { Box, Inline, Text } from '~/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';

import { aggregatorInfo } from '../utils';

interface SwapRouteDropdownMenuProps {
  accentColor?: string;
  children: ReactNode;
  setSource: (source: Source | 'auto') => void;
  source: Source | 'auto';
}

export const SwapRouteDropdownMenu = ({
  accentColor,
  children,
  source,
  setSource,
}: SwapRouteDropdownMenuProps) => {
  const onValueChange = useCallback(
    (value: Source | 'auto') => {
      setSource(value);
    },
    [setSource],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent accentColor={accentColor} marginRight="12px">
        <DropdownMenuRadioGroup
          onValueChange={(value) => onValueChange(value as Source | 'auto')}
          value={source}
        >
          <DropdownMenuRadioItem
            highlightAccentColor
            value="auto"
            selectedValue={source}
          >
            <Box testId="settings-route-context-auto">
              <Inline alignVertical="center" space="8px">
                <Box style={{ height: '16px', width: '16px' }}>
                  <img
                    src={aggregatorInfo['auto'].logo}
                    width="100%"
                    height="100%"
                  />
                </Box>
                <Text size="14pt" weight="semibold">
                  {aggregatorInfo['auto'].name}
                </Text>
              </Inline>
            </Box>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            highlightAccentColor
            value={Source.Aggregator0x}
            selectedValue={source}
          >
            <Box testId="settings-route-context-0x">
              <Inline alignVertical="center" space="8px">
                <Box style={{ height: '16px', width: '16px' }}>
                  <img
                    src={aggregatorInfo['0x'].logo}
                    width="100%"
                    height="100%"
                  />
                </Box>
                <Text size="14pt" weight="semibold">
                  {aggregatorInfo['0x'].name}
                </Text>
              </Inline>
            </Box>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            highlightAccentColor
            value={Source.Aggregator1inch}
            selectedValue={source}
          >
            <Box testId="settings-route-context-1inch">
              <Inline alignVertical="center" space="8px">
                <Box style={{ height: '16px', width: '16px' }}>
                  <img
                    src={aggregatorInfo['1inch'].logo}
                    width="100%"
                    height="100%"
                  />
                </Box>
                <Text size="14pt" weight="semibold">
                  {aggregatorInfo['1inch'].name}
                </Text>
              </Inline>
            </Box>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
