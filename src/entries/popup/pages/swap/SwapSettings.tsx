import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { Source } from '@rainbow-me/swaps';
import { motion } from 'framer-motion';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import Logo0x from 'static/assets/dex/0x.png';
import Logo1Inch from 'static/assets/dex/1inch.png';
import LogoRainbow from 'static/assets/dex/rainbow.png';
import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import {
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';

interface SwapRouteDropdownMenuProps {
  accentColor?: string;
  children: ReactNode;
  setSource: (source: Source | 'auto') => void;
  source: Source | 'auto';
}

const SwapRouteDropdownMenu = ({
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
          <DropdownMenuRadioItem highlightAccentColor value="auto">
            <Box id="settings-link">
              <Inline alignVertical="center" space="8px">
                <Box style={{ height: '16px', width: '16px' }}>
                  <img src={LogoRainbow} width="100%" height="100%" />
                </Box>
                <Text size="14pt" weight="semibold">
                  {'Auto'}
                </Text>
              </Inline>
            </Box>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            highlightAccentColor
            value={Source.Aggregator0x}
          >
            <Inline alignVertical="center" space="8px">
              <Box style={{ height: '16px', width: '16px' }}>
                <img src={Logo0x} width="100%" height="100%" />
              </Box>
              <Text size="14pt" weight="semibold">
                {'0x'}
              </Text>
            </Inline>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            highlightAccentColor
            value={Source.Aggregotor1inch}
          >
            <Box testId="lock">
              <Inline alignVertical="center" space="8px">
                <Box style={{ height: '16px', width: '16px' }}>
                  <img src={Logo1Inch} width="100%" height="100%" />
                </Box>
                <Text size="14pt" weight="semibold">
                  {'1inch'}
                </Text>
              </Inline>
            </Box>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface SwapSettingsProps {
  accentColor?: string;
  show: boolean;
  onDone: () => void;
}

export const SwapSettings = ({
  accentColor,
  show,
  onDone,
}: SwapSettingsProps) => {
  const [toggleChecked, setToggleChecked] = useState(false);
  const [source, setSource] = useState<Source | 'auto'>('auto');

  const sourceLogo = useMemo(() => {
    switch (source) {
      case 'auto':
        return LogoRainbow;
      case Source.Aggregator0x:
        return Logo0x;
      case Source.Aggregotor1inch:
        return Logo1Inch;
    }
  }, [source]);

  return (
    <BottomSheet background="scrim" show={show}>
      <AccentColorProviderWrapper color={accentColor}>
        <Box paddingHorizontal="20px" paddingBottom="20px">
          <Stack space="10px">
            <Box>
              <Box style={{ height: '64px' }}>
                <Inline
                  height="full"
                  alignVertical="center"
                  alignHorizontal="center"
                >
                  <Text align="center" color="label" size="14pt" weight="heavy">
                    Swap Settings
                  </Text>
                </Inline>
              </Box>
              <Stack space="12px">
                <Box style={{ height: '32px' }}>
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="7px">
                      <Text color="label" size="14pt" weight="semibold">
                        Route swaps via
                      </Text>
                      <ButtonSymbol
                        symbol="info.circle.fill"
                        color="labelQuaternary"
                        height="28px"
                        variant="transparent"
                        onClick={() => null}
                      />
                    </Inline>
                    <SwapRouteDropdownMenu
                      accentColor={accentColor}
                      source={source}
                      setSource={setSource}
                    >
                      <Box
                        as={motion.div}
                        initial={{ zIndex: 0 }}
                        whileHover={{
                          scale: transformScales['1.04'],
                        }}
                        whileTap={{
                          scale: transformScales['0.96'],
                        }}
                        transition={transitions.bounce}
                        style={{ height: '23px' }}
                      >
                        <Inline
                          height="full"
                          space="4px"
                          alignVertical="center"
                        >
                          <Box style={{ height: '16px', width: '16px' }}>
                            <img src={sourceLogo} width="100%" height="100%" />
                          </Box>
                          <Text color="label" size="14pt" weight="semibold">
                            {source}
                          </Text>
                          <Symbol
                            size={12}
                            symbol="chevron.down"
                            weight="semibold"
                          />
                        </Inline>
                      </Box>
                    </SwapRouteDropdownMenu>
                  </Inline>
                </Box>

                <Box style={{ height: '32px' }}>
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="7px">
                      <Text color="label" size="14pt" weight="semibold">
                        Use Flashbots
                      </Text>
                      <ButtonSymbol
                        symbol="info.circle.fill"
                        color="labelQuaternary"
                        height="28px"
                        variant="transparent"
                        onClick={() => null}
                      />
                    </Inline>
                    <Toggle
                      accentColor={accentColor}
                      checked={toggleChecked}
                      handleChange={setToggleChecked}
                    />
                  </Inline>
                </Box>

                <Box style={{ height: '32px' }}>
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="7px">
                      <Text color="label" size="14pt" weight="semibold">
                        Max slippage
                      </Text>
                      <ButtonSymbol
                        symbol="info.circle.fill"
                        color="labelQuaternary"
                        height="28px"
                        variant="transparent"
                        onClick={() => null}
                      />
                    </Inline>
                    <Toggle
                      accentColor={accentColor}
                      checked={toggleChecked}
                      handleChange={setToggleChecked}
                    />
                  </Inline>
                </Box>
              </Stack>
            </Box>
            <Box width="full">
              <Button
                width="full"
                color="fillSecondary"
                height="28px"
                variant="plain"
              >
                <Text
                  align="center"
                  color="labelSecondary"
                  size="14pt"
                  weight="bold"
                >
                  Use defaults
                </Text>
              </Button>
            </Box>
            <Box style={{ width: '102px' }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
            <Box width="full" paddingTop="20px">
              <Button
                width="full"
                color="accent"
                height="44px"
                variant="flat"
                onClick={onDone}
              >
                <Text align="center" color="label" size="16pt" weight="bold">
                  Done
                </Text>
              </Button>
            </Box>
          </Stack>
        </Box>
      </AccentColorProviderWrapper>
    </BottomSheet>
  );
};
