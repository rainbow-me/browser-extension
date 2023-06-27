import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React, { ReactNode, useMemo } from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Inline, TextOverflow, ThemeProvider } from '~/design-system';
import { AlignHorizontal } from '~/design-system/components/Inline/Inline';
import { TextStyles } from '~/design-system/styles/core.css';

const { innerWidth: windowWidth } = window;

export const Tooltip = ({
  align,
  alignOffset,
  children,
  text,
  textSize,
  textWeight,
  textColor,
  arrowAlignment = 'center',
  open,
}: {
  children: ReactNode;
  text: string;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  arrowAlignment?: 'left' | 'center' | 'right';
  textSize?: TextStyles['fontSize'];
  textWeight?: TextStyles['fontWeight'];
  textColor?: TextStyles['color'];
  open?: boolean;
}) => {
  const { currentTheme } = useCurrentThemeStore();

  const { alignHorizontal, left, right } = useMemo(() => {
    switch (arrowAlignment) {
      case 'left':
        return {
          alignHorizontal: 'left' as AlignHorizontal,
          left: 6,
          right: undefined,
        };
      case 'center':
        return {
          alignHorizontal: 'center' as AlignHorizontal,
          left: undefined,
          right: undefined,
        };
      case 'right':
        return {
          alignHorizontal: 'right' as AlignHorizontal,
          left: undefined,
          right: 6,
        };
    }
  }, [arrowAlignment]);

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            align={align}
            className="TooltipContent"
            sideOffset={10}
            alignOffset={alignOffset}
          >
            <ThemeProvider theme={currentTheme}>
              <Box
                style={{ maxWidth: windowWidth - 60 }}
                borderRadius="6px"
                boxShadow="24px"
              >
                <Inline alignHorizontal={alignHorizontal}>
                  <Box
                    background="surfaceSecondaryElevated"
                    backdropFilter="blur(26px)"
                    position="absolute"
                    borderRadius="2px"
                    marginBottom="-3px"
                    bottom="0"
                    style={{
                      height: 10,
                      width: 10,
                      rotate: '45deg',
                      left,
                      right,
                    }}
                  />
                </Inline>
                <Box
                  background="surfaceSecondaryElevated"
                  padding="7px"
                  borderRadius="6px"
                  backdropFilter="blur(26px)"
                >
                  <TextOverflow
                    color={textColor || 'label'}
                    size={textSize || '16pt'}
                    weight={textWeight || 'bold'}
                  >
                    {text}
                  </TextOverflow>
                </Box>
              </Box>
            </ThemeProvider>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
